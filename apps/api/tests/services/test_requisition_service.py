from sqlmodel import Session, select
from db.models import Project, User, EquipmentModel, EquipmentRequestItem, EquipmentRequest
from services.requisition_service import (
    create_requisition, approve_requisition, reject_requisition,
    list_all_requisitions, list_project_requisitions, get_requisition, get_requisition_items
)
from services.constants import REQ_STATUS_PENDING, REQ_STATUS_APPROVED, REQ_STATUS_REJECTED


# ─── Helpers ────────────────────────────────────────────────────────────────

def make_student(session: Session, email="student@ua.pt") -> User:
    user = User(name="Student", email=email, role="student", nmec="111111", course="LECI", academic_year="3")
    session.add(user)
    session.flush()
    return user


def make_supervisor(session: Session, email="supervisor@ua.pt") -> User:
    user = User(name="Supervisor", email=email, role="supervisor")
    session.add(user)
    session.flush()
    return user


def make_lab_tech(session: Session) -> User:
    user = User(name="Lab Tech", email="labtech@ua.pt", role="lab_technician")
    session.add(user)
    session.flush()
    return user


def make_project(session: Session, created_by: int, supervisor_id: int) -> Project:
    project = Project(name="Test Project", course="LECI", created_by=created_by, supervisor_id=supervisor_id)
    session.add(project)
    session.flush()
    return project


def make_model(session: Session, name="Raspberry Pi 4", snipeit_id=10) -> EquipmentModel:
    model = EquipmentModel(name=name, snipeit_model_id=snipeit_id)
    session.add(model)
    session.flush()
    return model


# ─── create_requisition ──────────────────────────────────────────────────────

def test_create_requisition(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    project = make_project(session, student.id, supervisor.id)
    model = make_model(session)
    session.commit()

    items_data = [{"model_id": model.id, "quantity": 2}]
    req = create_requisition(session, project.id, student.id, items_data)

    assert req.id is not None
    assert req.status == REQ_STATUS_PENDING
    assert req.requested_by == student.id

    items = session.exec(
        select(EquipmentRequestItem).where(EquipmentRequestItem.request_id == req.id)
    ).all()
    assert len(items) == 1
    assert items[0].quantity == 2
    assert items[0].model_id == model.id


def test_create_requisition_project_not_found(session: Session):
    student = make_student(session)
    model = make_model(session)
    session.commit()

    import pytest
    with pytest.raises(ValueError, match="Project not found"):
        create_requisition(session, 9999, student.id, [{"model_id": model.id, "quantity": 1}])


def test_create_requisition_invalid_model(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    project = make_project(session, student.id, supervisor.id)
    session.commit()

    import pytest
    with pytest.raises(ValueError, match="not found"):
        create_requisition(session, project.id, student.id, [{"model_id": 9999, "quantity": 1}])


def test_create_multiple_items(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    project = make_project(session, student.id, supervisor.id)
    model1 = make_model(session, "Raspberry Pi", snipeit_id=11)
    model2 = make_model(session, "Arduino", snipeit_id=12)
    session.commit()

    req = create_requisition(session, project.id, student.id, [
        {"model_id": model1.id, "quantity": 2},
        {"model_id": model2.id, "quantity": 3},
    ])

    items = session.exec(
        select(EquipmentRequestItem).where(EquipmentRequestItem.request_id == req.id)
    ).all()
    assert len(items) == 2


# ─── approve_requisition ─────────────────────────────────────────────────────

def test_approve_requisition(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    lab_tech = make_lab_tech(session)
    project = make_project(session, student.id, supervisor.id)
    model = make_model(session)
    session.commit()

    req = create_requisition(session, project.id, student.id, [{"model_id": model.id, "quantity": 1}])
    approved = approve_requisition(session, req.id, lab_tech.id)

    assert approved.status == REQ_STATUS_APPROVED
    assert approved.approved_at is not None


def test_approve_already_approved_fails(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    lab_tech = make_lab_tech(session)
    project = make_project(session, student.id, supervisor.id)
    model = make_model(session)
    session.commit()

    import pytest
    req = create_requisition(session, project.id, student.id, [{"model_id": model.id, "quantity": 1}])
    approve_requisition(session, req.id, lab_tech.id)

    with pytest.raises(ValueError, match="Only pending"):
        approve_requisition(session, req.id, lab_tech.id)


# ─── reject_requisition ──────────────────────────────────────────────────────

def test_reject_requisition(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    lab_tech = make_lab_tech(session)
    project = make_project(session, student.id, supervisor.id)
    model = make_model(session)
    session.commit()

    req = create_requisition(session, project.id, student.id, [{"model_id": model.id, "quantity": 1}])
    rejected = reject_requisition(session, req.id, lab_tech.id, reason="Not available")

    assert rejected.status == REQ_STATUS_REJECTED
    assert rejected.rejection_reason == "Not available"


def test_reject_already_rejected_fails(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    lab_tech = make_lab_tech(session)
    project = make_project(session, student.id, supervisor.id)
    model = make_model(session)
    session.commit()

    import pytest
    req = create_requisition(session, project.id, student.id, [{"model_id": model.id, "quantity": 1}])
    reject_requisition(session, req.id, lab_tech.id, reason="Not available")

    with pytest.raises(ValueError, match="Only pending"):
        reject_requisition(session, req.id, lab_tech.id, reason="Again")


# ─── listagem ────────────────────────────────────────────────────────────────

def test_list_all_requisitions(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    project = make_project(session, student.id, supervisor.id)
    model = make_model(session)
    session.commit()

    create_requisition(session, project.id, student.id, [{"model_id": model.id, "quantity": 1}])
    create_requisition(session, project.id, student.id, [{"model_id": model.id, "quantity": 2}])

    reqs = list_all_requisitions(session)
    assert len(reqs) == 2


def test_list_project_requisitions(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    project1 = make_project(session, student.id, supervisor.id)
    project2 = make_project(session, student.id, supervisor.id)
    model = make_model(session)
    session.commit()

    create_requisition(session, project1.id, student.id, [{"model_id": model.id, "quantity": 1}])
    create_requisition(session, project1.id, student.id, [{"model_id": model.id, "quantity": 2}])
    create_requisition(session, project2.id, student.id, [{"model_id": model.id, "quantity": 1}])

    reqs = list_project_requisitions(session, project1.id)
    assert len(reqs) == 2


def test_get_requisition(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    project = make_project(session, student.id, supervisor.id)
    model = make_model(session)
    session.commit()

    req = create_requisition(session, project.id, student.id, [{"model_id": model.id, "quantity": 1}])
    fetched = get_requisition(session, req.id)

    assert fetched.id == req.id
    assert fetched.status == REQ_STATUS_PENDING


def test_get_requisition_not_found(session: Session):
    import pytest
    with pytest.raises(ValueError, match="Requisition not found"):
        get_requisition(session, 9999)


def test_get_requisition_items(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    project = make_project(session, student.id, supervisor.id)
    model1 = make_model(session, "Pi", snipeit_id=11)
    model2 = make_model(session, "Arduino", snipeit_id=12)
    session.commit()

    req = create_requisition(session, project.id, student.id, [
        {"model_id": model1.id, "quantity": 2},
        {"model_id": model2.id, "quantity": 1},
    ])

    items = get_requisition_items(session, req.id)
    assert len(items) == 2
    quantities = {i.model_id: i.quantity for i in items}
    assert quantities[model1.id] == 2
    assert quantities[model2.id] == 1