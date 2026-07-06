"""Test configuration and shared fixtures for UTV backend tests."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.db.database import Base, get_db
from app.main import app
from app.core.security import get_password_hash
from app.models.models import User, UserRole, Content, ContentType, Order, OrderStatus, OrderItem, Ticket, TicketStatus

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(scope="function")
def db():
    """Create a fresh database for each test."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(db):
    """Create a regular test user."""
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("testpass123"),
        first_name="Test",
        last_name="User",
        role=UserRole.USER,
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def test_admin(db):
    """Create an admin test user."""
    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("adminpass123"),
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(admin)
    db.commit()
    db.refresh(admin)
    return admin


@pytest.fixture
def test_book(db):
    """Create a test book content item."""
    book = Content(
        title="Test Book",
        slug="test-book",
        content_type=ContentType.BOOK,
        description="A test book for unit tests",
        author="Test Author",
        price=9.99,
        currency="USD",
        is_downloadable=True,
        is_published=True,
        pdf_url="https://example.com/test.pdf"
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@pytest.fixture
def test_concert(db):
    """Create a test concert content item."""
    from datetime import datetime, timedelta
    concert = Content(
        title="Test Concert",
        slug="test-concert",
        content_type=ContentType.CONCERT,
        description="A test concert",
        venue="Test Venue",
        event_date=datetime.utcnow() + timedelta(days=30),
        ticket_price=25.00,
        total_tickets=100,
        available_tickets=100,
        is_published=True
    )
    db.add(concert)
    db.commit()
    db.refresh(concert)
    return concert


@pytest.fixture
def client():
    """Create a test client."""
    from fastapi.testclient import TestClient
    return TestClient(app)
