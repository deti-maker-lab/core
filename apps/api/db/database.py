# apps/api/db/database.py

from sqlmodel import create_engine, Session
from core.config import settings

# The engine is the starting point for SQLAlchemy / SQLModel to communicate with the database.
# echo=True will print SQL queries to the console - very useful for local debugging.
engine = create_engine(settings.DATABASE_URI, echo=True)

def get_session():
    """
    Generator providing a database session.
    This allows FastAPI's Dependency Injection to automatically open and close 
    the session (and rollback in case of an error) for each API request.
    """
    with Session(engine) as session:
        yield session