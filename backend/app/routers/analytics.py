"""Analytics router - revenue charts and content statistics."""

from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.database import get_db
from app.models.order import Order, OrderStatus, OrderItem
from app.models.content import Music, Book, Score
from app.models.user import User
from app.middleware.auth import require_admin

router = APIRouter(prefix="/admin/analytics", tags=["Analytics"])


@router.get("/revenue")
async def get_revenue_analytics(
    period: str = Query("month"),  # day, week, month, year
    admin = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get revenue time series data."""
    now = datetime.now(timezone.utc)

    if period == "day":
        # Last 24 hours, hourly
        start = now - timedelta(days=1)
        interval = "hour"
    elif period == "week":
        start = now - timedelta(weeks=1)
        interval = "day"
    elif period == "month":
        start = now - timedelta(days=30)
        interval = "day"
    else:  # year
        start = now - timedelta(days=365)
        interval = "month"

    result = await db.execute(
        select(
            func.date_trunc(interval, Order.created_at).label("date"),
            func.sum(Order.total_amount).label("revenue"),
            func.count(Order.id).label("orders"),
        )
        .where(
            Order.status == OrderStatus.FULFILLED,
            Order.created_at >= start,
        )
        .group_by(func.date_trunc(interval, Order.created_at))
        .order_by("date")
    )

    data = []
    for row in result.all():
        data.append({
            "date": row.date.isoformat() if row.date else "",
            "revenue": float(row.revenue) if row.revenue else 0,
            "orders": row.orders,
        })

    return {"period": period, "interval": interval, "data": data}


@router.get("/top-content")
async def get_top_content(
    admin = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get top 10 content by purchase count."""
    result = await db.execute(
        select(
            OrderItem.item_type,
            OrderItem.item_id,
            func.count(OrderItem.id).label("purchase_count"),
        )
        .join(Order)
        .where(Order.status == OrderStatus.FULFILLED)
        .group_by(OrderItem.item_type, OrderItem.item_id)
        .order_by(desc("purchase_count"))
        .limit(10)
    )

    items = []
    for row in result.all():
        # Get item title
        title = "Unknown"
        if row.item_type.value == "music":
            r = await db.execute(select(Music.title).where(Music.id == row.item_id))
            title = r.scalar() or "Unknown"
        elif row.item_type.value == "book":
            r = await db.execute(select(Book.title).where(Book.id == row.item_id))
            title = r.scalar() or "Unknown"
        elif row.item_type.value == "score":
            r = await db.execute(select(Score.title).where(Score.id == row.item_id))
            title = r.scalar() or "Unknown"

        items.append({
            "type": row.item_type.value,
            "id": str(row.item_id),
            "title": title,
            "purchase_count": row.purchase_count,
        })

    return {"items": items}


@router.get("/users-growth")
async def get_user_growth(
    period: str = Query("month"),
    admin = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get user registration growth over time."""
    now = datetime.now(timezone.utc)

    if period == "day":
        start = now - timedelta(days=1)
        interval = "hour"
    elif period == "week":
        start = now - timedelta(weeks=1)
        interval = "day"
    elif period == "month":
        start = now - timedelta(days=30)
        interval = "day"
    else:
        start = now - timedelta(days=365)
        interval = "month"

    result = await db.execute(
        select(
            func.date_trunc(interval, User.created_at).label("date"),
            func.count(User.id).label("count"),
        )
        .where(User.created_at >= start)
        .group_by(func.date_trunc(interval, User.created_at))
        .order_by("date")
    )

    data = []
    for row in result.all():
        data.append({
            "date": row.date.isoformat() if row.date else "",
            "users": row.count,
        })

    return {"period": period, "data": data}
