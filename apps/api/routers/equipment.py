# apps/api/routers/equipment.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from db.database import get_session
from db.models import User
from routers.schemas import EquipmentModelRead, EquipmentRead, EquipmentCatalogItemRead
from services.inventory_service import list_catalog, sync_catalog, sync_equipment, list_equipment_catalog_from_snipeit
from auth.dependencies import require_any, require_lab_tech

router = APIRouter(prefix="/equipment", tags=["equipment"])

def _parse_price(value):
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return float(value)
    if isinstance(value, str):
        v = value.strip()
        if not v:
            return None
        for ch in ["€", "$", "£", " "]:
            v = v.replace(ch, "")
        v = v.replace(",", "")
        try:
            return float(v)
        except ValueError:
            return None
    return None

@router.get("/catalog", response_model=List[EquipmentCatalogItemRead])
def get_catalog(session: Session = Depends(get_session), current_user: User = Depends(require_any)):
    return list_equipment_catalog_from_snipeit()

@router.post("/catalog/sync", status_code=status.HTTP_200_OK)
def trigger_catalog_sync(session: Session = Depends(get_session), current_user: User = Depends(require_lab_tech)):
    """
    Triggers an on-demand sync of Snipe-IT models to the local database.
    (In real life, restrict this to admins).
    """
    try:
        stats = sync_catalog(session)
        return {"message": "Sync completed successfully", "stats": stats}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{equipment_id}", response_model=EquipmentCatalogItemRead)
def get_equipment_detail(equipment_id: int, current_user: User = Depends(require_any)):
    from services.snipeit.assets import get_asset

    asset = get_asset(equipment_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Snipe-IT asset not found")

    a = asset.model_dump() if hasattr(asset, "model_dump") else asset

    model = a.get("model") or {}
    category = a.get("category") or model.get("category") or {}
    supplier = a.get("supplier") or {}
    manufacturer = model.get("manufacturer") or {}
    location = a.get("location") or {}

    price_raw = a.get("purchase_cost")
    if isinstance(price_raw, str):
        price_raw = price_raw.replace(",", "")
    try:
        price = float(price_raw) if price_raw not in (None, "") else None
    except Exception:
        price = None

    return {
        "id": a.get("id"),
        "name": a.get("name") or model.get("name") or "Unnamed",
        "category": category.get("name"),
        "supplier": supplier.get("name") or manufacturer.get("name"),
        "price": _parse_price(a.get("purchase_cost")),
        "location": location.get("name"),
        "image": a.get("image"),
        "status": (a.get("status_label") or {}).get("name", "unknown"),
    }

@router.post("/{equipment_id}/refresh", response_model=EquipmentRead)
def refresh_local_equipment(equipment_id: int, session: Session = Depends(get_session), current_user: User = Depends(require_lab_tech)):
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

