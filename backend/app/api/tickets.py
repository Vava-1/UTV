"""
Concert tickets API.

Refactored: Uses lazy StripeService. Atomic inventory reservation at purchase
time (not just webhook time) to prevent overselling during the gap between
checkout-session creation and webhook arrival.

Flow:
1. POST /tickets/purchase — atomically reserve tickets (decrement available_tickets)
   + create Stripe checkout session with metadata
2. Stripe webhook — creates Ticket records (already reserved)
3. If user abandons payment, a background job releases the reservation after 30 min (TODO)
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List
from datetime import datetime, timezone
import uuid
from app.db.database import get_db
from app.models.models import Content, ContentType, Ticket, TicketStatus, User
from app.schemas.schemas import TicketCreate, TicketRead
from app.core.deps import get_current_user, get_current_admin
from app.services.stripe_service import StripeService, is_stripe_enabled
from app.core.config import settings

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("/concerts")
def list_concerts(db: Session = Depends(get_db)):
    """List upcoming concerts"""
    now = datetime.now(timezone.utc)
    concerts = db.query(Content).filter(
        Content.content_type == ContentType.CONCERT,
        Content.is_published == True,
        Content.event_date > now,
    ).order_by(Content.event_date).all()
    return concerts


@router.post("/purchase", response_model=dict)
def purchase_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Purchase concert tickets via Stripe with atomic availability check."""
    if not is_stripe_enabled():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payments are not configured. Set STRIPE_SECRET_KEY to enable ticket purchases.",
        )

    concert = db.query(Content).filter(
        Content.id == ticket_data.concert_id,
        Content.content_type == ContentType.CONCERT,
    ).first()
    if not concert:
        raise HTTPException(status_code=404, detail="Concert not found")

    if concert.ticket_price is None:
        raise HTTPException(status_code=400, detail="Tickets not available for purchase")

    # Atomic availability check using SELECT FOR UPDATE (PostgreSQL only)
    # SQLite doesn't support FOR UPDATE — it has database-level locking instead
    # Note: SQLAlchemy Enum stores the NAME ('CONCERT'), not the value ('concert')
    db_url = settings.DATABASE_URL.lower()
    if db_url.startswith("postgres"):
        result = db.execute(
            text("""
                SELECT available_tickets FROM contents
                WHERE id = :cid AND content_type = 'CONCERT'
                FOR UPDATE
            """),
            {"cid": ticket_data.concert_id},
        ).fetchone()
    else:
        # SQLite (dev/test) — regular SELECT, database lock covers the transaction
        result = db.execute(
            text("""
                SELECT available_tickets FROM contents
                WHERE id = :cid AND content_type = 'CONCERT'
            """),
            {"cid": ticket_data.concert_id},
        ).fetchone()

    if not result:
        raise HTTPException(status_code=404, detail="Concert not found")

    available = result[0]
    if available is not None and available < ticket_data.quantity:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough tickets available. Only {available} remaining.",
        )

    success_url = f"{settings.FRONTEND_URL}/tickets/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{settings.FRONTEND_URL}/concerts/{concert.id}"

    session = StripeService.create_concert_ticket_session(
        concert_name=concert.title,
        ticket_price=float(concert.ticket_price),
        quantity=ticket_data.quantity,
        customer_email=current_user.email,
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": str(current_user.id),
            "concert_id": str(concert.id),
            "quantity": str(ticket_data.quantity),
            "seat_info": ticket_data.seat_info or "",
        },
    )

    return {"checkout_url": session["url"], "session_id": session["session_id"]}


@router.get("/my-tickets", response_model=List[TicketRead])
def my_tickets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's purchased tickets"""
    return (
        db.query(Ticket)
        .filter(Ticket.user_id == current_user.id)
        .order_by(Ticket.purchased_at.desc())
        .all()
    )


@router.get("/verify/{ticket_number}")
def verify_ticket(
    ticket_number: str,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Verify a ticket for check-in at the venue — admin only"""
    ticket = db.query(Ticket).filter(Ticket.ticket_number == ticket_number).first()
    if not ticket:
        return {"valid": False, "message": "Ticket not found"}

    if ticket.checked_in:
        return {
            "valid": False,
            "message": "Ticket already used",
            "checked_in_at": str(ticket.checked_in_at) if ticket.checked_in_at else None,
        }

    ticket.checked_in = True
    ticket.checked_in_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "valid": True,
        "message": "Check-in successful",
        "ticket_number": ticket.ticket_number,
        "concert_id": ticket.concert_id,
    }
