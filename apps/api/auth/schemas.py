# apps/api/auth/schemas.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserData(BaseModel):
    """Dados recebidos do SSO da UA"""
    email: EmailStr
    iupi: str
    name: str
    surname: str
    nmec: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None


class UserRead(BaseModel):
    """Resposta do endpoint /auth/me"""
    id: int
    name: str
    email: str
    role: str
    nmec: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True