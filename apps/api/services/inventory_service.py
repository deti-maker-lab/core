# apps/api/services/inventory_service.py

from datetime import datetime, timezone
from sqlmodel import Session, select
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

def list_equipment_catalog_from_snipeit():
    paginated = list_assets(limit=500)
    rows = getattr(paginated, "rows", []) or []

    result = []
    for a in rows:
        model = a.get("model") or {}
        category = a.get("category") or {}
        supplier = a.get("supplier") or {}
        location = a.get("location") or {}
        status_label = a.get("status_label") or {}
        assigned_to = a.get("assigned_to")

        result.append({
            "id": a.get("id"), 
            "model_id": model.get("id"),
            "model_name": model.get("name"),
            "name": a.get("name") or model.get("name") or "Unnamed",
            "asset_tag": a.get("asset_tag"),
            "serial": a.get("serial"),
            "category": category.get("name"),
            "supplier": supplier.get("name"),
            "price": _parse_price(a.get("purchase_cost")),
            "status": status_label.get("name", "unknown"),
            "status_type": status_label.get("status_type"),
            "location": location.get("name"),
            "image": a.get("image"),
            "assigned_to": assigned_to.get("name") if isinstance(assigned_to, dict) else None,
            "available": status_label.get("status_type") == "deployable" and not assigned_to,
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