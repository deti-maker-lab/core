# apps/api/db/models.py

from typing import Optional
from datetime import datetime
from decimal import Decimal
from sqlmodel import SQLModel, Field
from sqlalchemy import BigInteger, Column, Text

# =========================================================
# USERS
# =========================================================
class User(SQLModel, table=True):
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    name: str = Field(max_length=150)
    email: str = Field(max_length=255, unique=True)
    role: str = Field(max_length=50)
    nmec: Optional[str] = Field(default=None, max_length=50)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# =========================================================
# PROJECTS
# =========================================================
class Project(SQLModel, table=True):
    __tablename__ = "projects"
    
    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    name: str = Field(max_length=200)
    description: Optional[str] = Field(default=None, sa_column=Column(Text))
    course: Optional[str] = Field(default=None, max_length=100)
    academic_year: Optional[str] = Field(default=None, max_length=20)
    group_number: Optional[int] = Field(default=None)
    created_by: int = Field(foreign_key="users.id", sa_type=BigInteger)
    supervisor_id: int = Field(foreign_key="users.id", sa_type=BigInteger)
    status: str = Field(default="draft", max_length=50)
    tags: Optional[str] = Field(default=None, sa_column=Column(Text))
    links: Optional[str] = Field(default=None, sa_column=Column(Text))
    approved_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# =========================================================
# PROJECT MEMBERS
# =========================================================
class ProjectMember(SQLModel, table=True):
    __tablename__ = "project_members"
    
    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    project_id: int = Field(foreign_key="projects.id", sa_type=BigInteger)
    user_id: int = Field(foreign_key="users.id", sa_type=BigInteger)
    role: str = Field(default="member", max_length=50)

# =========================================================
# EQUIPMENT MODELS
# =========================================================
class EquipmentModel(SQLModel, table=True):
    __tablename__ = "equipment_models"

    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    name: str = Field(max_length=200)
    family: Optional[str] = Field(default=None, max_length=100)
    sub_family: Optional[str] = Field(default=None, max_length=100)
    reference_code: Optional[str] = Field(default=None, max_length=100)
    supplier: Optional[str] = Field(default=None, max_length=150)
    price: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2)
    snipeit_model_id: Optional[int] = Field(default=None, sa_type=BigInteger, unique=True)
    last_synced_at: Optional[datetime] = Field(default=None)

# =========================================================
# EQUIPMENT
# =========================================================
class Equipment(SQLModel, table=True):
    __tablename__ = "equipment"

    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    model_id: int = Field(foreign_key="equipment_models.id", sa_type=BigInteger)
    snipeit_asset_id: Optional[int] = Field(default=None, sa_type=BigInteger, unique=True)
    location: Optional[str] = Field(default=None, max_length=150)
    status: str = Field(default="available", max_length=50)
    condition: Optional[str] = Field(default=None, max_length=50)
    last_synced_at: Optional[datetime] = Field(default=None)

# =========================================================
# EQUIPMENT REQUEST
# =========================================================
class EquipmentRequest(SQLModel, table=True):
    __tablename__ = "equipment_request"

    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    project_id: int = Field(foreign_key="projects.id", sa_type=BigInteger)
    requested_by: int = Field(foreign_key="users.id", sa_type=BigInteger)
    status: str = Field(default="pending", max_length=50)
    rejection_reason: Optional[str] = Field(default=None, sa_column=Column(Text))
    approved_at: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# =========================================================
# EQUIPMENT REQUEST ITEMS
# =========================================================
class EquipmentRequestItem(SQLModel, table=True):
    __tablename__ = "equipment_request_items"

    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    request_id: int = Field(foreign_key="equipment_request.id", sa_type=BigInteger)
    model_id: int = Field(foreign_key="equipment_models.id", sa_type=BigInteger)
    quantity: int = Field()

# =========================================================
# EQUIPMENT USAGE
# =========================================================
class EquipmentUsage(SQLModel, table=True):
    __tablename__ = "equipment_usage"

    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    equipment_id: int = Field(foreign_key="equipment.id", sa_type=BigInteger)
    project_id: int = Field(foreign_key="projects.id", sa_type=BigInteger)
    request_item_id: Optional[int] = Field(default=None, foreign_key="equipment_request_items.id", sa_type=BigInteger)
    checked_out_at: datetime = Field(default_factory=datetime.utcnow)
    due_at: Optional[datetime] = Field(default=None)
    returned_at: Optional[datetime] = Field(default=None)
    status: str = Field(default="checked_out", max_length=50)

# =========================================================
# STATUS HISTORY
# =========================================================
class StatusHistory(SQLModel, table=True):
    __tablename__ = "status_history"

    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    entity_type: str = Field(max_length=50)
    entity_id: int = Field(sa_type=BigInteger)
    old_status: Optional[str] = Field(default=None, max_length=50)
    new_status: str = Field(max_length=50)
    changed_by: int = Field(foreign_key="users.id", sa_type=BigInteger)
    changed_at: datetime = Field(default_factory=datetime.utcnow)
    note: Optional[str] = Field(default=None, sa_column=Column(Text))

# =========================================================
# NOTIFICATIONS
# =========================================================
class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True, sa_type=BigInteger)
    user_id: int = Field(foreign_key="users.id", sa_type=BigInteger)
    title: str = Field(max_length=200)
    message: str = Field(sa_column=Column(Text))
    type: str = Field(max_length=50)
    reference_type: Optional[str] = Field(default=None, max_length=50)
    reference_id: Optional[int] = Field(default=None, sa_type=BigInteger)
    is_read: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)