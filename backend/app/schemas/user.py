"""Pydantic v2 schemas for user-related operations."""

import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    """Base user fields."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    first_name: Optional[str] = None
    last_name: Optional[str] = None


class UserCreate(UserBase):
    """Schema for user registration."""
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    """Schema for user profile updates."""
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    preferred_language: Optional[str] = "en"


class UserRead(UserBase):
    """Schema for user responses - never includes password."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    role: str = "user"
    is_active: bool = True
    is_verified: bool = False
    avatar_url: Optional[str] = None
    preferred_language: str = "en"
    created_at: datetime
    updated_at: datetime


class Token(BaseModel):
    """Token response schema."""
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    expires_in: int = 1800


class TokenPayload(BaseModel):
    """JWT token payload."""
    sub: Optional[str] = None
    jti: Optional[str] = None
    type: Optional[str] = None
    exp: Optional[int] = None


class LoginRequest(BaseModel):
    """Login request body."""
    email: str
    password: str


class PasswordResetRequest(BaseModel):
    """Forgot password request."""
    email: EmailStr


class PasswordReset(BaseModel):
    """Password reset with token."""
    token: str
    new_password: str = Field(..., min_length=8)


class EmailVerify(BaseModel):
    """Email verification token."""
    token: str
