from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Optional
from app.db.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.config import settings
from app.models.models import User, UserRole
from app.schemas.schemas import UserCreate, UserRead, UserLogin, Token, UserUpdate
from app.core.deps import get_current_user, get_current_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ─── Rate Limiting (Simple In-Memory) ────────────────────────────────────────
# For production, replace with Redis-backed slowapi
from collections import defaultdict
import time

_rate_limit_store = defaultdict(list)  # key -> list of timestamps


def _check_rate_limit(key: str, max_requests: int = 5, window_seconds: int = 900) -> bool:
    """Check if the key has exceeded rate limit. Returns True if allowed."""
    now = time.time()
    # Clean old entries
    _rate_limit_store[key] = [
        ts for ts in _rate_limit_store[key]
        if now - ts < window_seconds
    ]
    if len(_rate_limit_store[key]) >= max_requests:
        return False
    _rate_limit_store[key].append(now)
    return True


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user — rate limited to 5 attempts per 15 min per email."""
    # Rate limit by email
    if not _check_rate_limit(f"register:{user_data.email}", max_requests=3, window_seconds=3600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many registration attempts. Please try again later."
        )
    
    # Rate limit by IP could be added here with Request dependency
    
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    db_user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        role=UserRole.USER
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    access_token = create_access_token(
        data={"sub": str(db_user.id), "role": db_user.role.value}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": db_user
    }


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user and return JWT token — rate limited to 5 attempts per 15 min per email."""
    # Rate limit by email
    if not _check_rate_limit(f"login:{credentials.email}", max_requests=5, window_seconds=900):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many login attempts. Please try again in 15 minutes."
        )

    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        # Log failed attempt for security monitoring
        logger.warning(f"[Auth] Failed login attempt for email: {credentials.email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated"
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )

    logger.info(f"[Auth] Successful login for user: {user.email}")
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user"""
    return current_user


@router.put("/me", response_model=UserRead)
def update_me(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user profile"""
    if update_data.first_name is not None:
        current_user.first_name = update_data.first_name
    if update_data.last_name is not None:
        current_user.last_name = update_data.last_name
    if update_data.avatar_url is not None:
        current_user.avatar_url = update_data.avatar_url
    if update_data.password is not None:
        current_user.hashed_password = get_password_hash(update_data.password)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/admin-setup")
def admin_setup(
    x_setup_secret: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Create default admin user — PROTECTED by ADMIN_SETUP_SECRET env var.
    Call once after fresh deployment:
      curl -X POST /api/auth/admin-setup -H "x-setup-secret: <your-secret>"
    """
    # Require the setup secret header
    if not settings.ADMIN_SETUP_SECRET:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin setup is disabled (ADMIN_SETUP_SECRET not configured)"
        )

    if x_setup_secret != settings.ADMIN_SETUP_SECRET:
        # Rate limit failed setup attempts
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid setup secret"
        )
    
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="ADMIN_EMAIL and ADMIN_PASSWORD must be configured"
        )

    admin = db.query(User).filter(User.email == settings.ADMIN_EMAIL).first()
    if admin:
        return {"message": "Admin already exists", "email": settings.ADMIN_EMAIL}

    db_admin = User(
        email=settings.ADMIN_EMAIL,
        hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
        first_name="UTV",
        last_name="Administrator",
        role=UserRole.ADMIN,
        is_active=True
    )
    db.add(db_admin)
    db.commit()

    logger.info(f"[Auth] Admin user created: {settings.ADMIN_EMAIL}")
    return {"message": "Admin user created successfully", "email": settings.ADMIN_EMAIL}
