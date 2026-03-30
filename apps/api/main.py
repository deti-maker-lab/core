# apps/api/main.py

from fastapi import FastAPI, Depends
from sqlmodel import Session, text
from db.database import get_session
from auth.router import router as auth_router

app = FastAPI(title="DETI Maker Lab API", version="1.0")

app.include_router(auth_router, prefix="/auth", tags=["auth"])

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/health-db")
def health_check(session: Session = Depends(get_session)):
    """
    Health check endpoint to verify database connectivity.
    """
    try:
        # Execute a simple query to test the database connection
        session.exec(text("SELECT 1")).first()
        return {"status": "ok", "message": "Successfully connected to the PostgreSQL database!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}