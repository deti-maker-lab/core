# apps/api/tests/services/test_requisition_service.py

from sqlmodel import Session, select
from db.models import Project, User, EquipmentModel, EquipmentRequestItem
from services.requisition_service import create_requisition
from services.constants import REQ_STATUS_PENDING

def test_create_requisition(session: Session):
    user = User(name="Test User", email="test@ua.pt", role="student", nmec="123456", course="LECI", academic_year="3")
    session.add(user)
    session.flush()

    project = Project(name="Test Project", course="CS101", created_by=user.id, supervisor_id=user.id)
    session.add(project)

    model = EquipmentModel(name="Raspberry Pi 4", snipeit_model_id=10)
    session.add(model)
    session.commit()

    items_data = [{"model_id": model.id, "quantity": 2}]

    req = create_requisition(session, project.id, user.id, items_data)

    assert req.id is not None
    assert req.status == REQ_STATUS_PENDING
    assert req.requested_by == user.id

    items = session.exec(
        select(EquipmentRequestItem).where(EquipmentRequestItem.request_id == req.id)
    ).all()
    assert len(items) == 1
    assert items[0].quantity == 2
    assert items[0].model_id == model.id