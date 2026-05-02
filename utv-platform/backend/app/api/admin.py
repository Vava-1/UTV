from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime, timedelta
from app.db.database import get_db
from app.models.models import (
    User, UserRole, Content, Order, OrderStatus, Ticket, 
    AnalyticsEvent, ContentType
)
from app.schemas.schemas import AnalyticsSummary, UserRead, OrderRead, ContentRead
from app.core.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


@router.get("/analytics", response_model=AnalyticsSummary)
def get_analytics(db: Session = Depends(get_db)):
    """Get dashboard analytics"""
    total_users = db.query(User).filter(User.role == UserRole.USER).count()
    total_orders = db.query(Order).filter(Order.status == OrderStatus.COMPLETED).count()
    total_revenue = db.query(func.sum(Order.total_amount)).filter(Order.status == OrderStatus.COMPLETED).scalar() or 0
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
        "popular_content": popular_content
    }


@router.get("/users", response_model=List[UserRead])
def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all users"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/contents", response_model=List[ContentRead])
def list_all_contents(
    content_type: str = None,
    db: Session = Depends(get_db)
):
    """List all contents including unpublished"""
    query = db.query(Content)
    if content_type:
        query = query.filter(Content.content_type == content_type)
    return query.order_by(Content.created_at.desc()).all()


@router.get("/orders", response_model=List[OrderRead])
def list_all_orders(db: Session = Depends(get_db)):
    """List all orders"""
    return db.query(Order).order_by(Order.created_at.desc()).limit(100).all()


@router.get("/tickets")
def list_all_tickets(db: Session = Depends(get_db)):
    """List all tickets"""
    return db.query(Ticket).order_by(Ticket.purchased_at.desc()).limit(100).all()


@router.put("/users/{user_id}/toggle-active")
def toggle_user_active(user_id: int, db: Session = Depends(get_db)):
    """Toggle user active status"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = not user.is_active
    db.commit()
    return {"message": f"User {'activated' if user.is_active else 'deactivated'}"}
