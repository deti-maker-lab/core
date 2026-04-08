# apps/api/routers/schemas.py

from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

# Equipment & Catalog
class EquipmentModelRead(BaseModel):
    id: int
    name: str
    snipeit_model_id: Optional[int] = None
    
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

class EquipmentUsageRead(BaseModel):
    id: int
    equipment_id: int
    project_id: int
    status: str
    checked_out_at: datetime
    returned_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RequisitionReturn(BaseModel):
    usage_ids: List[int]
    note: Optional[str] = None
