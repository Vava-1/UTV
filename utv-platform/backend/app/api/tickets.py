from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid
from app.db.database import get_db
from app.models.models import Content, Ticket, TicketStatus, User
from app.schemas.schemas import TicketCreate, TicketRead
from app.core.deps import get_current_user
from app.services.stripe_service import StripeService
from app.core.config import settings

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("/concerts")
def list_concerts(db: Session = Depends(get_db)):
    """List upcoming concerts"""
    concerts = db.query(Content).filter(
        Content.content_type == "concert",
        Content.is_published == True,
        Content.event_date > datetime.utcnow()
    ).order_by(Content.event_date).all()
    return concerts


@router.post("/purchase", response_model=dict)
def purchase_ticket(
    ticket_data: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Purchase concert tickets via Stripe"""
    concert = db.query(Content).filter(
        Content.id == ticket_data.concert_id,
        Content.content_type == "concert"
    ).first()
    
    if not concert:
        raise HTTPException(status_code=404, detail="Concert not found")
    
    if concert.available_tickets is not None and concert.available_tickets < ticket_data.quantity:
        raise HTTPException(status_code=400, detail="Not enough tickets available")
    
    if concert.ticket_price is None:
        raise HTTPException(status_code=400, detail="Tickets not available for purchase")
    
    # Create checkout session
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
            "seat_info": ticket_data.seat_info or ""
        }
    )
    
    return {"checkout_url": session["url"], "session_id": session["session_id"]}


@router.get("/my-tickets", response_model=List[TicketRead])
def my_tickets(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get user's purchased tickets"""
    tickets = db.query(Ticket).filter(Ticket.user_id == current_user.id).order_by(Ticket.purchased_at.desc()).all()
    return tickets
