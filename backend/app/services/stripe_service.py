"""Stripe payment service for checkout, webhooks, and order fulfillment."""

import io
import logging
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

import stripe
import qrcode
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models.user import User
from app.models.order import Order, OrderItem, OrderStatus, OrderItemType
from app.models.event import Event, Ticket, TicketStatus
from app.schemas.order import CartItem
from app.services.email_service import send_order_confirmation_email

logger = logging.getLogger(__name__)

stripe.api_key = settings.STRIPE_SECRET_KEY


async def create_checkout_session(
    cart_items: List[CartItem],
    user: User,
    success_url: str,
    cancel_url: str,
    db: AsyncSession,
) -> stripe.checkout.Session:
    """Create a Stripe Checkout session from cart items.

    Args:
        cart_items: List of items to purchase.
        user: The purchasing user.
        success_url: URL to redirect after successful payment.
        cancel_url: URL to redirect if payment cancelled.
        db: Database session.

    Returns:
        Stripe Checkout Session object.
    """
    line_items = []
    total_amount = Decimal("0.00")

    for item in cart_items:
        # Resolve item from database
        title = "Unknown Item"
        unit_price = Decimal("0.00")

        if item.item_type == "music":
            from app.models.content import Music
            result = await db.execute(select(Music).where(Music.id == item.item_id))
            music = result.scalar_one_or_none()
            if music:
                title = music.title
                unit_price = music.price if not music.is_free else Decimal("0.00")

        elif item.item_type == "book":
            from app.models.content import Book
            result = await db.execute(select(Book).where(Book.id == item.item_id))
            book = result.scalar_one_or_none()
            if book:
                title = book.title
                unit_price = book.price

        elif item.item_type == "score":
            from app.models.content import Score
            result = await db.execute(select(Score).where(Score.id == item.item_id))
            score = result.scalar_one_or_none()
            if score:
                title = score.title
                unit_price = score.price

        elif item.item_type == "ticket":
            result = await db.execute(select(Event).where(Event.id == item.item_id))
            event = result.scalar_one_or_none()
            if event:
                title = f"Ticket: {event.title}"
                unit_price = event.price

        # Convert to cents for Stripe
        unit_amount_cents = int(unit_price * 100)
        if unit_amount_cents > 0:
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "unit_amount": unit_amount_cents,
                    "product_data": {"name": title},
                },
                "quantity": item.quantity,
            })

        total_amount += unit_price * item.quantity

    if not line_items:
        raise ValueError("Cart is empty or all items are free")

    # Create Stripe checkout session
    session = stripe.checkout.Session.create(
        payment_method_types=["card"],
        line_items=line_items,
        mode="payment",
        success_url=success_url + "?session_id={CHECKOUT_SESSION_ID}",
        cancel_url=cancel_url,
        customer_email=user.email,
        metadata={"user_id": str(user.id)},
    )

    # Create pending order in database
    order = Order(
        user_id=user.id,
        status=OrderStatus.PENDING,
        total_amount=total_amount,
        stripe_session_id=session.id,
        currency="usd",
    )
    db.add(order)
    await db.flush()

    # Create order items
    for item in cart_items:
        unit_price = Decimal("0.00")
        if item.item_type == "music":
            from app.models.content import Music
            result = await db.execute(select(Music).where(Music.id == item.item_id))
            music = result.scalar_one_or_none()
            unit_price = music.price if music else Decimal("0.00")
        elif item.item_type == "book":
            from app.models.content import Book
            result = await db.execute(select(Book).where(Book.id == item.item_id))
            book = result.scalar_one_or_none()
            unit_price = book.price if book else Decimal("0.00")
        elif item.item_type == "score":
            from app.models.content import Score
            result = await db.execute(select(Score).where(Score.id == item.item_id))
            score = result.scalar_one_or_none()
            unit_price = score.price if score else Decimal("0.00")
        elif item.item_type == "ticket":
            result = await db.execute(select(Event).where(Event.id == item.item_id))
            event = result.scalar_one_or_none()
            unit_price = event.price if event else Decimal("0.00")

        order_item = OrderItem(
            order_id=order.id,
            item_type=OrderItemType(item.item_type),
            item_id=item.item_id,
            quantity=item.quantity,
            unit_price=unit_price,
        )
        db.add(order_item)

    await db.commit()
    return session


async def fulfill_order(session_id: str, db: AsyncSession) -> None:
    """Fulfill an order after successful Stripe payment.

    Args:
        session_id: The Stripe checkout session ID.
        db: Database session.
    """
    result = await db.execute(
        select(Order).where(Order.stripe_session_id == session_id)
    )
    order = result.scalar_one_or_none()
    if not order:
        logger.error(f"Order not found for session {session_id}")
        return

    # Update order status
    order.status = OrderStatus.PAID

    # Get user
    user_result = await db.execute(select(User).where(User.id == order.user_id))
    user = user_result.scalar_one_or_none()

    # Process each order item
    for item in order.items:
        # Watermark books and scores
        if item.item_type in (OrderItemType.BOOK, OrderItemType.SCORE):
            try:
                from app.services.s3_service import S3Service
                from app.services.pdf_watermark import watermark_and_upload
                s3 = S3Service()

                # Get PDF URL
                if item.item_type == OrderItemType.BOOK:
                    from app.models.content import Book
                    r = await db.execute(select(Book).where(Book.id == item.item_id))
                    content = r.scalar_one_or_none()
                else:
                    from app.models.content import Score
                    r = await db.execute(select(Score).where(Score.id == item.item_id))
                    content = r.scalar_one_or_none()

                if content and content.pdf_url and user:
                    watermarked_url = await watermark_and_upload(
                        content.pdf_url,
                        user.email,
                        str(item.id),
                        s3,
                    )
                    item.watermarked_url = watermarked_url
            except Exception as e:
                logger.error(f"Failed to watermark item {item.id}: {e}")

        # Create tickets for events
        elif item.item_type == OrderItemType.TICKET:
            try:
                event_result = await db.execute(
                    select(Event).where(Event.id == item.item_id)
                )
                event = event_result.scalar_one_or_none()
                if event and user:
                    for _ in range(item.quantity):
                        ticket_code = str(uuid.uuid4())

                        # Generate QR code
                        qr = qrcode.make(ticket_code)
                        qr_buffer = io.BytesIO()
                        qr.save(qr_buffer, format="PNG")
                        qr_buffer.seek(0)

                        # Upload QR to S3
                        from app.services.s3_service import S3Service
                        s3 = S3Service()
                        qr_key = f"tickets/qrcodes/{ticket_code}.png"
                        await s3.upload_bytes(qr_buffer.getvalue(), qr_key, "image/png")
                        qr_url = await s3.get_presigned_url(qr_key, expiry=86400 * 30)

                        ticket = Ticket(
                            user_id=user.id,
                            event_id=event.id,
                            order_item_id=item.id,
                            ticket_code=ticket_code,
                            qr_code_url=qr_url,
                            status=TicketStatus.VALID,
                        )
                        db.add(ticket)

                    event.tickets_sold += item.quantity
            except Exception as e:
                logger.error(f"Failed to create tickets for item {item.id}: {e}")

    # Finalize order
    order.status = OrderStatus.FULFILLED
    await db.commit()

    # Send confirmation email
    if user:
        try:
            await send_order_confirmation_email(order, user)
        except Exception as e:
            logger.error(f"Failed to send confirmation email: {e}")


async def handle_webhook(payload: bytes, sig_header: str, db: AsyncSession) -> bool:
    """Handle Stripe webhook events.

    Args:
        payload: Raw request body bytes.
        sig_header: Stripe-Signature header value.
        db: Database session.

    Returns:
        True if handled successfully.
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        logger.error("Invalid webhook payload")
        return False
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid webhook signature")
        return False

    logger.info(f"Stripe webhook: {event['type']}")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        await fulfill_order(session["id"], db)

    elif event["type"] == "payment_intent.payment_failed":
        intent = event["data"]["object"]
        session_id = intent.get("metadata", {}).get("checkout_session_id")
        if session_id:
            result = await db.execute(
                select(Order).where(Order.stripe_session_id == session_id)
            )
            order = result.scalar_one_or_none()
            if order:
                order.status = OrderStatus.CANCELLED
                await db.commit()

    elif event["type"] == "charge.refunded":
        charge = event["data"]["object"]
        session_id = charge.get("metadata", {}).get("checkout_session_id")
        if session_id:
            result = await db.execute(
                select(Order).where(Order.stripe_session_id == session_id)
            )
            order = result.scalar_one_or_none()
            if order:
                order.status = OrderStatus.REFUNDED
                await db.commit()

    return True
