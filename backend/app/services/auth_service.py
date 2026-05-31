"""Authentication service with JWT and bcrypt."""

import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Tuple

import jwt
from passlib.context import CryptContext
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.user import User, UserRole

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=12)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash from a plain password."""
    return pwd_context.hash(password)


def create_access_token(user_id: str, jti: Optional[str] = None) -> Tuple[str, str]:
    """Create a JWT access token with 30-minute expiry.

    Returns:
        Tuple of (token_string, jti_string)
    """
    if jti is None:
        jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": str(user_id),
        "jti": jti,
        "type": "access",
        "exp": int(expire.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, jti


def create_refresh_token(user_id: str) -> Tuple[str, str]:
    """Create a JWT refresh token with 7-day expiry.

    Returns:
        Tuple of (token_string, jti_string)
    """
    jti = str(uuid.uuid4())
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    payload = {
        "sub": str(user_id),
        "jti": jti,
        "type": "refresh",
        "exp": int(expire.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, jti


def decode_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT token.

    Returns the payload dict if valid, None otherwise.
    """
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> Optional[User]:
    """Authenticate a user by email and password.

    Returns the User if credentials are valid, None otherwise.
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> Optional[User]:
    """Get a user by their UUID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(
    db: AsyncSession,
    email: str,
    username: str,
    password: str,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
) -> User:
    """Create a new user with hashed password."""
    hashed = get_password_hash(password)
    user = User(
        email=email,
        username=username,
        hashed_password=hashed,
        first_name=first_name,
        last_name=last_name,
        role=UserRole.USER,
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


def create_email_verification_token(user_id: str) -> str:
    """Create a short-lived token for email verification."""
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    payload = {
        "sub": str(user_id),
        "type": "verify_email",
        "exp": int(expire.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def create_password_reset_token(user_id: str) -> str:
    """Create a short-lived token for password reset."""
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    payload = {
        "sub": str(user_id),
        "type": "reset_password",
        "exp": int(expire.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_special_token(token: str, token_type: str) -> Optional[str]:
    """Decode a special token (email verification or password reset).

    Returns the user_id if valid and matching type, None otherwise.
    """
    payload = decode_token(token)
    if not payload:
        return None
    if payload.get("type") != token_type:
        return None
    return payload.get("sub")
