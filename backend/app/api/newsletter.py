"""
Newsletter API routes for UNA TANTUM VOCE.

Public endpoints:
  POST /api/newsletter/subscribe — Subscribe to newsletter
  POST /api/newsletter/unsubscribe — Unsubscribe by email

Admin endpoints (require JWT admin token):
  GET  /api/newsletter/subscribers — List all subscribers
  DELETE /api/newsletter/subscribers/{id} — Remove subscriber
  POST /api/newsletter/send — Send newsletter to all active subscribers
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.db.database import get_db
from app.models.models import NewsletterSubscriber, User
from app.schemas.schemas import (
    NewsletterSubscriberCreate, NewsletterSubscriberRead, NewsletterSendRequest
)
from app.core.deps import get_current_admin
from app.services.email_service import send_welcome_email, send_newsletter

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])


@router.post("/subscribe", status_code=status.HTTP_201_CREATED)
def subscribe(data: NewsletterSubscriberCreate, db: Session = Depends(get_db)):
    """
    Subscribe to the UTV newsletter.
    Public endpoint — no authentication required.
    """
    # Check if already subscribed
    existing = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == data.email
    ).first()

    if existing:
        if existing.is_active:
            return {"message": "Already subscribed", "email": data.email}
        # Re-activate unsubscribed user
        existing.is_active = True
        existing.unsubscribed_at = None
        db.commit()
        send_welcome_email(data.email, data.name)
        return {"message": "Subscription reactivated", "email": data.email}

    # Create new subscriber
    subscriber = NewsletterSubscriber(
        email=data.email,
        name=data.name,
        language=data.language,
        is_active=True,
        confirmed=True
    )
    db.add(subscriber)
    db.commit()

    # Send welcome email (non-blocking — failures don't affect the response)
    send_welcome_email(data.email, data.name)

    return {"message": "Subscribed successfully! Thank you.", "email": data.email}


@router.post("/unsubscribe")
def unsubscribe(email: str, db: Session = Depends(get_db)):
    """
    Unsubscribe from newsletter by email.
    Public endpoint — no authentication required.
    """
    subscriber = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.email == email
    ).first()

    if not subscriber:
        return {"message": "Email not found in our list"}

    subscriber.is_active = False
    subscriber.unsubscribed_at = datetime.utcnow()
    db.commit()

    return {"message": "Unsubscribed successfully"}


@router.get("/subscribers", response_model=List[NewsletterSubscriberRead])
def list_subscribers(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """List all newsletter subscribers — admin only"""
    return db.query(NewsletterSubscriber).order_by(
        NewsletterSubscriber.subscribed_at.desc()
    ).all()


@router.delete("/subscribers/{subscriber_id}")
def delete_subscriber(
    subscriber_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
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
    _: User = Depends(get_current_admin)
):
    """
    Send a newsletter to all active subscribers — admin only.
    Returns sent/failed counts.
    """
    subscribers = db.query(NewsletterSubscriber).filter(
        NewsletterSubscriber.is_active == True,
        NewsletterSubscriber.confirmed == True
    ).all()

    if not subscribers:
        return {"message": "No active subscribers found", "sent": 0, "failed": 0}

    recipient_emails = [s.email for s in subscribers]

    result = send_newsletter(
        recipients=recipient_emails,
        subject=data.subject,
        body_html=data.body_html,
        body_text=data.body_text
    )

    return {
        "message": f"Newsletter processed",
        "total_subscribers": len(subscribers),
        **result
    }


@router.get("/stats")
def newsletter_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    """Newsletter subscriber statistics — admin only"""
    total = db.query(NewsletterSubscriber).count()
    active = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.is_active == True).count()
    unsubscribed = total - active

    return {
        "total_subscribers": total,
        "active_subscribers": active,
        "unsubscribed": unsubscribed
    }
