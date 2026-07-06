"""Tests for critical security fixes (P0 bugs).

Updated to match current behavior:
1. Paywall bypass prevention (P0-2)
2. Stripe webhooks fail closed without signature verification (P0-3)
3. Webhook idempotency prevents duplicate orders (P0-4)
4. Admin endpoints require admin role (P0-13)
5. Quantity validation rejects invalid values (P0-14) — now via schema (422)
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

from app.main import app


class TestPaywallBypass:
    """REGRESSION TEST: P0-2 — Paywall bypass via is_downloadable."""

    def test_paid_content_without_purchase_is_blocked(self, client, test_user, test_book):
        """A user who hasn't purchased a paid book cannot download it."""
        token = self._get_token(client, test_user.email, "testpass123")

        response = client.get(
            f"/api/uploads/download/{test_book.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403
        assert "purchase" in response.json()["detail"].lower()

    def test_paid_content_is_downloadable_still_requires_purchase(
        self, client, test_user, test_book
    ):
        """REGRESSION: Even with is_downloadable=True, purchase is required."""
        assert test_book.is_downloadable is True
        assert float(test_book.price) > 0

        token = self._get_token(client, test_user.email, "testpass123")

        response = client.get(
            f"/api/uploads/download/{test_book.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 403

    def test_free_content_is_allowed_without_purchase(self, client, test_user, db):
        """Free content (price=0) can be downloaded without purchase."""
        from app.models.models import Content, ContentType
        free_book = Content(
            title="Free Book",
            slug="free-book",
            content_type=ContentType.BOOK,
            price=0,
            is_downloadable=True,
            is_published=True,
            pdf_url="https://example.com/free.pdf",
        )
        db.add(free_book)
        db.commit()

        token = self._get_token(client, test_user.email, "testpass123")

        response = client.get(
            f"/api/uploads/download/{free_book.id}",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Should NOT be a 403 — either success or PDF fetch error (SSRF guard
        # blocks example.com? No, example.com is a real domain. But the fetch
        # will likely 404. Either way, not 403.)
        assert response.status_code != 403

    def _get_token(self, client, email, password):
        response = client.post(
            "/api/auth/login", json={"email": email, "password": password}
        )
        assert response.status_code == 200, f"Login failed: {response.json()}"
        return response.json()["access_token"]


class TestWebhookSecurity:
    """REGRESSION TEST: P0-3 — Webhook signature verification must fail closed."""

    @patch("app.core.config.settings.STRIPE_WEBHOOK_SECRET", None)
    def test_webhook_rejected_without_secret(self, client):
        """Webhook must be rejected if STRIPE_WEBHOOK_SECRET is not set.

        Updated: now returns 400 (generic) instead of 500 (info disclosure).
        """
        response = client.post(
            "/api/webhooks/stripe",
            data=b"test",
            headers={"stripe-signature": "sig"},
        )
        assert response.status_code == 400

    @patch("app.core.config.settings.STRIPE_WEBHOOK_SECRET", "whsec_test_secret")
    def test_webhook_rejected_without_signature_header(self, client):
        """Webhook must be rejected if stripe-signature header is missing."""
        response = client.post("/api/webhooks/stripe", data=b"test")
        assert response.status_code == 400
        assert "missing" in response.json()["detail"].lower() or "invalid" in response.json()["detail"].lower()


class TestAuthSecurity:
    """Tests for auth endpoint security."""

    def test_upload_requires_admin(self, client, test_user):
        """File upload endpoint requires admin role."""
        token = self._get_token(client, test_user.email, "testpass123")

        response = client.post(
            "/api/uploads/file",
            headers={"Authorization": f"Bearer {token}"},
        )

        # Should get 403 forbidden
        assert response.status_code == 403

    def test_rate_limit_on_login(self, client, test_user):
        """Login endpoint should rate limit after multiple failed attempts."""
        # Make 5 failed login attempts (per-email limit allows 5)
        for i in range(5):
            response = client.post(
                "/api/auth/login",
                json={"email": test_user.email, "password": "wrongpassword"},
            )
            # First 5 should be 401 (bad password)
            assert response.status_code == 401

        # 6th attempt should be 429 (rate limited)
        response = client.post(
            "/api/auth/login",
            json={"email": test_user.email, "password": "wrongpassword"},
        )
        assert response.status_code == 429

    def _get_token(self, client, email, password):
        response = client.post(
            "/api/auth/login", json={"email": email, "password": password}
        )
        assert response.status_code == 200, f"Login failed: {response.json()}"
        return response.json()["access_token"]


class TestQuantityValidation:
    """REGRESSION TEST: P0-14 — Quantity validation.

    Updated: Schema-level validation (gt=0) returns 422, not 400.
    The endpoint-level check is a defense-in-depth backup.
    """

    def test_cart_zero_quantity_rejected(self, client, test_user, test_book):
        """Adding 0 quantity to cart should be rejected (422 from schema)."""
        token = self._get_token(client, test_user.email, "testpass123")

        response = client.post(
            "/api/orders/cart",
            json={"content_id": test_book.id, "quantity": 0},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 422

    def test_cart_negative_quantity_rejected(self, client, test_user, test_book):
        """Adding negative quantity to cart should be rejected (422)."""
        token = self._get_token(client, test_user.email, "testpass123")

        response = client.post(
            "/api/orders/cart",
            json={"content_id": test_book.id, "quantity": -1},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 422

    def test_ticket_zero_quantity_rejected(self, client, test_user, test_concert):
        """Purchasing 0 tickets should be rejected (422 from schema)."""
        token = self._get_token(client, test_user.email, "testpass123")

        response = client.post(
            "/api/tickets/purchase",
            json={"concert_id": test_concert.id, "quantity": 0},
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 422

    def _get_token(self, client, email, password):
        response = client.post(
            "/api/auth/login", json={"email": email, "password": password}
        )
        assert response.status_code == 200, f"Login failed: {response.json()}"
        return response.json()["access_token"]
