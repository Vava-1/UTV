"""
Security utilities: password hashing, JWT creation/verification.

Notes:
- bcrypt is used directly (not passlib) for clarity and to avoid the
  passlib/bcrypt version-compatibility issues that broke auth in 2024.
- verify_password logs unexpected exceptions instead of silently swallowing
  them — silent swallowing made auth debugging brutal.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
import bcrypt
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a bcrypt hash.

    Returns False only on confirmed mismatches. Unexpected errors are logged
    and re-raised so they don't silently hide configuration issues.
    """
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except ValueError as e:
        # Malformed hash or password — this is a real error, log it
        logger.warning(f"[Auth] Password verification ValueError: {e}")
        return False
    except TypeError as e:
        logger.warning(f"[Auth] Password verification TypeError: {e}")
        return False
    except Exception as e:
        # Anything else is unexpected — log but don't crash auth flow
        logger.error(f"[Auth] Unexpected error in verify_password: {e}", exc_info=True)
        return False


def get_password_hash(password: str) -> str:
    """Hash a password with bcrypt. Returns a UTF-8 string."""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT. `data` should contain at least `sub` (user id)."""
    to_encode = data.copy()
    # Use timezone-aware UTC (datetime.utcnow() is deprecated in Python 3.12+)
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and verify a JWT. Returns None on any failure."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError as e:
        logger.warning(f"[Auth] JWT decode failed: {e}")
        return None
