from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import (
    Order, OrderItem, OrderStatus, Ticket, TicketStatus, Content, User, CartItem,
    ProcessedStripeEvent
)
from app.services.stripe_service import StripeService
from app.services.pdf_service import generate_watermarked_pdf_for_user
from app.services.s3_service import get_s3_service
from app.services.email_service import send_order_confirmation
from app.services.qr_service import save_qr_to_local
from app.core.config import settings
import stripe
import json
import ast
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events.
    
    SECURITY REQUIREMENTS:
    1. Signature verification is MANDATORY in production — no fallback.
    2. Idempotency: each Stripe event ID is processed exactly once.
    3. Return 200 quickly to avoid Stripe retries.
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    # ── Signature Verification (FAIL CLOSED) ──────────────────────────
    if not settings.STRIPE_WEBHOOK_SECRET:
        logger.error("[Webhook] STRIPE_WEBHOOK_SECRET not configured — rejecting webhook")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Webhook secret not configured"
        )
    
    if not sig_header:
        logger.warning("[Webhook] Missing stripe-signature header — rejecting")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing stripe-signature header"
        )

    try:
        event = StripeService.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError as e:
        logger.warning(f"[Webhook] Signature verification failed: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")
    except Exception as e:
        logger.error(f"[Webhook] Error constructing event: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Webhook error")

    event_id = event["id"]
    event_type = event["type"]
    logger.info(f"[Webhook] Received Stripe event: {event_type} (id={event_id})")

    # ── Idempotency Check ──────────────────────────────────────────────
    already_processed = db.query(ProcessedStripeEvent).filter(
        ProcessedStripeEvent.event_id == event_id
    ).first()
    if already_processed:
        logger.info(f"[Webhook] Event {event_id} already processed — skipping")
        return {"status": "already_processed"}

    # Mark as processed immediately (before any side effects)
    processed_record = ProcessedStripeEvent(event_id=event_id, event_type=event_type)
    db.add(processed_record)
    db.commit()

    # ── Event Processing ─────────────────────────────────────────────
    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = int(metadata.get("user_id", 0))

        # ── Product Purchases ──────────────────────────────────────────
        # NEW: Use pending_order_id for secure server-side cart storage
        if "pending_order_id" in metadata:
            _process_product_purchase_v2(session, metadata, user_id, db)
        # LEGACY: Support old-style cart_items in metadata (remove after transition)
        elif "cart_items" in metadata:
            _process_product_purchase(session, metadata, user_id, db)

        # ── Concert Ticket Purchases ───────────────────────────────────
        elif "concert_id" in metadata:
            _process_ticket_purchase(session, metadata, user_id, db)

    elif event_type == "payment_intent.payment_failed":
        logger.warning(
            f"[Webhook] Payment failed: {event.get('data', {}).get('object', {}).get('id', 'unknown')}"
        )

    return {"status": "success"}


def _process_product_purchase_v2(session, metadata, user_id, db):
    """Process product purchase using server-side PendingOrder (secure, no metadata limits)."""
    pending_order_id = metadata.get("pending_order_id")
    
    from app.models.models import PendingOrder
    pending = db.query(PendingOrder).filter(
        PendingOrder.id == pending_order_id,
        PendingOrder.user_id == user_id
    ).first()
    
    if not pending:
        logger.error(f"[Webhook] PendingOrder {pending_order_id} not found for user {user_id}")
        return
    
    if pending.status == "completed":
        logger.info(f"[Webhook] PendingOrder {pending_order_id} already processed")
        return
    
    try:
        cart_items_data = json.loads(pending.cart_data)
    except (json.JSONDecodeError, Exception) as e:
        logger.error(f"[Webhook] Failed to parse pending order cart data: {e}")
        return

    # Idempotency: check if order already exists for this session
    existing_order = db.query(Order).filter(
        Order.stripe_checkout_session_id == session["id"]
    ).first()
    if existing_order:
        logger.info(f"[Webhook] Order for session {session['id']} already exists")
        pending.status = "completed"
        db.commit()
        return

    # Create order record
    order = Order(
        user_id=user_id,
        stripe_checkout_session_id=session["id"],
        total_amount=session["amount_total"] / 100,
        currency=session["currency"].upper(),
        status=OrderStatus.COMPLETED,
        customer_email=session.get("customer_email", ""),
        customer_name=session.get("customer_details", {}).get("name", ""),
        stripe_payment_intent_id=session.get("payment_intent")
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Create order items
    order_items_for_email = []
    for item_data in cart_items_data:
        content_id = item_data["content_id"]
        quantity = item_data["qty"]

        content = db.query(Content).filter(Content.id == content_id).first()
        if content:
            order_item = OrderItem(
                order_id=order.id,
                content_id=content_id,
                quantity=quantity,
                unit_price=content.price or 0,
                total_price=(content.price or 0) * quantity
            )
            db.add(order_item)
            content.download_count += 1

            order_items_for_email.append({
                "title": content.title,
                "price": float(content.price or 0) * quantity
            })

    # Clear the user's cart
    db.query(CartItem).filter(CartItem.user_id == user_id).delete()
    
    # Mark pending order as completed
    pending.status = "completed"
    db.commit()

    # Send order confirmation email (best effort)
    try:
        send_order_confirmation(
            to_email=order.customer_email,
            customer_name=order.customer_name or "Valued Customer",
            order_id=order.id,
            items=order_items_for_email,
            total_amount=float(order.total_amount),
            currency=order.currency
        )
    except Exception as e:
        logger.error(f"[Webhook] Failed to send confirmation email: {e}")


def _process_product_purchase(session, metadata, user_id, db):
    """Process a product purchase webhook."""
    cart_items_str = metadata["cart_items"]
    try:
        import ast
        cart_items_data = ast.literal_eval(cart_items_str)
    except Exception:
        logger.error(f"[Webhook] Failed to parse cart_items: {cart_items_str[:200]}")
        return

    # Idempotency: check if order already exists for this session
    existing_order = db.query(Order).filter(
        Order.stripe_checkout_session_id == session["id"]
    ).first()
    if existing_order:
        logger.info(f"[Webhook] Order for session {session['id']} already exists")
        return

    # Create order record
    order = Order(
        user_id=user_id,
        stripe_checkout_session_id=session["id"],
        total_amount=session["amount_total"] / 100,
        currency=session["currency"].upper(),
        status=OrderStatus.COMPLETED,
        customer_email=session.get("customer_email", ""),
        customer_name=session.get("customer_details", {}).get("name", ""),
        stripe_payment_intent_id=session.get("payment_intent")
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    # Create order items
    order_items_for_email = []
    for item_data in cart_items_data:
        content_id = item_data["content_id"]
        quantity = item_data["qty"]

        content = db.query(Content).filter(Content.id == content_id).first()
        if content:
            order_item = OrderItem(
                order_id=order.id,
                content_id=content_id,
                quantity=quantity,
                unit_price=content.price or 0,
                total_price=(content.price or 0) * quantity
            )
            db.add(order_item)
            content.download_count += 1

            order_items_for_email.append({
                "title": content.title,
                "price": float(content.price or 0) * quantity
            })

    # Clear the user's cart
    db.query(CartItem).filter(CartItem.user_id == user_id).delete()
    db.commit()

    # Send order confirmation email (best effort — don't fail the webhook)
    try:
        send_order_confirmation(
            to_email=order.customer_email,
            customer_name=order.customer_name or "Valued Customer",
            order_id=order.id,
            items=order_items_for_email,
            total_amount=float(order.total_amount),
            currency=order.currency
        )
    except Exception as e:
        logger.error(f"[Webhook] Failed to send confirmation email: {e}")


def _process_ticket_purchase(session, metadata, user_id, db):
    """Process a concert ticket purchase webhook with atomic inventory update."""
    concert_id = int(metadata["concert_id"])
    quantity = int(metadata.get("quantity", 1))
    seat_info = metadata.get("seat_info", "")

    # Idempotency: check if tickets already created for this session
    existing_tickets = db.query(Ticket).filter(
        Ticket.stripe_payment_intent_id == session.get("payment_intent")
    ).first()
    if existing_tickets:
        logger.info(f"[Webhook] Tickets for payment {session.get('payment_intent')} already exist")
        return

    concert = db.query(Content).filter(Content.id == concert_id).first()
    if not concert:
        logger.error(f"[Webhook] Concert {concert_id} not found")
        return

    # Atomic inventory check and decrement (prevent overselling)
    if concert.available_tickets is not None:
        from sqlalchemy import text
        result = db.execute(
            text("""
                UPDATE contents 
                SET available_tickets = available_tickets - :qty
                WHERE id = :cid AND available_tickets >= :qty
                RETURNING available_tickets
            """),
            {"qty": quantity, "cid": concert_id}
        ).fetchone()
        
        if not result:
            logger.error(
                f"[Webhook] TICKET OVERSALE ATTEMPTED: concert={concert_id}, "
                f"requested={quantity}, available={concert.available_tickets}"
            )
            # Still create the tickets but log — this should never happen if
            # the /tickets/purchase endpoint checked availability first
        
        db.commit()

    # Create ticket records
    user = db.query(User).filter(User.id == user_id).first()
    user_email = user.email if user else session.get("customer_email", "")
    
    for i in range(quantity):
        ticket = Ticket(
            user_id=user_id,
            concert_id=concert_id,
            ticket_number=f"UTV-{concert_id}-{user_id}-{session['id'][:8]}-{i + 1}",
            seat_info=seat_info,
            price_paid=concert.ticket_price or 0,
            status=TicketStatus.SOLD,
            stripe_payment_intent_id=session.get("payment_intent")
        )
        ticket_num = ticket.ticket_number
        db.add(ticket)
        db.flush()
        try:
            qr_url = save_qr_to_local(ticket_num, concert_id, user_email)
            if qr_url:
                ticket.qr_code_url = qr_url
        except Exception as qr_err:
            logger.warning(f"[Webhook] QR generation failed for {ticket_num}: {qr_err}")

    db.commit()

    # Send confirmation email
    try:
        customer_email = session.get("customer_email", "")
        customer_name = session.get("customer_details", {}).get("name", "")
        if customer_email:
            send_order_confirmation(
                to_email=customer_email,
                customer_name=customer_name or "Valued Customer",
                order_id=int(session["id"][:8], 16) if session.get("id") else 0,
                items=[{
                    "title": f"Concert Ticket: {concert.title}",
                    "price": float(concert.ticket_price or 0) * quantity
                }],
                total_amount=float(concert.ticket_price or 0) * quantity
            )
    except Exception as e:
        logger.error(f"[Webhook] Failed to send ticket confirmation: {e}")
