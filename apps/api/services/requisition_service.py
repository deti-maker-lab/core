# apps/api/services/requisition_service.py

from datetime import datetime, timezone
from typing import List, Dict, Tuple
from sqlmodel import Session, select
from db.models import (
    EquipmentRequest, 
    EquipmentRequestItem, 
    EquipmentUsage, 
    StatusHistory, 
    Equipment, 
    EquipmentModel,
    User,
    Project
)
from services.constants import *
from services.snipeit.assets import get_asset, checkout_asset, checkin_asset
from services.snipeit.users import get_user_by_email
from services.snipeit.exceptions import SnipeITAPIError, SnipeITAssetUnavailableError
from services.inventory_service import sync_equipment
from services.notification_service import notify_project_members
import logging

logger = logging.getLogger(__name__)

def _add_history(session: Session, entity_type: str, entity_id: int, old_status: str, new_status: str, changed_by: int, note: str = None):
    history = StatusHistory(
        entity_type=entity_type,
        entity_id=entity_id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        note=note
    )
    session.add(history)
    

def create_requisition(session: Session, project_id: int, user_id: int, items_data: List[Dict[str, int]]) -> EquipmentRequest:
    project = session.get(Project, project_id)
    if not project:
        raise ValueError("Project not found")

    req = EquipmentRequest(
        project_id=project_id,
        requested_by=user_id,
        status="pending"
    )
    session.add(req)
    session.flush()

    for item in items_data:
        snipeit_model_id = item["model_id"]
        quantity = item["quantity"]

        local_model = session.exec(
            select(EquipmentModel).where(EquipmentModel.snipeit_model_id == snipeit_model_id)
        ).first()

        if not local_model:
            from services.snipeit.catalog import get_models
            try:
                all_models = get_models(limit=500)
                snipe_model = next((r for r in all_models.rows if r.get("id") == snipeit_model_id), None)
                model_name = snipe_model.get("name", f"Model #{snipeit_model_id}") if snipe_model else f"Model #{snipeit_model_id}"
            except Exception:
                model_name = f"Model #{snipeit_model_id}"

            local_model = EquipmentModel(
                name=model_name,
                snipeit_model_id=snipeit_model_id,
            )
            session.add(local_model)
            session.flush()
            logger.info(f"Created local model for snipeit_model_id={snipeit_model_id}")

        req_item = EquipmentRequestItem(
            request_id=req.id,
            model_id=local_model.id,
            quantity=quantity
        )
        session.add(req_item)

    try:
        _add_history(session, "equipment_request", req.id, None, "pending", user_id, "Requisition created")
    except Exception as e:
        logger.warning(f"Could not write status history: {e}")

    session.commit()
    session.refresh(req)
    return req

def _build_req_description(session: Session, req: EquipmentRequest) -> str:
    """Constrói uma descrição legível dos itens da requisição."""
    from sqlmodel import select
    items = session.exec(
        select(EquipmentRequestItem).where(EquipmentRequestItem.request_id == req.id)
    ).all()

    model_names = []
    for item in items:
        model = session.get(EquipmentModel, item.model_id)
        name = model.name if model else f"Model #{item.model_id}"
        qty = f" ×{item.quantity}" if item.quantity > 1 else ""
        model_names.append(f'"{name}"{qty}')

    project = session.get(Project, req.project_id)
    project_name = project.name if project else f"Project #{req.project_id}"

    items_str = ", ".join(model_names) if model_names else "requested equipment"
    return items_str, project_name


def approve_requisition(session: Session, req_id: int, user_id: int) -> EquipmentRequest:
    req = session.get(EquipmentRequest, req_id)
    if not req:
        raise ValueError("Requisition not found")
    if req.status != "pending":
        raise ValueError("Only pending requisitions can be approved")

    project = session.get(Project, req.project_id)
    if not project or project.status not in ("approved", "active"):
        raise ValueError("Cannot approve requisition: project is not approved yet")

    old_status = req.status
    req.status = "approved"
    req.approved_at = datetime.now(timezone.utc)

    try:
        _add_history(session, "equipment_request", req.id, old_status, "approved", user_id, "Requisition approved")
    except Exception as e:
        logger.warning(f"Status history error: {e}")

    items_str, project_name = _build_req_description(session, req)
    notify_project_members(session, req.project_id,
        title="Equipment request approved",
        message=f"Your equipment request for {items_str} on project \"{project_name}\" was approved. You can pick it up at the lab!",
        type="approval",
        reference_type="equipment_request", reference_id=req.id)

    session.commit()
    session.refresh(req)
    return req


def reject_requisition(session: Session, req_id: int, user_id: int, reason: str) -> EquipmentRequest:
    req = session.get(EquipmentRequest, req_id)
    if not req:
        raise ValueError("Requisition not found")
    if req.status != "pending":
        raise ValueError("Only pending requisitions can be rejected")

    old_status = req.status
    req.status = "rejected"
    req.rejection_reason = reason

    try:
        _add_history(session, "equipment_request", req.id, old_status, "rejected", user_id, f"Rejected: {reason}")
    except Exception as e:
        logger.warning(f"Status history error: {e}")

    items_str, project_name = _build_req_description(session, req)
    notify_project_members(session, req.project_id,
        title="Equipment request rejected",
        message=f"Your equipment request for {items_str} on project \"{project_name}\" was rejected. Reason: {reason}",
        type="warning",
        reference_type="equipment_request", reference_id=req.id)

    session.commit()
    session.refresh(req)
    return req


def assign_asset_to_requisition(session: Session, req_id: int, req_item_id: int, snipeit_asset_id: int, user_id: int) -> EquipmentUsage:
    """
    Checks out an asset in Snipe-IT and links it locally.
    Uses target user from the Requisition's requestor to find them in Snipe-IT.
    """
    req = session.get(EquipmentRequest, req_id)
    if not req or req.status not in [REQ_STATUS_APPROVED, REQ_STATUS_PARTIALLY_ASSIGNED]:
        raise ValueError("Invalid requisition state for assignment")
        
    req_item = session.get(EquipmentRequestItem, req_item_id)
    if not req_item or req_item.request_id != req.id:
        raise ValueError("Invalid requisition item")
        
    # Prevent assigning more than requested
    statement = select(EquipmentUsage).where(EquipmentUsage.request_item_id == req_item.id)
    assigned_count = len(session.exec(statement).all())
    if assigned_count >= req_item.quantity:
        raise ValueError("Quantity requested already fulfilled for this item")

    # Resolve target user in Snipe-IT
    requesting_user = session.get(User, req.requested_by)
    if not requesting_user or not requesting_user.email:
        raise ValueError("Requesting user has no valid email to map to Snipe-IT")
        
    snipeit_user = get_user_by_email(requesting_user.email)
    if not snipeit_user:
        raise ValueError(f"Could not find Snipe-IT user matching email: {requesting_user.email}")
        
    # Get SnipeIT asset and verify it exists
    snipe_asset = get_asset(snipeit_asset_id)
    
    # Map Snipe-IT asset to local DB
    statement = select(Equipment).where(Equipment.snipeit_asset_id == snipeit_asset_id)
    db_equip = session.exec(statement).first()
    if not db_equip:
        # Create it if it doesn't exist
        db_equip = Equipment(
            model_id=req_item.model_id,
            snipeit_asset_id=snipeit_asset_id,
            status="available"
        )
        session.add(db_equip)
        session.flush()
        
    # Perform Snipe-IT checkout BEFORE local commit
    checkout_asset(snipeit_asset_id, snipeit_user.id, f"Checked out for Project {req.project_id}")
    
    # Update local equipment fields from Snipe-IT directly since we are assigning
    db_equip.name = snipe_asset.name
    db_equip.asset_tag = snipe_asset.asset_tag
    db_equip.serial = snipe_asset.serial
    if snipe_asset.status_label:
        db_equip.status = snipe_asset.status_label.name.lower()
        
    # Create Local Usage
    usage = EquipmentUsage(
        equipment_id=db_equip.id,
        project_id=req.project_id,
        request_item_id=req_item.id,
        status=USAGE_STATUS_ASSIGNED,
        asset_name_snapshot=snipe_asset.name,
        asset_tag_snapshot=snipe_asset.asset_tag,
        model_name_snapshot=snipe_asset.model.name if snipe_asset.model else None
    )
    session.add(usage)
    
    # Update Request status
    old_req_status = req.status
    # We should calculate if it is now fully assigned, but for now we set partially assigned
    req.status = REQ_STATUS_PARTIALLY_ASSIGNED 
    
    _add_history(session, "equipment_usage", usage.id, None, USAGE_STATUS_ASSIGNED, user_id, f"Assigned SnipeIT Asset {snipeit_asset_id}")
    
    session.commit()
    session.refresh(usage)
    return usage


def return_asset(session: Session, usage_id: int, user_id: int, note: str = None) -> EquipmentUsage:
    """
    Checks an asset back into Snipe-IT and updates local records.
    """
    usage = session.get(EquipmentUsage, usage_id)
    if not usage:
        raise ValueError("Usage record not found")
        
    if usage.status == USAGE_STATUS_RETURNED:
        raise ValueError("Asset is already returned")
        
    db_equip = session.get(Equipment, usage.equipment_id)
    if not db_equip or not db_equip.snipeit_asset_id:
        raise ValueError("Local equipment record has no Snipe-IT mapping")
        
    # Check-in to Snipe-IT
    checkin_asset(db_equip.snipeit_asset_id, note or "Returned via internal backend.")
    
    # Resync the equipment cache to reflect 'available' or whatever state Snipe-IT put it in
    try:
        sync_equipment(session, db_equip.id)
    except Exception as e:
        logger.warning(f"Failed to cleanly sync equipment {db_equip.id} post-return: {e}")
        db_equip.status = "available"
    
    # Update Local Usage
    usage.status = USAGE_STATUS_RETURNED
    usage.returned_at = datetime.now(timezone.utc)
    
    # Update Equipment
    db_equip.status = "available"
    
    _add_history(session, "equipment_usage", usage.id, USAGE_STATUS_ASSIGNED, USAGE_STATUS_RETURNED, user_id, note)
    
    # Optional: logic to check if all items for the Request are returned, to close the requisition.
    
    session.commit()
    session.refresh(usage)
    return usage

def list_all_requisitions(session: Session) -> List[EquipmentRequest]:
    return session.exec(
        select(EquipmentRequest).order_by(EquipmentRequest.created_at.desc())
    ).all()


def list_project_requisitions(session: Session, project_id: int) -> List[EquipmentRequest]:
    return session.exec(
        select(EquipmentRequest)
        .where(EquipmentRequest.project_id == project_id)
        .order_by(EquipmentRequest.created_at.desc())
    ).all()


def get_requisition(session: Session, req_id: int) -> EquipmentRequest:
    req = session.get(EquipmentRequest, req_id)
    if not req:
        raise ValueError("Requisition not found")
    return req


def get_requisition_items(session: Session, req_id: int) -> List[EquipmentRequestItem]:
    return session.exec(
        select(EquipmentRequestItem).where(EquipmentRequestItem.request_id == req_id)
    ).all()