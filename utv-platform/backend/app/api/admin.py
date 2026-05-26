from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.models import (
    User, UserRole, Content, Order, OrderStatus, Ticket,
    AnalyticsEvent, ContentType, NewsletterSubscriber
)
from app.schemas.schemas import (
    AnalyticsSummary, UserRead, OrderRead, ContentRead,
    NewsletterSubscriberRead
)
from app.core.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@router.get("/analytics", response_model=AnalyticsSummary)
def get_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)  # SECURITY: admin only
):
    """Get dashboard analytics — admin only"""
    total_users = db.query(User).filter(User.role == UserRole.USER).count()
    total_orders = db.query(Order).filter(Order.status == OrderStatus.COMPLETED).count()
    total_revenue = (
        db.query(func.sum(Order.total_amount))
        .filter(Order.status == OrderStatus.COMPLETED)
        .scalar() or 0
    )
    total_tickets_sold = db.query(Ticket).filter(Ticket.status == "sold").count()
    total_downloads = db.query(func.sum(Content.download_count)).scalar() or 0

    recent_orders = db.query(Order).order_by(Order.created_at.desc()).limit(10).all()
    popular_content = db.query(Content).order_by(Content.view_count.desc()).limit(10).all()

    return {
        "total_users": total_users,
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "total_tickets_sold": total_tickets_sold,
        "total_downloads": total_downloads,
        "recent_orders": recent_orders,
        "popular_content": popular_content,
    }


@router.get("/users", tags=["Admin"])
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """List all users — admin only"""
    users = db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "first_name": u.first_name,
            "last_name": u.last_name,
            "role": u.role.value,
            "is_active": u.is_active,
            "created_at": str(u.created_at)
        }
        for u in users
    ]


@router.put("/users/{user_id}/toggle-active", tags=["Admin"])
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin)
):
    """Toggle user active status — admin only"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_admin.id:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}", "is_active": user.is_active}


@router.get("/contents", response_model=List[ContentRead])
def list_all_contents(
    content_type: Optional[str] = None,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """List all contents including unpublished — admin only"""
    query = db.query(Content)
    if content_type:
        query = query.filter(Content.content_type == content_type)
    return query.order_by(Content.created_at.desc()).all()


@router.get("/orders", response_model=List[OrderRead])
def list_all_orders(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """List all orders — admin only"""
    return db.query(Order).order_by(Order.created_at.desc()).limit(200).all()


@router.post("/orders/{order_id}/refund")
def refund_order(
    order_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """Mark an order as refunded — admin only"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status == OrderStatus.REFUNDED:
        raise HTTPException(status_code=400, detail="Order already refunded")

    order.status = OrderStatus.REFUNDED
    db.commit()
    return {"message": f"Order #{order_id} marked as refunded"}


@router.get("/tickets")
def list_all_tickets(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """List all tickets — admin only"""
    return db.query(Ticket).order_by(Ticket.purchased_at.desc()).limit(200).all()


@router.get("/newsletter/subscribers", response_model=List[NewsletterSubscriberRead])
def list_newsletter_subscribers(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """List all newsletter subscribers — admin only"""
    return db.query(NewsletterSubscriber).order_by(
        NewsletterSubscriber.subscribed_at.desc()
    ).all()


@router.get("/stats/content-by-type")
def content_stats_by_type(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """Content count grouped by type — admin only"""
    results = db.query(Content.content_type, func.count(Content.id)).group_by(Content.content_type).all()
    return {ct: count for ct, count in results}


@router.get("/stats/revenue-by-month")
def revenue_by_month(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """Monthly revenue for last 12 months — admin only"""
    twelve_months_ago = datetime.utcnow() - timedelta(days=365)
    orders = (
        db.query(Order)
        .filter(
            Order.status == OrderStatus.COMPLETED,
            Order.created_at >= twelve_months_ago
        )
        .all()
    )
    monthly = {}
    for o in orders:
        key = o.created_at.strftime("%Y-%m") if o.created_at else "unknown"
        monthly[key] = monthly.get(key, 0) + float(o.total_amount or 0)

    return monthly
