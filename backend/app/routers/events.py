"""Events router - browse, create, manage live events and tickets."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func

from app.database import get_db
from app.models.event import Event, Ticket, TicketStatus
from app.models.user import User
from app.schemas.event import EventRead, EventCreate, EventUpdate, TicketRead
from app.middleware.auth import get_current_user, require_admin
from app.utils.pagination import paginate_query

router = APIRouter(prefix="/events", tags=["Events"])


@router.get("/", response_model=dict)
async def list_events(
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=100),
    city: Optional[str] = Query(None),
    from_date: Optional[str] = Query(None),
    to_date: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(True),
    db: AsyncSession = Depends(get_db),
):
    """List events with filtering."""
    query = select(Event)

    if is_active is not None:
        query = query.where(Event.is_active == is_active)
    if city:
        query = query.where(Event.city.ilike(f"%{city}%"))
    if from_date:
        query = query.where(Event.start_datetime >= from_date)
    if to_date:
        query = query.where(Event.start_datetime <= to_date)

    query = query.order_by(Event.start_datetime)
    result = await paginate_query(db, query, page, size)

    # Add tickets_available
    items = []
    for event in result["items"]:
        data = EventRead.model_validate(event)
        data.tickets_available = max(0, event.capacity - event.tickets_sold)
        items.append(data)
    result["items"] = items
    return result


@router.post("/", response_model=EventRead, status_code=status.HTTP_201_CREATED)
async def create_event(
    data: EventCreate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new event (admin only)."""
    event = Event(**data.model_dump())
    db.add(event)
    await db.commit()
    await db.refresh(event)

    result = EventRead.model_validate(event)
    result.tickets_available = event.capacity
    return result


@router.get("/{event_id}", response_model=EventRead)
async def get_event(
    event_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single event with available ticket count."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    result = EventRead.model_validate(event)
    result.tickets_available = max(0, event.capacity - event.tickets_sold)
    return result


@router.put("/{event_id}", response_model=EventRead)
async def update_event(
    event_id: uuid.UUID,
    data: EventUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update an event (admin only)."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(event, field, value)

    await db.commit()
    await db.refresh(event)

    result = EventRead.model_validate(event)
    result.tickets_available = max(0, event.capacity - event.tickets_sold)
    return result


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete an event (admin only)."""
    result = await db.execute(select(Event).where(Event.id == event_id))
    event = result.scalar_one_or_none()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event not found",
        )

    await db.delete(event)
    await db.commit()
    return None
