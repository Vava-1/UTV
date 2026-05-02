import stripe
from typing import Optional, List, Dict, Any
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


class StripeService:
    @staticmethod
    def create_checkout_session(
        items: List[Dict[str, Any]],
        customer_email: str,
        success_url: str,
        cancel_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """Create a Stripe Checkout Session for purchasing books/scores"""
        line_items = []
        for item in items:
            line_items.append({
                "price_data": {
                    "currency": item.get("currency", "usd"),
                    "product_data": {
                        "name": item["name"],
                        "description": item.get("description", ""),
                        "images": [item["image"]] if item.get("image") else [],
                    },
                    "unit_amount": int(item["price"] * 100),  # Convert to cents
                },
                "quantity": item.get("quantity", 1),
            })
        
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=customer_email,
            metadata=metadata or {},
        )
        
        return {"session_id": session.id, "url": session.url}
    
    @staticmethod
    def create_concert_ticket_session(
        concert_name: str,
        ticket_price: float,
        quantity: int,
        customer_email: str,
        success_url: str,
        cancel_url: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, str]:
        """Create a Stripe Checkout Session for concert tickets"""
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": f"Concert Ticket: {concert_name}",
                    },
                    "unit_amount": int(ticket_price * 100),
                },
                "quantity": quantity,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            customer_email=customer_email,
            metadata=metadata or {},
        )
        
        return {"session_id": session.id, "url": session.url}
    
    @staticmethod
    def retrieve_session(session_id: str) -> Dict[str, Any]:
        """Retrieve a checkout session by ID"""
        return stripe.checkout.Session.retrieve(session_id)
    
    @staticmethod
    def construct_event(payload: bytes, sig_header: str, webhook_secret: str):
        """Construct a Stripe webhook event"""
        return stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> str:
        """Create a Stripe customer"""
        customer = stripe.Customer.create(
            email=email,
            name=name or email
        )
        return customer.id
