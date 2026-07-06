from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
import json
from app.db.database import get_db
from app.models.models import Order, OrderItem, OrderStatus, Content, CartItem, User, PendingOrder
from app.schemas.schemas import (
    OrderCreate, OrderRead, CheckoutSessionResponse, CartItemCreate, CartItemRead
)
from app.core.deps import get_current_user
from app.services.stripe_service import StripeService
from app.core.config import settings

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/cart", response_model=List[CartItemRead])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's cart"""
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    return cart_items


@router.post("/cart", response_model=CartItemRead)
def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add item to cart"""
    # Validate quantity
    if item.quantity <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than 0")
    
    # Check if content exists
    content = db.query(Content).filter(Content.id == item.content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Check if already in cart
    existing = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.content_id == item.content_id
    ).first()
    
    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        return existing
    
    cart_item = CartItem(
        user_id=current_user.id,
        content_id=item.content_id,
        quantity=item.quantity
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.delete("/cart/{cart_item_id}")
def remove_from_cart(
    cart_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove item from cart"""
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.user_id == current_user.id
    ).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}


@router.post("/checkout", response_model=CheckoutSessionResponse)
def create_checkout_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create Stripe checkout session for cart items.
    
    SECURITY FIX: Instead of serializing the entire cart into Stripe metadata
    (which has a 500-character limit per key), we:
    1. Create a PendingOrder record server-side with the cart contents
    2. Store only the PendingOrder UUID in Stripe metadata
    3. The webhook retrieves the full cart from the PendingOrder
    """
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    
    # Build cart data and line items
    items = []
    cart_data = []
    for cart_item in cart_items:
        content = cart_item.content
        if content.price is None:
            continue
        items.append({
            "name": content.title,
            "description": content.description[:200] if content.description else "",
            "price": float(content.price),
            "currency": content.currency.lower() or "usd",
            "quantity": cart_item.quantity,
            "image": content.cover_image_url
        })
        cart_data.append({
            "content_id": cart_item.content_id,
            "qty": cart_item.quantity
        })
    
    if not items:
        raise HTTPException(status_code=400, detail="No purchasable items in cart")
    
    # Create a PendingOrder to store cart data server-side
    pending_order_id = str(uuid.uuid4())
    pending_order = PendingOrder(
        id=pending_order_id,
        user_id=current_user.id,
        cart_data=json.dumps(cart_data),
        status="pending"
    )
    db.add(pending_order)
    db.commit()
    
    # Store ONLY the pending_order_id in metadata (well under 500 chars)
    success_url = f"{settings.FRONTEND_URL}/orders/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{settings.FRONTEND_URL}/cart"
    
    metadata = {
        "user_id": str(current_user.id),
        "pending_order_id": pending_order_id
    }
    
    session = StripeService.create_checkout_session(
        items=items,
        customer_email=current_user.email,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata=metadata
    )
    
    # Update pending order with Stripe session ID
    pending_order.stripe_session_id = session["session_id"]
    db.commit()
    
    return session


@router.get("", response_model=List[OrderRead])
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's orders"""
    return db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).all()


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get order details"""
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
