"""Checkout router - Stripe payment sessions and webhooks."""

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.database import get_db
from app.models.user import User
from app.models.order import Order, OrderStatus
from app.schemas.order import CartItem
from app.middleware.auth import get_current_user
from app.services.stripe_service import (
    create_checkout_session,
    handle_webhook,
    fulfill_order,
)

router = APIRouter(prefix="/checkout", tags=["Checkout"])


@router.post("/create-session")
async def create_session(
    items: list[CartItem],
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a Stripe Checkout session for the cart items."""
    if not items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty",
        )

    try:
        session = await create_checkout_session(
            cart_items=items,
            user=user,
            success_url=f"{settings.FRONTEND_URL}/checkout/success",
            cancel_url=f"{settings.FRONTEND_URL}/cart",
            db=db,
        )
        return {"url": session.url, "session_id": session.id}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create checkout session: {str(e)}",
        )


@router.get("/success")
async def checkout_success(
    session_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Handle successful checkout - fulfill the order."""
    try:
        await fulfill_order(session_id, db)

        # Get the fulfilled order
        result = await db.execute(
            select(Order).where(Order.stripe_session_id == session_id)
        )
        order = result.scalar_one_or_none()

        # Get download links and tickets
        downloads = []
        tickets = []
        for item in order.items if order else []:
            if item.watermarked_url:
                downloads.append({
                    "type": item.item_type.value,
                    "url": item.watermarked_url,
                })

        return {
            "success": True,
            "order_id": str(order.id) if order else None,
            "downloads": downloads,
            "tickets": tickets,
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fulfill order: {str(e)}",
        )


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Handle Stripe webhook events."""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header",
        )

    success = await handle_webhook(payload, sig_header, db)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Webhook processing failed",
        )

    return {"status": "ok"}
