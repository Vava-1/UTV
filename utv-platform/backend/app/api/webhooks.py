from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Order, OrderItem, OrderStatus, Ticket, TicketStatus, Content, User, CartItem
from app.services.stripe_service import StripeService
from app.services.pdf_service import generate_watermarked_pdf_for_user
from app.services.s3_service import get_s3_service
from app.core.config import settings
import json
import ast

router = APIRouter(prefix="/webhooks", tags=["Webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request, db: Session = Depends(get_db)):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    try:
        if settings.STRIPE_WEBHOOK_SECRET:
            event = StripeService.construct_event(payload, sig_header, settings.STRIPE_WEBHOOK_SECRET)
        else:
            # For testing without webhook secret
            event = json.loads(payload)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")
    
    event_type = event["type"]
    
    if event_type == "checkout.session.completed":
        session = event["data"]["object"]
        metadata = session.get("metadata", {})
        user_id = int(metadata.get("user_id", 0))
        
        # Handle product purchases
        if "cart_items" in metadata:
            cart_items_str = metadata["cart_items"]
            try:
                cart_items_data = ast.literal_eval(cart_items_str)
            except:
                cart_items_data = []
            
            # Create order
            order = Order(
                user_id=user_id,
                stripe_checkout_session_id=session["id"],
                total_amount=session["amount_total"] / 100,
                currency=session["currency"].upper(),
                status=OrderStatus.COMPLETED,
                customer_email=session["customer_email"],
                customer_name=session.get("customer_details", {}).get("name", ""),
                stripe_payment_intent_id=session.get("payment_intent")
            )
            db.add(order)
            db.commit()
            db.refresh(order)
            
            # Create order items
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
                    
                    # Increment download count
                    content.download_count += 1
            
            # Clear cart
            db.query(CartItem).filter(CartItem.user_id == user_id).delete()
            db.commit()
        
        # Handle concert ticket purchases
        elif "concert_id" in metadata:
            concert_id = int(metadata["concert_id"])
            quantity = int(metadata["quantity"])
            seat_info = metadata.get("seat_info", "")
            
            concert = db.query(Content).filter(Content.id == concert_id).first()
            if concert:
                # Update available tickets
                if concert.available_tickets is not None:
                    concert.available_tickets -= quantity
                    db.commit()
                
                # Create tickets
                for i in range(quantity):
                    ticket = Ticket(
                        user_id=user_id,
                        concert_id=concert_id,
                        ticket_number=f"UTV-{concert_id}-{user_id}-{session['id'][:8]}-{i+1}",
                        seat_info=seat_info,
                        price_paid=concert.ticket_price or 0,
                        status=TicketStatus.SOLD,
                        stripe_payment_intent_id=session.get("payment_intent")
                    )
                    db.add(ticket)
                
                db.commit()
    
    elif event_type == "payment_intent.payment_failed":
        # Handle failed payment
        pass
    
    return {"status": "success"}
