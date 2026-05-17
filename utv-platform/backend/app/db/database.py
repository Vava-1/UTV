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
    """Create all tables"""
    Base.metadata.create_all(bind=engine)
