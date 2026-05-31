"""Tickets router - view and verify event tickets."""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models.event import Ticket, TicketStatus, Event
from app.models.user import User
from app.schemas.event import TicketRead, TicketVerify
from app.middleware.auth import get_current_user, require_admin

router = APIRouter(prefix="/tickets", tags=["Tickets"])


@router.get("/", response_model=list)
async def list_my_tickets(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's tickets with event info."""
    result = await db.execute(
        select(Ticket, Event)
        .join(Event, Ticket.event_id == Event.id)
        .where(Ticket.user_id == user.id)
        .order_by(Ticket.created_at.desc())
    )
    tickets = []
    for ticket, event in result.all():
        data = TicketRead.model_validate(ticket)
        data.event_title = event.title
        tickets.append(data)
    return tickets


@router.get("/{ticket_id}", response_model=TicketRead)
async def get_ticket(
    ticket_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific ticket."""
    result = await db.execute(
        select(Ticket, Event)
        .join(Event, Ticket.event_id == Event.id)
        .where(Ticket.id == ticket_id, Ticket.user_id == user.id)
    )
    row = result.first()
    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ticket not found",
        )

    ticket, event = row
    data = TicketRead.model_validate(ticket)
    data.event_title = event.title
    return data


@router.post("/verify/{ticket_code}", response_model=TicketVerify)
async def verify_ticket(
    ticket_code: str,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Verify and mark a ticket as used (admin only - for door check)."""
    result = await db.execute(
        select(Ticket, Event)
        .join(Event, Ticket.event_id == Event.id)
        .where(Ticket.ticket_code == ticket_code)
    )
    row = result.first()
    if not row:
        return TicketVerify(
            valid=False,
            ticket_code=ticket_code,
            event_title="",
            status="not_found",
            message="Ticket not found",
        )

    ticket, event = row

    if ticket.status == TicketStatus.USED:
        return TicketVerify(
            valid=False,
            ticket_code=ticket_code,
            event_title=event.title,
            status="used",
            message=f"Ticket already used at {ticket.used_at}",
        )

    if ticket.status == TicketStatus.CANCELLED:
        return TicketVerify(
            valid=False,
            ticket_code=ticket_code,
            event_title=event.title,
            status="cancelled",
            message="Ticket has been cancelled",
        )

    # Mark as used
    ticket.status = TicketStatus.USED
    ticket.used_at = datetime.now(timezone.utc)
    await db.commit()

    return TicketVerify(
        valid=True,
        ticket_code=ticket_code,
        event_title=event.title,
        status="used",
        message="Ticket verified successfully",
    )
