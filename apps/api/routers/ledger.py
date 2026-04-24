# apps/api/routers/ledger.py

from fastapi import APIRouter, Depends, Query
from sqlmodel import Session, select, desc
from db.database import get_session
from db.models import StatusHistory, User, Equipment, Project, EquipmentRequest
from auth.dependencies import require_lab_tech

router = APIRouter(prefix="/ledger", tags=["ledger"])

@router.get("")
def get_ledger(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_lab_tech),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0),
):
    history = session.exec(
        select(StatusHistory)
        .order_by(desc(StatusHistory.changed_at))
        .limit(limit)
        .offset(offset)
    ).all()

    result = []
    for h in history:
        changed_by_user = session.get(User, h.changed_by)

        # Resolve nome da entidade
        entity_name = None
        if h.entity_type == "equipment":
            equip = session.get(Equipment, h.entity_id)
            if equip and equip.snipeit_asset_id:
                entity_name = f"Asset #{equip.snipeit_asset_id}"
        elif h.entity_type == "project":
            proj = session.get(Project, h.entity_id)
            if proj:
                entity_name = proj.name
        elif h.entity_type == "equipment_request":
            req = session.get(EquipmentRequest, h.entity_id)
            if req:
                proj = session.get(Project, req.project_id)
                entity_name = f"Request for {proj.name}" if proj else f"Request #{h.entity_id}"
        elif h.entity_type == "equipment_usage":
            entity_name = f"Usage #{h.entity_id}"

        result.append({
            "id":           h.id,
            "entity_type":  h.entity_type,
            "entity_id":    h.entity_id,
            "entity_name":  entity_name,
            "old_status":   h.old_status,
            "new_status":   h.new_status,
            "changed_by":   changed_by_user.name if changed_by_user else f"User #{h.changed_by}",
            "changed_at":   h.changed_at,
            "note":         h.note,
        })

    return result