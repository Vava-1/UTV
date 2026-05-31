"""Pydantic v2 schemas for order operations."""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, List

from pydantic import BaseModel, ConfigDict

from app.models.order import OrderStatus, OrderItemType


class CartItem(BaseModel):
    """Item in a shopping cart."""
    item_type: str
    item_id: uuid.UUID
    quantity: int = 1


class OrderItemRead(BaseModel):
    """Order item response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    item_type: str
    item_id: uuid.UUID
    quantity: int
    unit_price: Decimal
    watermarked_url: Optional[str] = None
    download_count: int = 0
    created_at: datetime


class OrderRead(BaseModel):
    """Order response schema."""
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    status: str
    total_amount: Decimal
    currency: str = "usd"
    stripe_session_id: Optional[str] = None
    notes: Optional[str] = None
    items: List[OrderItemRead] = []
    created_at: datetime
    updated_at: datetime


class OrderCreate(BaseModel):
    """Schema for creating an order."""
    items: List[CartItem]
