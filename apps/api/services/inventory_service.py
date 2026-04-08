# apps/api/services/inventory_service.py

from datetime import datetime
from sqlmodel import Session, select
from db.models import EquipmentModel, Equipment
from services.snipeit.catalog import get_models
import logging

logger = logging.getLogger(__name__)

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
                    db_model.last_synced_at = datetime.utcnow()
                    stats["updated"] += 1
                else:
                    db_model = EquipmentModel(
                        name=name,
                        snipeit_model_id=snipe_id,
                        last_synced_at=datetime.utcnow()
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

def sync_equipment(session: Session, equipment_id: int) -> Equipment:
    """
    Refreshes local Equipment cache with data from Snipe-IT.
    """
    db_equip = session.get(Equipment, equipment_id)
    if not db_equip or not db_equip.snipeit_asset_id:
        raise ValueError("Valid local equipment mapped to Snipe-IT not found")
        
    from services.snipeit.assets import get_asset
    snipe_asset = get_asset(db_equip.snipeit_asset_id)
    if not snipe_asset:
         raise ValueError("Asset not found in Snipe-IT")
         
    db_equip.name = snipe_asset.name
    db_equip.asset_tag = snipe_asset.asset_tag
    db_equip.serial = snipe_asset.serial
    if snipe_asset.status_label:
        db_equip.status = snipe_asset.status_label.name.lower()
    
    db_equip.last_synced_at = datetime.utcnow()
    
    session.add(db_equip)
    session.commit()
    session.refresh(db_equip)
    
    return db_equip
