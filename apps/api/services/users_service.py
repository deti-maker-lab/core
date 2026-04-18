# apps/api/services/users_service.py

from fastapi import HTTPException
from sqlmodel import select, Session, or_
from db.models import User, Project, ProjectMember, EquipmentRequest, EquipmentRequestItem


def list_users(db: Session) -> list[User]:
    return db.exec(select(User).order_by(User.name)).all()


def get_user(db: Session, user_id: int) -> User:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_user_projects(db: Session, user_id: int) -> list[Project]:
    created = db.exec(
        select(Project).where(Project.created_by == user_id)
    ).all()
    created_ids = {p.id for p in created}

    memberships = db.exec(
        select(ProjectMember).where(ProjectMember.user_id == user_id)
    ).all()
    member_project_ids = [m.project_id for m in memberships if m.project_id not in created_ids]

    member_projects = []
    if member_project_ids:
        member_projects = db.exec(
            select(Project).where(Project.id.in_(member_project_ids))
        ).all()

    return created + member_projects


def get_user_requisitions(session: Session, user_id: int):
    from sqlmodel import select
    from db.models import EquipmentRequest, EquipmentRequestItem, Equipment

    reqs = session.exec(
        select(EquipmentRequest)
        .where(EquipmentRequest.requested_by == user_id)
        .order_by(EquipmentRequest.created_at.desc())
    ).all()

    result = []
    for req in reqs:
        items = session.exec(
            select(EquipmentRequestItem).where(EquipmentRequestItem.request_id == req.id)
        ).all()

        items_out = []
        for i in items:
            if i.equipment_id is None:
                continue
            equip = session.get(Equipment, i.equipment_id)
            items_out.append({
                "id": i.id,
                "equipment_id": i.equipment_id,
                "snipeit_asset_id": equip.snipeit_asset_id if equip else None,
            })

        result.append({
            "id": req.id,
            "project_id": req.project_id,
            "requested_by": req.requested_by,
            "status": req.status,
            "rejection_reason": req.rejection_reason,
            "approved_at": req.approved_at,
            "created_at": req.created_at,
            "items": items_out,
        })

    return result