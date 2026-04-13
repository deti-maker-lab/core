import pytest
from sqlmodel import Session, create_engine, SQLModel
import db.models  # garante que todos os modelos são registados

TEST_DATABASE_URL = "postgresql+psycopg2://makerlab:makerlab@postgres:5432/makerlab_test"

@pytest.fixture(name="session", scope="function")
def session_fixture():
    engine = create_engine(TEST_DATABASE_URL)
    SQLModel.metadata.drop_all(engine)   # limpa antes
    SQLModel.metadata.create_all(engine) # cria de novo
    with Session(engine) as session:
        yield session
    SQLModel.metadata.drop_all(engine)   # limpa depois