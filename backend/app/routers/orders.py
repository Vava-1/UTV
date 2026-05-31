"""Orders router - view order history and details."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.order import Order, OrderItem
from app.models.user import User
from app.schemas.order import OrderRead
from app.middleware.auth import get_current_user
from app.utils.pagination import paginate_query

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/", response_model=dict)
async def list_my_orders(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's orders."""
    query = (
        select(Order)
        .where(Order.user_id == user.id)
        .order_by(desc(Order.created_at))
    )
    result = await paginate_query(db, query, page, size)
    result["items"] = [OrderRead.model_validate(o) for o in result["items"]]
    return result


@router.get("/{order_id}", response_model=OrderRead)
async def get_order(
    order_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific order (must belong to current user)."""
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.user_id == user.id)
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    return OrderRead.model_validate(order)
