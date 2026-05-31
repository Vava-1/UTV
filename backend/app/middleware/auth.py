"""Authentication middleware and dependencies."""

import uuid
from typing import Optional

import redis.asyncio as redis
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole
from app.services.auth_service import decode_token

# Use HTTPBearer for auto-documentation in Swagger UI
security = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Dependency to get the current authenticated user from JWT.

    Args:
        request: FastAPI request object.
        credentials: HTTP Authorization credentials.
        db: Database session.

    Returns:
        Authenticated User model.

    Raises:
        HTTPException: If authentication fails.
    """
    token = None

    # Try Authorization header
    if credentials:
        token = credentials.credentials
    else:
        # Fallback to query parameter for certain endpoints
        token = request.query_params.get("token")

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Decode and validate token
    payload = decode_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check token type
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
        )

    # Check Redis blacklist
    jti = payload.get("jti")
    if jti:
        try:
            r = redis.from_url(settings.REDIS_URL)
            is_blacklisted = await r.get(f"blacklist:{jti}")
            await r.close()
            if is_blacklisted:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token has been revoked",
                )
        except Exception:
            pass  # Redis unavailable, continue with token validation

    # Get user from database
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    from sqlalchemy import select
    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    return user


async def get_optional_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None."""
    try:
        return await get_current_user(request, credentials, db)
    except HTTPException:
        return None


async def require_admin(
    user: User = Depends(get_current_user),
) -> User:
    """Dependency requiring admin or superadmin role.

    Args:
        user: Current authenticated user.

    Returns:
        User if admin.

    Raises:
        HTTPException: If not admin.
    """
    if user.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
