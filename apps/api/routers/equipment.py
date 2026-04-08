# apps/api/routers/equipment.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from db.database import get_session
from routers.schemas import EquipmentModelRead, EquipmentRead
from services.inventory_service import list_catalog, sync_catalog

router = APIRouter(prefix="/equipment", tags=["equipment"])

@router.get("/catalog", response_model=List[EquipmentModelRead])
def get_catalog(session: Session = Depends(get_session)):
    """
    Returns the locally cached catalog of equipment models.
    """
    models = list_catalog(session)
    return models

@router.post("/catalog/sync", status_code=status.HTTP_200_OK)
def trigger_catalog_sync(session: Session = Depends(get_session)):
    """
    Triggers an on-demand sync of Snipe-IT models to the local database.
    (In real life, restrict this to admins).
    """
    try:
        stats = sync_catalog(session)
        return {"message": "Sync completed successfully", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{equipment_id}", response_model=EquipmentRead)
def get_local_equipment(equipment_id: int, session: Session = Depends(get_session)):
    """
    Fetches real-time details of an assigned equipment asset natively from the local DB.
    """
    from db.models import Equipment
    equipment = session.get(Equipment, equipment_id)
    if not equipment:
        raise HTTPException(status_code=404, detail="Local Equipment not found")
    return equipment

@router.post("/{equipment_id}/refresh", response_model=EquipmentRead)
def refresh_local_equipment(equipment_id: int, session: Session = Depends(get_session)):
    """
    Forces a local DB cache refresh of this specific equipment by fetching from Snipe-IT.
    """
    from services.inventory_service import sync_equipment
    try:
        updated_equipment = sync_equipment(session, equipment_id)
        return updated_equipment
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

