# apps/migration/makerlab_migrate/postgres/engine.py

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
from typing import Generator


def get_engine(postgres_uri: str):
    """Create a SQLAlchemy engine for the migration."""
    return create_engine(postgres_uri, echo=False)


def get_session_factory(postgres_uri: str):
    """Create a session factory for the migration."""
    engine = get_engine(postgres_uri)
    return sessionmaker(bind=engine, autocommit=False, autoflush=False)


class PostgresUnitOfWork:
    """Unit of work for PostgreSQL operations during migration."""
    
    def __init__(self, postgres_uri: str, dry_run: bool = False):
        self.postgres_uri = postgres_uri
        self.dry_run = dry_run
        self._session_factory = get_session_factory(postgres_uri)
        self._session: Session = None
    
    def __enter__(self):
        self._session = self._session_factory()
        return self._session
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._session:
            if self.dry_run:
                self._session.rollback()
            else:
                if exc_type is None:
                    self._session.commit()
                else:
                    self._session.rollback()
            self._session.close()
    
    @property
    def session(self) -> Session:
        """Get the current session."""
        if self._session is None:
            raise RuntimeError("Session not initialized. Use context manager.")
        return self._session
