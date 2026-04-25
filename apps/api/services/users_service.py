# apps/api/services/users_service.py

from fastapi import HTTPException
from sqlmodel import select, Session
from db.models import User, Project, ProjectMember, EquipmentRequest


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
    member_project_ids = [
        m.project_id for m in memberships
        if m.project_id not in created_ids
    ]

    member_projects = []
    if member_project_ids:
        member_projects = db.exec(
            select(Project).where(Project.id.in_(member_project_ids))
        ).all()

    return created + member_projects


def get_user_requisitions(session: Session, user_id: int) -> list[EquipmentRequest]:
    return session.exec(
        select(EquipmentRequest)
        .where(EquipmentRequest.requested_by == user_id)
        .order_by(EquipmentRequest.created_at.desc())
    ).all()