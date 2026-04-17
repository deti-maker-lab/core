# apps/api/routers/requisitions.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from db.database import get_session
from db.models import User, EquipmentRequest, EquipmentRequestItem
from routers.schemas import RequisitionReadDetail, RequisitionItemRead

from routers.schemas import (
    RequisitionCreate, 
    RequisitionRead,
    RequisitionReject,
    RequisitionAssign,
    RequisitionReturn,
    EquipmentUsageRead
)

from auth.dependencies import require_any, require_lab_tech
import services.requisition_service as req_svc

router = APIRouter(tags=["requisitions"])

def _build_detail(session: Session, req: EquipmentRequest) -> dict:
    items = session.exec(
        select(EquipmentRequestItem).where(EquipmentRequestItem.request_id == req.id)
    ).all()
    return {
        "id": req.id,
        "project_id": req.project_id,
        "requested_by": req.requested_by,
        "status": req.status,
        "rejection_reason": req.rejection_reason,
        "approved_at": req.approved_at,
        "created_at": req.created_at,
        "items": [{"id": i.id, "model_id": i.model_id, "quantity": i.quantity} for i in items]
    }

@router.get("/requisitions", response_model=List[RequisitionReadDetail])
def list_all_requisitions(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_lab_tech)
):
    requisitions = session.exec(
        select(EquipmentRequest).order_by(EquipmentRequest.created_at.desc())
    ).all()
    return [_build_detail(session, r) for r in requisitions]

@router.get("/projects/{project_id}/requisitions", response_model=List[RequisitionReadDetail])
def list_project_requisitions(
    project_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_any)
):
    requisitions = session.exec(
        select(EquipmentRequest)
        .where(EquipmentRequest.project_id == project_id)
        .order_by(EquipmentRequest.created_at.desc())
    ).all()
    return [_build_detail(session, r) for r in requisitions]

@router.get("/requisitions/{req_id}", response_model=RequisitionReadDetail)
def get_requisition(
    req_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_any)
):
    req = session.get(EquipmentRequest, req_id)
    if not req:
        raise HTTPException(status_code=404, detail="Requisition not found")
    return _build_detail(session, req)

@router.post("/projects/{project_id}/requisitions", response_model=RequisitionRead, status_code=status.HTTP_201_CREATED)
def create_project_requisition(
    project_id: int,
    data: RequisitionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_any)
):
    try:
        items_data = [item.dict() for item in data.items]
        return req_svc.create_requisition(session, project_id, user_id=current_user.id, items_data=items_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/requisitions/{req_id}/approve", response_model=RequisitionRead)
def approve_requisition(
    req_id: int, 
    session: Session = Depends(get_session),
    current_user: User = Depends(require_lab_tech)
):
    try:
        return req_svc.approve_requisition(session, req_id, user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/requisitions/{req_id}/reject", response_model=RequisitionRead)
def reject_requisition(
    req_id: int, 
    data: RequisitionReject,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_lab_tech)
):
    try:
        return req_svc.reject_requisition(session, req_id, user_id=current_user.id, reason=data.reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/requisitions/{req_id}/assign", response_model=List[EquipmentUsageRead])
def assign_requisition_assets(
    req_id: int, 
    data: RequisitionAssign,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_lab_tech)
):
    """
    Binds concrete SnipeIT assets to a specific Requisition.
    The assets are checked out in SnipeIT immediately.
    """
    usages = []
    try:
        for item in data.items:
            usage = req_svc.assign_asset_to_requisition(
                session, 
                req_id=req_id, 
                req_item_id=item.req_item_id, 
                snipeit_asset_id=item.snipeit_asset_id, 
                user_id=current_user.id
            )
            usages.append(usage)
            
        return usages
    except Exception as e:
        # In a real system you'd want to handle partial failures or rollback SnipeIT state
        # A full saga pattern might be necessary if multi-checkout consistency is required.
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/requisitions/return", response_model=List[EquipmentUsageRead])
def return_requisition_assets(
    data: RequisitionReturn,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_lab_tech)
):
    """
    Returns specific usage records. Checks them back into SnipeIT.
    """
    usages = []
    try:
        for usage_id in data.usage_ids:
            usage = req_svc.return_asset(
                session, 
                usage_id=usage_id, 
                user_id=current_user.id, 
                note=data.note
            )
            usages.append(usage)
        return usages
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))