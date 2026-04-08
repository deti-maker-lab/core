# apps/api/tests/services/test_requisition_service.py

import pytest
from sqlmodel import Session, create_engine, SQLModel
from datetime import datetime

from db.models import Project, User, EquipmentModel
from services.requisition_service import create_requisition
from services.constants import REQ_STATUS_PENDING

@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine("sqlite:///:memory:")
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session

def test_create_requisition(session: Session):
    # Setup mock data locally
    user = User(name="Test User", email="test@ua.pt", role="student")
    session.add(user)
    session.flush()
    
    project = Project(name="Test Project", course="CS101", created_by=user.id, supervisor_id=user.id)
    session.add(project)
    
    model = EquipmentModel(name="Raspberry Pi 4", snipeit_model_id=10)
    session.add(model)
    session.commit()
    
    items_data = [{"model_id": model.id, "quantity": 2}]
    
    # Act
    req = create_requisition(session, project.id, user.id, items_data)
    
    # Assert
    assert req.id is not None
    assert req.status == REQ_STATUS_PENDING
    assert req.requested_by == user.id
    assert len(req.items) == 0 # Depends on lazy loading in SQLModel or if we fetch explicitly
