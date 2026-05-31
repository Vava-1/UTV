"""Authentication router - registration, login, refresh, logout."""

import uuid
from datetime import datetime, timezone, timedelta

import redis.asyncio as redis
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import (
    UserCreate, UserRead, LoginRequest, Token,
    PasswordResetRequest, PasswordReset, EmailVerify,
)
from app.services.auth_service import (
    authenticate_user, create_user, create_access_token,
    create_refresh_token, decode_token, create_email_verification_token,
    create_password_reset_token, decode_special_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
async def register(
    data: UserCreate,
    db: AsyncSession = Depends(get_db),
):
    """Register a new user account."""
    # Check if email exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Check if username exists
    result = await db.execute(select(User).where(User.username == data.username))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken",
        )

    user = await create_user(
        db=db,
        email=data.email,
        username=data.username,
        password=data.password,
        first_name=data.first_name,
        last_name=data.last_name,
    )

    # Generate tokens
    access_token, _ = create_access_token(str(user.id))
    refresh_token, _ = create_refresh_token(str(user.id))

    return {
        "user": UserRead.model_validate(user),
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/login", response_model=Token)
async def login(
    response: Response,
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate and issue JWT tokens."""
    user = await authenticate_user(db, data.email, data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token, _ = create_access_token(str(user.id))
    refresh_token, jti = create_refresh_token(str(user.id))

    # Set refresh token as httpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=Token)
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    """Refresh access token using httpOnly cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No refresh token found",
        )

    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Check blacklist
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
            pass

    user_id = payload.get("sub")
    access_token, _ = create_access_token(user_id)
    new_refresh, new_jti = create_refresh_token(user_id)

    # Blacklist old refresh token
    if jti:
        try:
            r = redis.from_url(settings.REDIS_URL)
            await r.setex(
                f"blacklist:{jti}",
                settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
                "1",
            )
            await r.close()
        except Exception:
            pass

    # Update cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/",
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
async def logout(
    request: Request,
    response: Response,
):
    """Logout by blacklisting the refresh token and clearing cookie."""
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        payload = decode_token(refresh_token)
        if payload and payload.get("jti"):
            try:
                r = redis.from_url(settings.REDIS_URL)
                await r.setex(
                    f"blacklist:{payload['jti']}",
                    settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
                    "1",
                )
                await r.close()
            except Exception:
                pass

    response.delete_cookie(key="refresh_token", path="/")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserRead)
async def get_me(
    user: User = Depends(get_current_user),
):
    """Get current authenticated user."""
    return UserRead.model_validate(user)


@router.post("/forgot-password")
async def forgot_password(
    data: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
):
    """Send password reset email."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()
    if not user:
        # Return success even if email not found (security)
        return {"message": "If the email exists, a reset link has been sent"}

    token = create_password_reset_token(str(user.id))
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    try:
        from app.services.email_service import send_password_reset_email
        await send_password_reset_email(
            name=user.first_name or user.username,
            to_email=user.email,
            reset_url=reset_url,
        )
    except Exception:
        pass

    return {"message": "If the email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    data: PasswordReset,
    db: AsyncSession = Depends(get_db),
):
    """Reset password using token."""
    user_id = decode_special_token(data.token, "reset_password")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    from app.services.auth_service import get_password_hash
    user.hashed_password = get_password_hash(data.new_password)
    await db.commit()

    return {"message": "Password reset successfully"}


@router.get("/verify-email/{token}")
async def verify_email(
    token: str,
    db: AsyncSession = Depends(get_db),
):
    """Verify email address using token."""
    user_id = decode_special_token(token, "verify_email")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    result = await db.execute(select(User).where(User.id == uuid.UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.is_verified = True
    await db.commit()

    return {"message": "Email verified successfully"}
