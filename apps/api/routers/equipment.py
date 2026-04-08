# apps/api/routers/equipment.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from db.database import get_session
from routers.schemas import EquipmentModelRead
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
