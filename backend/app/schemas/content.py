"""Pydantic v2 schemas for content models."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, ConfigDict, Field


# Category schemas
class CategoryRead(BaseModel):
    """Category response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None
    content_type: str
    created_at: datetime


# Music schemas
class MusicBase(BaseModel):
    """Base music fields."""
    title: str = Field(..., min_length=1, max_length=255)
    composer: str = Field(..., min_length=1, max_length=255)
    performer: Optional[str] = None
    genre: str
    duration_seconds: int = 0
    description: Optional[str] = None
    price: Decimal = Decimal("0.00")
    is_free: bool = False
    category_id: Optional[uuid.UUID] = None


class MusicCreate(MusicBase):
    """Schema for creating music."""
    audio_url: str
    cover_url: Optional[str] = None


class MusicUpdate(BaseModel):
    """Schema for updating music."""
    title: Optional[str] = None
    composer: Optional[str] = None
    performer: Optional[str] = None
    genre: Optional[str] = None
    duration_seconds: Optional[int] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    is_free: Optional[bool] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    category_id: Optional[uuid.UUID] = None


class MusicRead(MusicBase):
    """Music response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    audio_url: str
    cover_url: Optional[str] = None
    play_count: int = 0
    likes_count: int = 0
    is_published: bool = False
    is_featured: bool = False
    created_at: datetime
    updated_at: datetime


# Book schemas
class BookBase(BaseModel):
    """Base book fields."""
    title: str = Field(..., min_length=1, max_length=255)
    author: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: Decimal = Decimal("0.00")
    language: str = "en"
    pages: int = 0
    genre: str = "general"
    is_digital: bool = True
    is_physical: bool = False
    stock_quantity: int = 0
    category_id: Optional[uuid.UUID] = None


class BookCreate(BookBase):
    """Schema for creating a book."""
    cover_url: str
    pdf_url: Optional[str] = None
    isbn: Optional[str] = None


class BookUpdate(BaseModel):
    """Schema for updating a book."""
    title: Optional[str] = None
    author: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    language: Optional[str] = None
    pages: Optional[int] = None
    genre: Optional[str] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    stock_quantity: Optional[int] = None
    category_id: Optional[uuid.UUID] = None


class BookRead(BookBase):
    """Book response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cover_url: str
    pdf_url: Optional[str] = None
    isbn: Optional[str] = None
    is_published: bool = False
    is_featured: bool = False
    created_at: datetime
    updated_at: datetime


# Score schemas
class ScoreBase(BaseModel):
    """Base score fields."""
    title: str = Field(..., min_length=1, max_length=255)
    composer: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    price: Decimal = Decimal("0.00")
    difficulty: str
    instrument: str = "piano"
    number_of_pages: int = 0
    category_id: Optional[uuid.UUID] = None


class ScoreCreate(ScoreBase):
    """Schema for creating a score."""
    pdf_url: str
    cover_url: Optional[str] = None


class ScoreUpdate(BaseModel):
    """Schema for updating a score."""
    title: Optional[str] = None
    composer: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = None
    difficulty: Optional[str] = None
    instrument: Optional[str] = None
    number_of_pages: Optional[int] = None
    is_published: Optional[bool] = None
    is_featured: Optional[bool] = None
    category_id: Optional[uuid.UUID] = None


class ScoreRead(ScoreBase):
    """Score response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    pdf_url: str
    cover_url: Optional[str] = None
    is_published: bool = False
    is_featured: bool = False
    created_at: datetime
    updated_at: datetime


# Video schemas
class VideoBase(BaseModel):
    """Base video fields."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    duration_seconds: int = 0
    is_free: bool = True
    price: Decimal = Decimal("0.00")
    category_id: Optional[uuid.UUID] = None


class VideoCreate(VideoBase):
    """Schema for creating a video."""
    video_url: str
    thumbnail_url: Optional[str] = None


class VideoUpdate(BaseModel):
    """Schema for updating a video."""
    title: Optional[str] = None
    description: Optional[str] = None
    duration_seconds: Optional[int] = None
    is_free: Optional[bool] = None
    price: Optional[Decimal] = None
    is_published: Optional[bool] = None
    category_id: Optional[uuid.UUID] = None


class VideoRead(VideoBase):
    """Video response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    video_url: str
    thumbnail_url: Optional[str] = None
    is_published: bool = False
    view_count: int = 0
    created_at: datetime
    updated_at: datetime


# Paginated response
class PaginatedResponse(BaseModel):
    """Generic paginated response."""
    items: List[dict]
    total: int
    page: int
    size: int
    pages: int
