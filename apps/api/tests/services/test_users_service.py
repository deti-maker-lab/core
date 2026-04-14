# tests/services/test_users_service.py

import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException
from db.models import User
from services.users_service import list_users, get_user


def make_user(**kwargs) -> User:
    defaults = dict(
        id=1,
        name="João Silva",
        email="joao@ua.pt",
        role="student",
        nmec="123456",
        course="LEI",
        academic_year="3",
    )
    return User(**{**defaults, **kwargs})


# ─── list_users ──────────────────────────────────────────────────────────────

def test_list_users_returns_all():
    db = MagicMock()
    users = [make_user(id=1), make_user(id=2, email="ana@ua.pt")]
    db.exec.return_value.all.return_value = users

    result = list_users(db)

    assert len(result) == 2
    db.exec.assert_called_once()


def test_list_users_empty():
    db = MagicMock()
    db.exec.return_value.all.return_value = []

    result = list_users(db)

    assert result == []


# ─── get_user ────────────────────────────────────────────────────────────────

def test_get_user_found():
    db = MagicMock()
    user = make_user()
    db.get.return_value = user

    result = get_user(db, 1)

    assert result.id == 1
    db.get.assert_called_once_with(User, 1)


def test_get_user_not_found():
    db = MagicMock()
    db.get.return_value = None

    with pytest.raises(HTTPException) as exc:
        get_user(db, 999)

    assert exc.value.status_code == 404
    assert exc.value.detail == "User not found"