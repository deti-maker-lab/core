# apps/migration/makerlab_migrate/dump/models.py

from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel, Field


class LegacyUser(BaseModel):
    """Represents a user from the legacy auth_user table."""
    id: int
    username: str
    first_name: str
    last_name: str
    email: Optional[str] = None
    is_staff: bool = False
    is_superuser: bool = False
    date_joined: Optional[datetime] = None
    
    @property
    def name(self) -> str:
        """Full name combining first and last name."""
        return f"{self.first_name} {self.last_name}".strip()
    
    @property
    def role(self) -> str:
        """Map legacy user flags to new role system."""
        if self.is_superuser or self.is_staff:
            return "lab_technician"
        return "student"


class LegacyProjectMember(BaseModel):
    """Represents a project member from legacy XML."""
    legacy_user_id: int
    role: str  # Will be mapped: owner->leader, member->member, mentor->advisor


class LegacyProject(BaseModel):
    """Represents a project from legacy wiki_article with type='project'."""
    id: int  # article_id
    title: str
    content: str  # XML content with <owner>, <member>, <mentor> elements
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Parsed from XML content
    owner_legacy_user_id: Optional[int] = None
    members: List[LegacyProjectMember] = Field(default_factory=list)
    description: Optional[str] = None
    course: Optional[str] = None
    academic_year: Optional[str] = None
    group_number: Optional[int] = None


class LegacyEquipment(BaseModel):
    """Represents equipment from legacy wiki_article with type='equipment'."""
    article_id: int
    title: str
    content: str  # Markdown-like content with equipment fields
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Parsed from markdown content
    family: Optional[str] = None
    sub_family: Optional[str] = None
    codigo: Optional[str] = None  # Reference code/SKU
    price: Optional[Decimal] = None
    supplier: Optional[str] = None
    location: Optional[str] = None
    quantity: Optional[int] = None  # If present, number of physical units


class LegacyData(BaseModel):
    """Container for all loaded legacy data."""
    users: List[LegacyUser] = Field(default_factory=list)
    projects: List[LegacyProject] = Field(default_factory=list)
    equipment: List[LegacyEquipment] = Field(default_factory=list)
