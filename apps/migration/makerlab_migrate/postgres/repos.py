# apps/migration/makerlab_migrate/postgres/repos.py

from sqlmodel import Session, select
from sqlalchemy import BigInteger
from typing import Optional
import sys
import os

# Add the apps/api directory to the path to import models
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../../../api"))
from db.models import User, Project, ProjectMember, EquipmentModel, Equipment


def upsert_user(
    session: Session,
    legacy_id: int,
    name: str,
    email: str,
    role: str,
    nmec: Optional[str] = None,
    course: Optional[str] = None
) -> tuple[User, str]:
    """
    Upsert a user by legacy_id or email.
    Returns (user, action) where action is 'INSERT' or 'UPDATE'.
    """
    # Try to find by legacy_id first
    user = session.exec(
        select(User).where(User.legacy_id == legacy_id)
    ).first()
    
    if user:
        # Update existing user
        user.name = name
        user.email = email
        user.role = role
        if nmec is not None:
            user.nmec = nmec
        if course is not None:
            user.course = course
        return user, "UPDATE"
    
    # Fallback: check for duplicate by email
    user = session.exec(
        select(User).where(User.email == email)
    ).first()
    
    if user:
        # Update existing user and set legacy_id
        user.name = name
        user.role = role
        user.legacy_id = legacy_id
        if nmec is not None:
            user.nmec = nmec
        if course is not None:
            user.course = course
        return user, "UPDATE"
    
    # Insert new user
    user = User(
        legacy_id=legacy_id,
        name=name,
        email=email,
        role=role,
        nmec=nmec,
        course=course
    )
    session.add(user)
    return user, "INSERT"


def upsert_project(
    session: Session,
    legacy_id: int,
    name: str,
    created_by_user_id: int,
    status: str = "pending",
    description: Optional[str] = None,
    course: Optional[str] = None,
    academic_year: Optional[str] = None,
    group_number: Optional[int] = None
) -> tuple[Project, str]:
    """
    Upsert a project by legacy_id.
    Returns (project, action) where action is 'INSERT' or 'UPDATE'.
    """
    project = session.exec(
        select(Project).where(Project.legacy_id == legacy_id)
    ).first()
    
    if project:
        # Update existing project
        project.name = name
        project.created_by = created_by_user_id
        project.status = status
        if description is not None:
            project.description = description
        if course is not None:
            project.course = course
        if academic_year is not None:
            project.academic_year = academic_year
        if group_number is not None:
            project.group_number = group_number
        return project, "UPDATE"
    
    # Insert new project
    project = Project(
        legacy_id=legacy_id,
        name=name,
        created_by=created_by_user_id,
        status=status,
        description=description,
        course=course,
        academic_year=academic_year,
        group_number=group_number
    )
    session.add(project)
    return project, "INSERT"


def upsert_project_member(
    session: Session,
    project_id: int,
    user_id: int,
    role: str
) -> tuple[ProjectMember, str]:
    """
    Upsert a project member by (project_id, user_id).
    Returns (member, action) where action is 'INSERT' or 'UPDATE'.
    """
    member = session.exec(
        select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id
        )
    ).first()
    
    if member:
        # Update existing member
        member.role = role
        return member, "UPDATE"
    
    # Insert new member
    member = ProjectMember(
        project_id=project_id,
        user_id=user_id,
        role=role
    )
    session.add(member)
    return member, "INSERT"


def upsert_equipment_model(
    session: Session,
    legacy_id: int,
    name: str,
    reference_code: Optional[str] = None,
    legacy_reference_code: Optional[str] = None,
    family: Optional[str] = None,
    sub_family: Optional[str] = None,
    supplier: Optional[str] = None,
    price: Optional[float] = None
) -> tuple[EquipmentModel, str]:
    """
    Upsert an equipment model by legacy_id.
    Returns (model, action) where action is 'INSERT' or 'UPDATE'.
    """
    model = session.exec(
        select(EquipmentModel).where(EquipmentModel.legacy_id == legacy_id)
    ).first()
    
    if model:
        # Update existing model
        model.name = name
        if reference_code is not None:
            model.reference_code = reference_code
        if legacy_reference_code is not None:
            model.legacy_reference_code = legacy_reference_code
        if family is not None:
            model.family = family
        if sub_family is not None:
            model.sub_family = sub_family
        if supplier is not None:
            model.supplier = supplier
        if price is not None:
            model.price = price
        return model, "UPDATE"
    
    # Insert new model
    model = EquipmentModel(
        legacy_id=legacy_id,
        name=name,
        reference_code=reference_code,
        legacy_reference_code=legacy_reference_code,
        family=family,
        sub_family=sub_family,
        supplier=supplier,
        price=price
    )
    session.add(model)
    return model, "INSERT"


def upsert_equipment(
    session: Session,
    legacy_id: int,
    model_id: int,
    snipeit_asset_id: Optional[int] = None,
    location: Optional[str] = None,
    status: str = "available"
) -> tuple[Equipment, str]:
    """
    Upsert equipment by legacy_id.
    Returns (equipment, action) where action is 'INSERT' or 'UPDATE'.
    """
    equipment = session.exec(
        select(Equipment).where(Equipment.legacy_id == legacy_id)
    ).first()
    
    if equipment:
        # Update existing equipment
        equipment.model_id = model_id
        if snipeit_asset_id is not None:
            equipment.snipeit_asset_id = snipeit_asset_id
        if location is not None:
            equipment.location = location
        equipment.status = status
        return equipment, "UPDATE"
    
    # Insert new equipment
    equipment = Equipment(
        legacy_id=legacy_id,
        model_id=model_id,
        snipeit_asset_id=snipeit_asset_id,
        location=location,
        status=status
    )
    session.add(equipment)
    return equipment, "INSERT"


def find_user_by_legacy_id(session: Session, legacy_id: int) -> Optional[User]:
    """Find a user by legacy_id."""
    return session.exec(
        select(User).where(User.legacy_id == legacy_id)
    ).first()


def find_project_by_legacy_id(session: Session, legacy_id: int) -> Optional[Project]:
    """Find a project by legacy_id."""
    return session.exec(
        select(Project).where(Project.legacy_id == legacy_id)
    ).first()


def find_equipment_model_by_legacy_id(session: Session, legacy_id: int) -> Optional[EquipmentModel]:
    """Find an equipment model by legacy_id."""
    return session.exec(
        select(EquipmentModel).where(EquipmentModel.legacy_id == legacy_id)
    ).first()


def save_checkpoint(session: Session, entity_type: str, last_legacy_id: int) -> None:
    """Save a checkpoint for incremental migration."""
    from sqlalchemy import text
    session.execute(
        text("""
            INSERT INTO migration_state (entity_type, last_legacy_id, updated_at)
            VALUES (:entity_type, :last_legacy_id, CURRENT_TIMESTAMP)
            ON CONFLICT (entity_type) DO UPDATE
            SET last_legacy_id = :last_legacy_id, updated_at = CURRENT_TIMESTAMP
        """),
        {"entity_type": entity_type, "last_legacy_id": last_legacy_id}
    )


def load_checkpoint(session: Session, entity_type: str) -> Optional[int]:
    """Load the last checkpoint for an entity type."""
    from sqlalchemy import text
    result = session.execute(
        text("SELECT last_legacy_id FROM migration_state WHERE entity_type = :entity_type"),
        {"entity_type": entity_type}
    ).first()
    return result[0] if result else None
