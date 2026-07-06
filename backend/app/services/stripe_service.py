"""
Stripe service — lazy-initialized client.

Why lazy: setting `stripe.api_key = settings.STRIPE_SECRET_KEY` at module
import time means (a) the key is captured at boot and never refreshed, and
(b) if the key is unset at boot, subsequent Stripe calls fail with confusing
errors. Lazy init solves both.

If STRIPE_SECRET_KEY is not set, all methods raise a clear RuntimeError that
the API layer catches and converts to a 503 "service unavailable" response.
"""

import stripe
from typing import Optional, List, Dict, Any
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

_client_initialized = False


def _ensure_initialized():
    """Initialize stripe.api_key lazily and verify it's set."""
    global _client_initialized
    if not settings.STRIPE_SECRET_KEY:
        raise RuntimeError(
            "Stripe is not configured. Set STRIPE_SECRET_KEY to enable payments."
        )
    if not _client_initialized:
        stripe.api_key = settings.STRIPE_SECRET_KEY
        _client_initialized = True


def is_stripe_enabled() -> bool:
    """Check if Stripe is configured. Use this to gate payment endpoints."""
    return bool(settings.STRIPE_SECRET_KEY)


class StripeService:
    """Thin wrapper around the stripe library with lazy init."""

    @staticmethod
    def create_checkout_session(
        items: List[Dict[str, Any]],
        customer_email: str,
        success_url: str,
        cancel_url: str,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, str]:
        """Create a Stripe Checkout Session for purchasing books/scores."""
        _ensure_initialized()
        line_items = []
        for item in items:
            line_items.append({
                "price_data": {
                    "currency": item.get("currency", "usd"),
                    "product_data": {
                        "name": item["name"],
                        "description": item.get("description", "")[:200],  # Stripe limit
                        "images": [item["image"]] if item.get("image") else [],
                    },
                    "unit_amount": int(round(float(item["price"]) * 100)),
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
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, str]:
        """Create a Stripe Checkout Session for concert tickets."""
        _ensure_initialized()
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": f"Concert Ticket: {concert_name}"},
                    "unit_amount": int(round(float(ticket_price) * 100)),
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
        _ensure_initialized()
        return stripe.checkout.Session.retrieve(session_id)

    @staticmethod
    def construct_event(payload: bytes, sig_header: str, webhook_secret: str):
        """Construct a Stripe webhook event with signature verification."""
        # No lazy init here — webhook secret is separate from API key
        return stripe.Webhook.construct_event(payload, sig_header, webhook_secret)

    @staticmethod
    def create_refund(payment_intent_id: str, reason: str = "requested_by_customer"):
        """Create a refund for a given payment intent. Returns the Refund object."""
        _ensure_initialized()
        return stripe.Refund.create(payment_intent=payment_intent_id, reason=reason)

    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> str:
        """Create a Stripe customer. Returns the customer ID."""
        _ensure_initialized()
        customer = stripe.Customer.create(email=email, name=name or email)
        return customer.id
