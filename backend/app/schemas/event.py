"""Pydantic v2 schemas for event and ticket operations."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class EventBase(BaseModel):
    """Base event fields."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    venue: str = Field(..., min_length=1, max_length=255)
    address: str = Field(..., min_length=1, max_length=500)
    city: str = Field(..., min_length=1, max_length=100)
    country: str = Field(..., min_length=1, max_length=100)
    start_datetime: datetime
    end_datetime: datetime
    price: Decimal = Decimal("0.00")
    capacity: int = 0


class EventCreate(EventBase):
    """Schema for creating an event."""
    cover_url: Optional[str] = None


class EventUpdate(BaseModel):
    """Schema for updating an event."""
    title: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    start_datetime: Optional[datetime] = None
    end_datetime: Optional[datetime] = None
    price: Optional[Decimal] = None
    capacity: Optional[int] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    cover_url: Optional[str] = None


class EventRead(EventBase):
    """Event response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    cover_url: Optional[str] = None
    tickets_sold: int = 0
    is_active: bool = True
    is_featured: bool = False
    tickets_available: int = 0
    created_at: datetime
    updated_at: datetime


class TicketRead(BaseModel):
    """Ticket response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    event_id: uuid.UUID
    event_title: str = ""
    ticket_code: str
    qr_code_url: Optional[str] = None
    status: str
    seat_info: Optional[str] = None
    used_at: Optional[datetime] = None
    created_at: datetime


class TicketVerify(BaseModel):
    """Ticket verification response."""
    valid: bool
    ticket_code: str
    event_title: str
    status: str
    message: str
