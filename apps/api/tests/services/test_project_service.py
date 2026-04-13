# apps/api/tests/services/test_project_service.py

import pytest
from sqlmodel import Session, select
from db.models import User, Project, ProjectMember
from services.project_service import (
    create_project, get_project, list_projects,
    add_member, remove_member, update_project_status,
    list_pending_projects
)


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


# ─── create_project ──────────────────────────────────────────────────────────

def test_create_project_success(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    session.commit()

    project = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": []
    }, created_by=student.id)

    assert project.id is not None
    assert project.name == "Test Project"
    assert project.status == "pending"
    assert project.created_by == student.id

    leader = session.exec(
        select(ProjectMember).where(
            ProjectMember.project_id == project.id,
            ProjectMember.user_id == student.id
        )
    ).first()
    assert leader is not None
    assert leader.role == "leader"


def test_create_project_invalid_supervisor(session: Session):
    student = make_student(session)
    other_student = make_student(session, email="other@ua.pt")
    session.commit()

    with pytest.raises(ValueError, match="Invalid supervisor"):
        create_project(session, {
            "name": "Test Project",
            "supervisor_id": other_student.id,
            "member_ids": []
        }, created_by=student.id)


def test_create_project_with_members(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    member = make_student(session, email="member@ua.pt")
    session.commit()

    project = create_project(session, {
        "name": "Group Project",
        "supervisor_id": supervisor.id,
        "member_ids": [member.id]
    }, created_by=student.id)

    members = session.exec(
        select(ProjectMember).where(ProjectMember.project_id == project.id)
    ).all()
    assert len(members) == 2


def test_create_project_member_not_found(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    session.commit()

    with pytest.raises(ValueError, match="not found"):
        create_project(session, {
            "name": "Test Project",
            "supervisor_id": supervisor.id,
            "member_ids": [9999]
        }, created_by=student.id)


# ─── get_project ─────────────────────────────────────────────────────────────

def test_get_project_success(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    session.commit()

    created = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": []
    }, created_by=student.id)

    fetched = get_project(session, created.id)
    assert fetched.id == created.id


def test_get_project_not_found(session: Session):
    with pytest.raises(ValueError, match="Project not found"):
        get_project(session, 9999)


# ─── list_projects ────────────────────────────────────────────────────────────

def test_list_projects(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    session.commit()

    create_project(session, {"name": "P1", "supervisor_id": supervisor.id, "member_ids": []}, created_by=student.id)
    create_project(session, {"name": "P2", "supervisor_id": supervisor.id, "member_ids": []}, created_by=student.id)

    projects = list_projects(session)
    assert len(projects) == 2


# ─── add_member ───────────────────────────────────────────────────────────────

def test_add_member_success(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    new_member = make_student(session, email="new@ua.pt")
    session.commit()

    project = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": []
    }, created_by=student.id)

    add_member(session, project.id, new_member.id, requested_by=student.id)

    members = session.exec(
        select(ProjectMember).where(ProjectMember.project_id == project.id)
    ).all()
    assert len(members) == 2


def test_add_member_not_creator(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    other = make_student(session, email="other@ua.pt")
    session.commit()

    project = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": []
    }, created_by=student.id)

    with pytest.raises(PermissionError):
        add_member(session, project.id, supervisor.id, requested_by=other.id)


def test_add_member_already_exists(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    session.commit()

    project = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": []
    }, created_by=student.id)

    with pytest.raises(ValueError, match="already a member"):
        add_member(session, project.id, student.id, requested_by=student.id)


# ─── remove_member ────────────────────────────────────────────────────────────

def test_remove_member_success(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    member = make_student(session, email="member@ua.pt")
    session.commit()

    project = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": [member.id]
    }, created_by=student.id)

    remove_member(session, project.id, member.id, requested_by=student.id)

    members = session.exec(
        select(ProjectMember).where(ProjectMember.project_id == project.id)
    ).all()
    assert len(members) == 1


def test_remove_leader_fails(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    session.commit()

    project = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": []
    }, created_by=student.id)

    with pytest.raises(ValueError, match="Cannot remove the project leader"):
        remove_member(session, project.id, student.id, requested_by=student.id)


# ─── update_project_status ───────────────────────────────────────────────────

def test_approve_project(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    lab_tech = make_lab_tech(session)
    session.commit()

    project = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": []
    }, created_by=student.id)

    updated = update_project_status(session, project.id, "approved", changed_by=lab_tech.id)
    assert updated.status == "approved"
    assert updated.approved_at is not None


def test_reject_project(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    lab_tech = make_lab_tech(session)
    session.commit()

    project = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": []
    }, created_by=student.id)

    updated = update_project_status(session, project.id, "rejected", changed_by=lab_tech.id)
    assert updated.status == "rejected"


def test_invalid_status_transition(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    lab_tech = make_lab_tech(session)
    session.commit()

    project = create_project(session, {
        "name": "Test Project",
        "supervisor_id": supervisor.id,
        "member_ids": []
    }, created_by=student.id)

    with pytest.raises(ValueError, match="Cannot transition"):
        update_project_status(session, project.id, "completed", changed_by=lab_tech.id)


# ─── list_pending_projects ───────────────────────────────────────────────────

def test_list_pending_projects(session: Session):
    student = make_student(session)
    supervisor = make_supervisor(session)
    lab_tech = make_lab_tech(session)
    session.commit()

    p1 = create_project(session, {"name": "P1", "supervisor_id": supervisor.id, "member_ids": []}, created_by=student.id)
    p2 = create_project(session, {"name": "P2", "supervisor_id": supervisor.id, "member_ids": []}, created_by=student.id)
    update_project_status(session, p1.id, "approved", changed_by=lab_tech.id)

    pending = list_pending_projects(session)
    assert len(pending) == 1
    assert pending[0].id == p2.id