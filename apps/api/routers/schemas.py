# apps/api/routers/schemas.py

from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import datetime

# Equipment & Catalog
class EquipmentModelRead(BaseModel):
    id: int
    name: str
    snipeit_model_id: Optional[int] = None
    
    class Config:
        from_attributes = True

class EquipmentRead(BaseModel):
    id: int
    model_id: int
    snipeit_asset_id: Optional[int] = None
    name: Optional[str] = None
    asset_tag: Optional[str] = None
    serial: Optional[str] = None
    location: Optional[str] = None
    status: str
    image: Optional[str] = None
    last_synced_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EquipmentUsageRead(BaseModel):
    id: int
    equipment_id: int
    project_id: int
    status: str
    checked_out_at: datetime
    returned_at: Optional[datetime] = None
    asset_name_snapshot: Optional[str] = None
    asset_tag_snapshot: Optional[str] = None
    model_name_snapshot: Optional[str] = None

    class Config:
        from_attributes = True
        
class EquipmentCatalogItemRead(BaseModel):
    id: int
    model_id: Optional[int] = None
    model_name: Optional[str] = None
    name: str
    category: Optional[str] = None
    supplier: Optional[str] = None
    price: Optional[float] = None
    status: str
    location: Optional[str] = None
    image: Optional[str] = None

    class Config:
        from_attributes = True
        
# Requisitions
class RequisitionItemCreate(BaseModel):
    model_id: int
    quantity: int

class RequisitionCreate(BaseModel):
    items: List[RequisitionItemCreate]

class RequisitionRead(BaseModel):
    id: int
    project_id: int
    requested_by: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class RequisitionReject(BaseModel):
    reason: str

class RequisitionAssignItem(BaseModel):
    req_item_id: int
    snipeit_asset_id: int

class RequisitionAssign(BaseModel):
    items: List[RequisitionAssignItem]

class RequisitionReturn(BaseModel):
    usage_ids: List[int]
    note: Optional[str] = None

class RequisitionItemRead(BaseModel):
    id: int
    model_id: int
    quantity: int

    class Config:
        from_attributes = True

class RequisitionReadDetail(RequisitionRead):
    items: List[RequisitionItemRead] = []
    rejection_reason: Optional[str] = None
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Projects
class ProjectMemberCreate(BaseModel):
    user_id: int
    role: str = "member"

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None
    group_number: Optional[int] = None
    tags: Optional[str] = None
    links: Optional[str] = None
    members: List[ProjectMemberCreate] = []


class ProjectRead(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None
    group_number: Optional[int] = None
    created_by: int
    status: str
    tags: Optional[str] = None
    links: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProjectMemberRead(BaseModel):
    user_id: int
    role: str

    class Config:
        from_attributes = True

class ProjectReadDetail(ProjectRead):
    members: List[ProjectMemberRead] = []

    class Config:
        from_attributes = True

class ProjectMemberAdd(BaseModel):
    user_id: int

class ProjectStatusUpdate(BaseModel):
    status: str
    rejection_reason: Optional[str] = None

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None
    group_number: Optional[int] = None
    tags: Optional[str] = None
    links: Optional[str] = None

# Users
class UserRead(BaseModel):
    id: int
    name: str
    email: str
    role: str
    nmec: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)