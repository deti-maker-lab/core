# apps/api/routers/users.py

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from typing import List
from db.database import get_session
from db.models import User
from routers.schemas import UserRead, ProjectRead, RequisitionReadDetail
from services.users_service import list_users, get_user, get_user_projects, get_user_requisitions
from auth.dependencies import require_any

router = APIRouter(prefix="/users", tags=["users"])


@router.get("", response_model=List[UserRead])
def get_users(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_any),
):
    return list_users(session)


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(require_any)):
    return current_user


@router.get("/{user_id}", response_model=UserRead)
def get_user_by_id(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_any),
):
    return get_user(session, user_id)


@router.get("/{user_id}/projects", response_model=List[ProjectRead])
def get_projects_by_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_any),
):
    return get_user_projects(session, user_id)


@router.get("/{user_id}/requisitions", response_model=List[RequisitionReadDetail])
def get_requisitions_by_user(
    user_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_any),
):
    return get_user_requisitions(session, user_id)