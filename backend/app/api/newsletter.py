"""
Newsletter API routes.

Public endpoints:
  POST /api/newsletter/subscribe — Subscribe (rate limited, sends confirmation email)
  GET  /api/newsletter/confirm/{token} — Confirm subscription (double opt-in)
  POST /api/newsletter/unsubscribe — Unsubscribe by email (rate limited)

Admin endpoints (require JWT admin token):
  GET    /api/newsletter/subscribers — List all subscribers
  DELETE /api/newsletter/subscribers/{id} — Remove subscriber
  POST   /api/newsletter/send — Send newsletter to all active subscribers
  GET    /api/newsletter/stats — Subscriber statistics
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone
from jose import jwt
from app.db.database import get_db
from app.models.models import NewsletterSubscriber, User
from app.schemas.schemas import (
    NewsletterSubscriberCreate, NewsletterSubscriberRead, NewsletterSendRequest
)
from app.core.deps import get_current_admin
from app.core.config import settings
from app.services.email_service import send_welcome_email, send_newsletter
from app.services.rate_limit import check_rate_limit
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])


def _create_confirm_token(email: str) -> str:
    """Create a JWT token for double opt-in confirmation."""
    return jwt.encode(
        {"sub": email, "purpose": "newsletter_confirm"},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


def _verify_confirm_token(token: str) -> str | None:
    """Verify a confirmation token. Returns email or None."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("purpose") != "newsletter_confirm":
            return None
        return payload.get("sub")
    except Exception:
        return None


@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
def subscribe(
    data: NewsletterSubscriberCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    """Subscribe to the UTV newsletter (rate limited, double opt-in)."""
    # Rate limit by IP — 3 subscribes per hour
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"newsletter_subscribe:{client_ip}", max_requests=3, window_seconds=3600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many subscription attempts. Please try again later.",
        )

    existing = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == data.email
    ).first()

    if existing:
        if existing.is_active and existing.confirmed:
            # Don't disclose that the email is subscribed — return same message
            return {"message": "If this email is not yet subscribed, check your inbox for confirmation."}
        # Re-activate / re-confirm
        existing.is_active = True
        existing.unsubscribed_at = None
        existing.confirmed = False
        db.commit()
        # Send confirmation email
        token = _create_confirm_token(data.email)
        try:
            send_welcome_email(data.email, data.name)
        except Exception as e:
            logger.error(f"[Newsletter] Failed to send confirmation: {e}")
        return {"message": "Confirmation email sent. Please check your inbox to confirm."}

    # Create new subscriber (unconfirmed until they click the link)
    subscriber = NewsletterSubscriber(
        email=data.email,
        name=data.name,
        language=data.language,
        is_active=True,
        confirmed=False,  # Double opt-in
    )
    db.add(subscriber)
    db.commit()

    # Send confirmation email (non-blocking)
    try:
        send_welcome_email(data.email, data.name)
    except Exception as e:
        logger.error(f"[Newsletter] Failed to send confirmation: {e}")

    return {"message": "Confirmation email sent. Please check your inbox to confirm your subscription."}


@router.get("/confirm/{token}")
def confirm_subscription(token: str, db: Session = Depends(get_db)):
    """Confirm newsletter subscription via double opt-in token."""
    email = _verify_confirm_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired confirmation link.")

    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == email
    ).first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    subscriber.confirmed = True
    db.commit()

    return {"message": "Subscription confirmed! Thank you for joining UNA TANTUM VOCE."}


@router.post("/unsubscribe")
def unsubscribe(
    request: Request,
    email: str,
    db: Session = Depends(get_db),
):
    """Unsubscribe from newsletter by email (rate limited).

    Note: This endpoint is public (no auth) because unsubscribe links in emails
    must work without login. Rate-limited to prevent enumeration.
    """
    client_ip = request.client.host if request.client else "unknown"
    if not check_rate_limit(f"newsletter_unsubscribe:{client_ip}", max_requests=10, window_seconds=3600):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many requests. Please try again later.",
        )

    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == email
    ).first()

    # Always return the same message — don't disclose whether email exists
    if not subscriber:
        return {"message": "If this email was subscribed, it has been removed."}

    subscriber.is_active = False
    subscriber.unsubscribed_at = datetime.now(timezone.utc)
    db.commit()

    return {"message": "If this email was subscribed, it has been removed."}


@router.get("/subscribers", response_model=List[NewsletterSubscriberRead])
def list_subscribers(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """List all newsletter subscribers — admin only"""
    return db.query(NewsletterSubscriber).order_by(
        NewsletterSubscriber.subscribed_at.desc()
    ).all()


@router.delete("/subscribers/{subscriber_id}")
def delete_subscriber(
    subscriber_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Remove a subscriber — admin only"""
    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.id == subscriber_id
    ).first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    db.delete(subscriber)
    db.commit()
    return {"message": "Subscriber removed"}


@router.post("/send")
def send_newsletter_to_all(
    data: NewsletterSendRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Send a newsletter to all active, confirmed subscribers — admin only."""
    subscribers = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.is_active == True,
        NewsletterSubscriber.confirmed == True,
    ).all()

    if not subscribers:
        return {"message": "No active subscribers found", "sent": 0, "failed": 0}

    recipient_emails = [s.email for s in subscribers]
    result = send_newsletter(
        recipients=recipient_emails,
        subject=data.subject,
        body_html=data.body_html,
        body_text=data.body_text,
    )

    return {
        "message": "Newsletter processed",
        "total_subscribers": len(subscribers),
        **result,
    }


@router.get("/stats")
def newsletter_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Newsletter subscriber statistics — admin only"""
    total = db.query(NewsletterSubscriber).count()
    active = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.is_active == True).count()
    confirmed = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.confirmed == True,
        NewsletterSubscriber.is_active == True,
    ).count()
    unsubscribed = total - active

    return {
        "total_subscribers": total,
        "active_subscribers": active,
        "confirmed_subscribers": confirmed,
        "unsubscribed": unsubscribed,
    }
