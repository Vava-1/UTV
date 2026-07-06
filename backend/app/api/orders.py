"""
Orders & cart API.

Refactored to use lazy StripeService (no module-level stripe.api_key assignment).
Returns 503 if Stripe isn't configured.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import json
from app.db.database import get_db
from app.models.models import Order, OrderItem, OrderStatus, Content, CartItem, User, PendingOrder
from app.schemas.schemas import (
    OrderRead, CheckoutSessionResponse, CartItemCreate, CartItemRead
)
from app.core.deps import get_current_user
from app.services.stripe_service import StripeService, is_stripe_enabled
from app.core.config import settings

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("/cart", response_model=List[CartItemRead])
def get_cart(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's cart"""
    return db.query(CartItem).filter(CartItem.user_id == current_user.id).all()


@router.post("/cart", response_model=CartItemRead)
def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add item to cart (quantity > 0 enforced by schema)"""
    content = db.query(Content).filter(Content.id == item.content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    existing = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.content_id == item.content_id,
    ).first()

    if existing:
        existing.quantity += item.quantity
        db.commit()
        db.refresh(existing)
        return existing

    cart_item = CartItem(
        user_id=current_user.id,
        content_id=item.content_id,
        quantity=item.quantity,
    )
    db.add(cart_item)
    db.commit()
    db.refresh(cart_item)
    return cart_item


@router.delete("/cart/{cart_item_id}")
def remove_from_cart(
    cart_item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove item from cart"""
    cart_item = db.query(CartItem).filter(
        CartItem.id == cart_item_id,
        CartItem.user_id == current_user.id,
    ).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    db.delete(cart_item)
    db.commit()
    return {"message": "Item removed from cart"}


@router.post("/checkout", response_model=CheckoutSessionResponse)
def create_checkout_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create Stripe checkout session for cart items.

    Uses PendingOrder to store cart server-side (avoids Stripe's 500-char
    metadata limit). Returns 503 if Stripe isn't configured.
    """
    if not is_stripe_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payments are not configured. Set STRIPE_SECRET_KEY to enable checkout.",
        )

    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    items = []
    cart_data = []
    for cart_item in cart_items:
        content = cart_item.content
        if content.price is None:
            continue
        items.append({
            "name": content.title,
            "description": (content.description or "")[:200],
            "price": float(content.price),
            "currency": (content.currency or "usd").lower(),
            "quantity": cart_item.quantity,
            "image": content.cover_image_url,
        })
        cart_data.append({
            "content_id": cart_item.content_id,
            "qty": cart_item.quantity,
        })

    if not items:
        raise HTTPException(status_code=400, detail="No purchasable items in cart")

    # Create PendingOrder to store cart server-side
    pending_order_id = str(uuid.uuid4())
    pending_order = PendingOrder(
        id=pending_order_id,
        user_id=current_user.id,
        cart_data=json.dumps(cart_data),
        status="pending",
    )
    db.add(pending_order)
    db.commit()

    success_url = f"{settings.FRONTEND_URL}/orders/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{settings.FRONTEND_URL}/cart"

    session = StripeService.create_checkout_session(
        items=items,
        customer_email=current_user.email,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": str(current_user.id),
            "pending_order_id": pending_order_id,
        },
    )

    pending_order.stripe_session_id = session["session_id"]
    db.commit()

    return session


@router.get("", response_model=List[OrderRead])
def list_orders(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's orders"""
    return (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )


@router.get("/{order_id}", response_model=OrderRead)
def get_order(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get order details"""
    order = db.query(Order).filter(
        Order.id == order_id, Order.user_id == current_user.id
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
