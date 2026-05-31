"""Admin router - dashboard, user management, content management."""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database import get_db
from app.models.user import User, UserRole
from app.models.content import Music, Book, Score, Video
from app.models.order import Order, OrderStatus, OrderItem, OrderItemType
from app.models.event import Event, Ticket
from app.schemas.user import UserRead, UserUpdate
from app.schemas.order import OrderRead
from app.middleware.auth import require_admin
from app.utils.pagination import paginate_query

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
async def get_dashboard(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get admin dashboard statistics."""
    # Total users
    users_result = await db.execute(select(func.count(User.id)))
    total_users = users_result.scalar() or 0

    # Total revenue
    revenue_result = await db.execute(
        select(func.sum(Order.total_amount))
        .where(Order.status == OrderStatus.FULFILLED)
    )
    total_revenue = revenue_result.scalar() or 0

    # Total orders
    orders_result = await db.execute(select(func.count(Order.id)))
    total_orders = orders_result.scalar() or 0

    # Content counts
    music_count = (await db.execute(select(func.count(Music.id)))).scalar() or 0
    book_count = (await db.execute(select(func.count(Book.id)))).scalar() or 0
    score_count = (await db.execute(select(func.count(Score.id)))).scalar() or 0
    video_count = (await db.execute(select(func.count(Video.id)))).scalar() or 0

    # Recent orders
    recent_orders_result = await db.execute(
        select(Order)
        .order_by(desc(Order.created_at))
        .limit(10)
    )
    recent_orders = [OrderRead.model_validate(o) for o in recent_orders_result.scalars().all()]

    return {
        "total_users": total_users,
        "total_revenue": float(total_revenue),
        "total_orders": total_orders,
        "content_counts": {
            "music": music_count,
            "books": book_count,
            "scores": score_count,
            "videos": video_count,
        },
        "recent_orders": recent_orders,
    }


@router.get("/users")
async def list_users(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all users with filtering (admin only)."""
    query = select(User)

    if search:
        term = f"%{search}%"
        query = query.where(
            (User.email.ilike(term)) |
            (User.username.ilike(term)) |
            (User.first_name.ilike(term)) |
            (User.last_name.ilike(term))
        )
    if role:
        query = query.where(User.role == role)

    query = query.order_by(desc(User.created_at))
    result = await paginate_query(db, query, page, size)
    result["items"] = [UserRead.model_validate(u) for u in result["items"]]
    return result


@router.put("/users/{user_id}")
async def admin_update_user(
    user_id: uuid.UUID,
    data: UserUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update any user (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return UserRead.model_validate(user)


@router.delete("/users/{user_id}")
async def admin_deactivate_user(
    user_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Soft-delete a user (admin only)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    user.is_active = False
    await db.commit()
    return {"message": "User deactivated"}


@router.get("/orders")
async def list_all_orders(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    from_date: Optional[str] = Query(None),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """List all orders with filtering (admin only)."""
    query = select(Order).order_by(desc(Order.created_at))

    if status_filter:
        query = query.where(Order.status == status_filter)
    if from_date:
        query = query.where(Order.created_at >= from_date)

    result = await paginate_query(db, query, page, size)
    result["items"] = [OrderRead.model_validate(o) for o in result["items"]]
    return result
