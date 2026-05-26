from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Order, OrderItem, OrderStatus, Ticket, TicketStatus, Content, User, CartItem
from app.services.stripe_service import StripeService
from app.services.pdf_service import generate_watermarked_pdf_for_user
from app.services.s3_service import get_s3_service
from app.services.email_service import send_order_confirmation
from app.services.qr_service import save_qr_to_local
from app.core.config import settings
import json
import ast
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        if settings.STRIPE_WEBHOOK_SECRET and sig_header:
            event = StripeService.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        else:
            # For testing without webhook secret (dev only)
            event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")

    event_type = event["type"]
    logger.info(f"[Webhook] Received Stripe event: {event_type}")

    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = int(metadata.get("user_id", 0))

        # ── Product Purchases ──────────────────────────────────────────────
        if "cart_items" in metadata:
            cart_items_str = metadata["cart_items"]
            try:
                cart_items_data = ast.literal_eval(cart_items_str)
            except Exception:
                cart_items_data = []

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

            # Send order confirmation email (non-blocking)
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

        # ── Concert Ticket Purchases ───────────────────────────────────────
        elif "concert_id" in metadata:
            concert_id = int(metadata["concert_id"])
            quantity = int(metadata.get("quantity", 1))
            seat_info = metadata.get("seat_info", "")

            concert = db.query(Content).filter(Content.id == concert_id).first()
            if concert:
                # Decrement available tickets
                if concert.available_tickets is not None:
                    concert.available_tickets = max(0, concert.available_tickets - quantity)
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
                    db.flush()  # Flush so ticket gets its ID
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

    elif event_type == "payment_intent.payment_failed":
        logger.warning(f"[Webhook] Payment failed: {event.get('data', {}).get('object', {}).get('id', 'unknown')}")

    return {"status": "success"}
