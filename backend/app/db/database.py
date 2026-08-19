from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

engine_kwargs = {"echo": settings.DEBUG}
if db_url.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs.update({
        "pool_pre_ping": True,
        "pool_size": 10,
        "max_overflow": 20
    })

engine = create_engine(db_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables (idempotent — safe to call multiple times)"""
    Base.metadata.create_all(bind=engine)


def ensure_tables_exist():
    """Serverless-friendly table creation. Called on cold start.

    Idempotent — only creates tables that don't exist. Won't drop or modify
    existing tables (use Alembic for migrations).
    """
    try:
        Base.metadata.create_all(bind=engine)
        return True
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"[DB] ensure_tables_exist failed: {e}")
        return False
