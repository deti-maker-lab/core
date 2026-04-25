# apps/api/services/inventory_service.py

from datetime import datetime, timezone
from sqlmodel import Session, select
from typing import Optional, List, Dict
from db.models import EquipmentModel, Equipment
from services.snipeit.catalog import get_models
from services.snipeit.assets import list_assets, get_asset
import logging

logger = logging.getLogger(__name__)

def _parse_price(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        v = value.strip()
        if not v:
            return None
        v = v.replace(",", "") # 1,189.90 -> 1189.90
        try:
            return float(v)
        except ValueError:
            return None
    return None

def _parse_datetime(value) -> Optional[datetime]:
    if not value:
        return None
    if isinstance(value, dict):
        value = value.get("date") or value.get("datetime")
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except Exception:
        return None

def sync_catalog(session: Session) -> dict:
    """
    Fetches models from Snipe-IT and updates/inserts local EquipmentModel records.
    Returns statistics about the sync operation.
    """
    try:
        # Fetch up to a reasonable limit, or paginate if necessary.
        paginated_response = get_models(limit=500)
        
        stats = {"inserted": 0, "updated": 0, "errors": 0}
        
        for row in paginated_response.rows:
            try:
                snipe_id = row.get("id")
                name = row.get("name")
                
                if not snipe_id or not name:
                    continue
                    
                # Find existing or create new
                statement = select(EquipmentModel).where(EquipmentModel.snipeit_model_id == snipe_id)
                db_model = session.exec(statement).first()
                
                if db_model:
                    db_model.name = name
                    db_model.last_synced_at = datetime.now(timezone.utc)
                    stats["updated"] += 1
                else:
                    db_model = EquipmentModel(
                        name=name,
                        snipeit_model_id=snipe_id,
                        last_synced_at=datetime.now(timezone.utc)
                    )
                    session.add(db_model)
                    stats["inserted"] += 1
                    
            except Exception as item_ex:
                logger.error(f"Error syncing catalog item {row}: {str(item_ex)}")
                stats["errors"] += 1
                
        session.commit()
        return stats
        
    except Exception as e:
        logger.error(f"Failed to sync catalog: {str(e)}")
        raise

def list_catalog(session: Session):
    """
    Returns available models from the local DB.
    Does not initiate a sync to avoid excessive Snipe-IT calls on user catalog browsing.
    """
    statement = select(EquipmentModel).order_by(EquipmentModel.name)
    return session.exec(statement).all()

def _determine_status(a: dict) -> str:
    status_label = a.get("status_label") or {}
    status_type  = status_label.get("status_type", "")
    status_name  = (status_label.get("name") or "").lower().strip()

    if status_type == "archived":
        return "retired"
    if status_type in ("pending", "undeployable"):
        return "maintenance"
    if status_type != "deployable":
        return "maintenance"

    if "checked out" in status_name or "checked_out" in status_name:
        return "checked_out"
    if "reserved" in status_name:
        return "reserved"
    if "available" in status_name:
        return "available"

    return "available"

def list_equipment_catalog_from_snipeit(session=None):
    paginated = list_assets(limit=500)
    rows = getattr(paginated, "rows", []) or []
    result = []

    for a in rows:
        model        = a.get("model") or {}
        category     = a.get("category") or {}
        supplier     = a.get("supplier") or {}
        location     = a.get("location") or {}
        rtd_loc      = a.get("rtd_location") or {}
        status_label = a.get("status_label") or {}

        local_status = _determine_status(a)

        result.append({
            "id":              a.get("id"),
            "model_id":        model.get("id"),
            "model_name":      model.get("name"),
            "name":            a.get("name") or model.get("name") or "Unnamed",
            "asset_tag":       a.get("asset_tag"),
            "serial":          a.get("serial"),
            "category":        category.get("name"),
            "supplier":        supplier.get("name") or (model.get("manufacturer") or {}).get("name"),
            "price":           _parse_price(a.get("purchase_cost")),
            "status":          local_status,
            "snipeit_status":  status_label.get("name", "unknown"),
            "status_type":     status_label.get("status_type"),
            "location":        location.get("name") or rtd_loc.get("name"),
            "image":           a.get("image"),
            "assigned_to":     (a.get("assigned_to") or {}).get("name"),
            "available":       local_status == "available",
            "expected_checkin": (
                a.get("expected_checkin", {}).get("date")
                if isinstance(a.get("expected_checkin"), dict)
                else a.get("expected_checkin")
            ),
        })

    return result

def sync_equipment(session: Session, equipment_id: int) -> Equipment:
    db_equip = session.get(Equipment, equipment_id)
    if not db_equip or not db_equip.snipeit_asset_id:
        raise ValueError("Valid local equipment mapped to Snipe-IT not found")

    snipe_asset = get_asset(db_equip.snipeit_asset_id)
    if not snipe_asset:
        raise ValueError("Asset not found in Snipe-IT")

    if getattr(snipe_asset, "status_label", None):
        db_equip.status = snipe_asset.status_label.name.lower()

    db_equip.location = getattr(snipe_asset, "location", None) or db_equip.location
    db_equip.last_synced_at = datetime.now(timezone.utc)

    session.add(db_equip)
    session.commit()
    session.refresh(db_equip)

    return db_equip