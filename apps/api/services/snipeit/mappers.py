# apps/api/services/snipeit/mappers.py

from typing import List, Optional, Any, Dict
from pydantic import BaseModel

class SnipeITResponseBase(BaseModel):
    status: str
    messages: Optional[Any] = None

class SnipeITRef(BaseModel):
    """Common reference object returned by SnipeIT (e.g. {id: 1, name: "Status"}."""
    id: int
    name: str

class SnipeITUser(BaseModel):
    id: int
    username: str
    name: str
    email: Optional[str] = None
    
class SnipeITModel(BaseModel):
    id: int
    name: str
    model_number: Optional[str] = None
    category: Optional[SnipeITRef] = None
    manufacturer: Optional[SnipeITRef] = None
    
class SnipeITAsset(BaseModel):
    id: int
    name: Optional[str] = None
    asset_tag: str
    model: Optional[SnipeITRef] = None
    status_label: Optional[SnipeITRef] = None
    category: Optional[SnipeITRef] = None
    assigned_to: Optional[Any] = None # Detailed user info or dict

class SnipeITPaginatedResponse(BaseModel):
    total: int
    rows: List[Dict[str, Any]]

class SnipeITStatusLabel(BaseModel):
    id: int
    name: str
    type: str # 'deployable', 'pending', 'undeployable', 'archived'
