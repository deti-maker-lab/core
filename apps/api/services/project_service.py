# apps/api/services/project_service.py

from datetime import datetime, timezone
from typing import List
from sqlmodel import Session, select
from db.models import Project, ProjectMember, User, StatusHistory
import logging

logger = logging.getLogger(__name__)

ALLOWED_TRANSITIONS = {
    "pending":  ["approved", "rejected"],
    "approved": ["active", "archived"],
    "active":   ["completed", "archived"],
}


def _add_history(session: Session, entity_id: int, old_status: str, new_status: str, changed_by: int, note: str = None):
    history = StatusHistory(
        entity_type="project",
        entity_id=entity_id,
        old_status=old_status,
        new_status=new_status,
        changed_by=changed_by,
        note=note
    )
    session.add(history)


def list_projects(session: Session) -> List[Project]:
    return session.exec(select(Project).order_by(Project.created_at.desc())).all()


def get_project(session: Session, project_id: int) -> Project:
    project = session.get(Project, project_id)
    if not project:
        raise ValueError("Project not found")
    return project


def create_project(session: Session, data: dict, created_by: int) -> Project:
    supervisor = session.get(User, data["supervisor_id"])
    if not supervisor or supervisor.role != "supervisor":
        raise ValueError("Invalid supervisor")

    project = Project(
        name=data["name"],
        description=data.get("description"),
        course=data.get("course"),
        academic_year=data.get("academic_year"),
        group_number=data.get("group_number"),
        created_by=created_by,
        supervisor_id=data["supervisor_id"],
        tags=data.get("tags"),
        links=data.get("links"),
        status="pending",
    )
    session.add(project)
    session.flush()

    session.add(ProjectMember(project_id=project.id, user_id=created_by, role="leader"))

    for member_id in data.get("member_ids", []):
        if member_id == created_by:
            continue
        member = session.get(User, member_id)
        if not member:
            raise ValueError(f"User {member_id} not found")
        session.add(ProjectMember(project_id=project.id, user_id=member_id, role="member"))

    _add_history(session, project.id, None, "pending", created_by, "Project created")
    session.commit()
    session.refresh(project)
    return project


def add_member(session: Session, project_id: int, user_id: int, requested_by: int) -> None:
    project = session.get(Project, project_id)
    if not project:
        raise ValueError("Project not found")

    if project.created_by != requested_by:
        raise PermissionError("Only the project creator can add members")

    user = session.get(User, user_id)
    if not user:
        raise ValueError("User not found")

    existing = session.exec(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        )
    ).first()
    if existing:
        raise ValueError("User is already a member")

    session.add(ProjectMember(project_id=project_id, user_id=user_id, role="member"))
    session.commit()


def remove_member(session: Session, project_id: int, user_id: int, requested_by: int) -> None:
    project = session.get(Project, project_id)
    if not project:
        raise ValueError("Project not found")

    if project.created_by != requested_by:
        raise PermissionError("Only the project creator can remove members")

    member = session.exec(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        )
    ).first()
    if not member:
        raise ValueError("Member not found")

    if member.role == "leader":
        raise ValueError("Cannot remove the project leader")

    session.delete(member)
    session.commit()


def update_project_status(session: Session, project_id: int, new_status: str, changed_by: int) -> Project:
    project = session.get(Project, project_id)
    if not project:
        raise ValueError("Project not found")

    valid_next = ALLOWED_TRANSITIONS.get(project.status, [])
    if new_status not in valid_next:
        raise ValueError(f"Cannot transition from '{project.status}' to '{new_status}'")

    old_status = project.status
    project.status = new_status
    if new_status == "approved":
        project.approved_at = datetime.now(timezone.utc)

    _add_history(session, project.id, old_status, new_status, changed_by)
    session.commit()
    session.refresh(project)
    return project


def list_pending_projects(session: Session) -> List[Project]:
    return session.exec(
        select(Project).where(Project.status == "pending").order_by(Project.created_at.desc())
    ).all()