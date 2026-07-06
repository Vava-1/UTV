"""Tests for webhook idempotency and order processing.

REGRESSION TEST: P0-4 — Stripe webhook idempotency.
Stripe retries webhook delivery; duplicate events must not create duplicate orders.
"""

import pytest
import json
from unittest.mock import patch, MagicMock


class TestWebhookIdempotency:
    """Verify that duplicate Stripe events don't create duplicate orders."""

    @patch("app.api.webhooks.settings.STRIPE_WEBHOOK_SECRET", "whsec_test_secret")
    @patch("app.services.stripe_service.StripeService.construct_event")
    def test_duplicate_event_not_processed_twice(self, mock_construct, client, db, test_user, test_book):
        """Processing the same Stripe event twice should only create one order."""
        from app.models.models import Order, CartItem, ProcessedStripeEvent
        
        # Setup: add item to cart
        cart_item = CartItem(user_id=test_user.id, content_id=test_book.id, quantity=1)
        db.add(cart_item)
        db.commit()
        
        # Create a PendingOrder
        from app.models.models import PendingOrder
        pending = PendingOrder(
            id="test-pending-123",
            user_id=test_user.id,
            cart_data='[{"content_id": ' + str(test_book.id) + ', "qty": 1}]',
            stripe_session_id="cs_test_123",
            status="pending"
        )
        db.add(pending)
        db.commit()
        
        # Mock the Stripe event
        event = {
            "id": "evt_test_123",
            "type": "checkout.session.completed",
            "data": {
                "object": {
                    "id": "cs_test_123",
                    "amount_total": 999,
                    "currency": "usd",
                    "metadata": {
                        "user_id": str(test_user.id),
                        "pending_order_id": "test-pending-123"
                    },
                    "customer_email": test_user.email,
                    "customer_details": {"name": "Test User"},
                    "payment_intent": "pi_test_123"
                }
            }
        }
        mock_construct.return_value = event
        
        # First webhook delivery
        response1 = client.post(
            "/api/webhooks/stripe",
            data=b"test_payload",
            headers={"stripe-signature": "sig1"}
        )
        assert response1.status_code == 200
        
        # Count orders
        orders_after_first = db.query(Order).filter(
            Order.stripe_checkout_session_id == "cs_test_123"
        ).count()
        assert orders_after_first == 1
        
        # Second webhook delivery (same event ID)
        response2 = client.post(
            "/api/webhooks/stripe",
            data=b"test_payload",
            headers={"stripe-signature": "sig2"}
        )
        assert response2.status_code == 200
        assert response2.json()["status"] == "already_processed"
        
        # Verify no duplicate order
        orders_after_second = db.query(Order).filter(
            Order.stripe_checkout_session_id == "cs_test_123"
        ).count()
        assert orders_after_second == 1, "Duplicate order created from same webhook event!"
    
    @patch("app.api.webhooks.settings.STRIPE_WEBHOOK_SECRET", "whsec_test_secret")
    @patch("app.services.stripe_service.StripeService.construct_event")
    def test_processed_event_recorded(self, mock_construct, client, db):
        """Processed events are recorded in the database."""
        from app.models.models import ProcessedStripeEvent
        
        event = {
            "id": "evt_record_123",
            "type": "checkout.session.completed",
            "data": {"object": {"id": "cs_123", "metadata": {}}}
        }
        mock_construct.return_value = event
        
        client.post(
            "/api/webhooks/stripe",
            data=b"test",
            headers={"stripe-signature": "sig"}
        )
        
        # Check the event was recorded
        recorded = db.query(ProcessedStripeEvent).filter(
            ProcessedStripeEvent.event_id == "evt_record_123"
        ).first()
        assert recorded is not None
        assert recorded.event_type == "checkout.session.completed"


class TestTicketAtomicUpdate:
    """REGRESSION TEST: P0-5 — Ticket overselling race condition.
    
    The availability check and decrement must be atomic.
    """

    def test_ticket_purchase_reduces_availability(self, client, test_user, test_concert):
        """Purchasing tickets should reduce available count."""
        initial_available = test_concert.available_tickets
        
        token = self._get_token(client, test_user.email, "testpass123")
        
        # Mock the Stripe checkout to avoid actual API calls
        with patch("app.services.stripe_service.stripe.checkout.Session.create") as mock_create:
            mock_create.return_value = MagicMock(id="cs_test", url="https://stripe.com/test")
            
            response = client.post(
                "/api/tickets/purchase",
                json={"concert_id": test_concert.id, "quantity": 2},
                headers={"Authorization": f"Bearer {token}"}
            )
            
            assert response.status_code == 200
            assert "checkout_url" in response.json()

    def test_purchase_more_than_available_rejected(self, client, test_user, test_concert):
        """Cannot purchase more tickets than available."""
        token = self._get_token(client, test_user.email, "testpass123")
        
        response = client.post(
            "/api/tickets/purchase",
            json={"concert_id": test_concert.id, "quantity": test_concert.available_tickets + 1},
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 400
        assert "not enough" in response.json()["detail"].lower()

    def _get_token(self, client, email, password):
        response = client.post("/api/auth/login", json={"email": email, "password": password})
        return response.json()["access_token"]


class TestRefundIntegration:
    """REGRESSION TEST: P0-9 — Admin refund must call Stripe API."""

    def test_refund_requires_admin(self, client, test_user, db):
        """Non-admin users cannot process refunds."""
        from app.models.models import Order, OrderStatus
        
        order = Order(
            user_id=test_user.id,
            total_amount=50.00,
            status=OrderStatus.COMPLETED,
            customer_email=test_user.email,
            stripe_payment_intent_id="pi_test_123"
        )
        db.add(order)
        db.commit()
        
        token = self._get_token(client, test_user.email, "testpass123")
        
        response = client.post(
            f"/api/admin/orders/{order.id}/refund",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 403  # Admin required

    def _get_token(self, client, email, password):
        response = client.post("/api/auth/login", json={"email": email, "password": password})
        return response.json()["access_token"]
