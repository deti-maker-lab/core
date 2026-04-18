# services/notification_service.py

from sqlmodel import Session, select
from db.models import Notification, ProjectMember
import logging

logger = logging.getLogger(__name__)

def notify(session: Session, user_id: int, title: str, message: str, type: str,
           reference_type: str = None, reference_id: int = None):
    n = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        reference_type=reference_type,
        reference_id=reference_id,
    )
    session.add(n)

def notify_project_members(session: Session, project_id: int, title: str, message: str,
                            type: str, reference_type: str = None, reference_id: int = None,
                            exclude_user_id: int = None):
    members = session.exec(
        select(ProjectMember).where(ProjectMember.project_id == project_id)
    ).all()
    for m in members:
        if exclude_user_id and m.user_id == exclude_user_id:
            continue
        notify(session, m.user_id, title, message, type,
               reference_type=reference_type, reference_id=reference_id)