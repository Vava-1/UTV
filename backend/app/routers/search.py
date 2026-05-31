"""Search router - unified search across all content types."""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.database import get_db
from app.models.content import Music, Book, Score, Video
from app.models.event import Event

router = APIRouter(prefix="/search", tags=["Search"])


@router.get("/")
async def unified_search(
    q: str = Query(..., min_length=1, max_length=100),
    type: str = Query("all"),  # all, music, books, scores, events, videos
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Search across all content types."""
    results = []
    term = f"%{q}%"

    if type in ("all", "music"):
        music_result = await db.execute(
            select(Music)
            .where(
                Music.is_published == True,
                or_(
                    Music.title.ilike(term),
                    Music.composer.ilike(term),
                ),
            )
            .limit(size)
        )
        for m in music_result.scalars().all():
            results.append({
                "type": "music",
                "id": str(m.id),
                "title": m.title,
                "subtitle": m.composer,
                "image": m.cover_url,
                "url": f"/music/{m.id}",
            })

    if type in ("all", "books"):
        books_result = await db.execute(
            select(Book)
            .where(
                Book.is_published == True,
                or_(
                    Book.title.ilike(term),
                    Book.author.ilike(term),
                ),
            )
            .limit(size)
        )
        for b in books_result.scalars().all():
            results.append({
                "type": "book",
                "id": str(b.id),
                "title": b.title,
                "subtitle": b.author,
                "image": b.cover_url,
                "url": f"/books/{b.id}",
            })

    if type in ("all", "scores"):
        scores_result = await db.execute(
            select(Score)
            .where(
                Score.is_published == True,
                or_(
                    Score.title.ilike(term),
                    Score.composer.ilike(term),
                ),
            )
            .limit(size)
        )
        for s in scores_result.scalars().all():
            results.append({
                "type": "score",
                "id": str(s.id),
                "title": s.title,
                "subtitle": s.composer,
                "image": s.cover_url,
                "url": f"/scores/{s.id}",
            })

    if type in ("all", "events"):
        events_result = await db.execute(
            select(Event)
            .where(
                Event.is_active == True,
                or_(
                    Event.title.ilike(term),
                    Event.city.ilike(term),
                    Event.venue.ilike(term),
                ),
            )
            .limit(size)
        )
        for e in events_result.scalars().all():
            results.append({
                "type": "event",
                "id": str(e.id),
                "title": e.title,
                "subtitle": f"{e.city} - {e.venue}",
                "image": e.cover_url,
                "url": f"/events/{e.id}",
            })

    if type in ("all", "videos"):
        videos_result = await db.execute(
            select(Video)
            .where(
                Video.is_published == True,
                Video.title.ilike(term),
            )
            .limit(size)
        )
        for v in videos_result.scalars().all():
            results.append({
                "type": "video",
                "id": str(v.id),
                "title": v.title,
                "subtitle": "Video",
                "image": v.thumbnail_url,
                "url": f"/videos/{v.id}",
            })

    return {
        "query": q,
        "type": type,
        "total": len(results),
        "results": results,
    }
