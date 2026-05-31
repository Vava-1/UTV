"""Music router - browse, stream, upload, manage tracks."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, asc, func

from app.database import get_db
from app.models.content import Music, MusicGenre
from app.models.user import User
from app.schemas.content import MusicRead, MusicCreate, MusicUpdate
from app.middleware.auth import get_current_user, require_admin
from app.middleware.auth import get_optional_user
from app.services.s3_service import get_s3_service
from app.utils.pagination import paginate_query

router = APIRouter(prefix="/music", tags=["Music"])


@router.get("/", response_model=dict)
async def list_music(
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=100),
    genre: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    is_free: Optional[bool] = Query(None),
    sort_by: str = Query("created_at"),
    db: AsyncSession = Depends(get_db),
):
    """List music tracks with filtering, sorting, and pagination."""
    query = select(Music).where(Music.is_published == True)

    if genre:
        try:
            g = MusicGenre(genre)
            query = query.where(Music.genre == g)
        except ValueError:
            pass

    if is_free is not None:
        query = query.where(Music.is_free == is_free)

    if search:
        search_term = f"%{search}%"
        query = query.where(
            (Music.title.ilike(search_term)) |
            (Music.composer.ilike(search_term)) |
            (Music.performer.ilike(search_term))
        )

    # Sorting
    sort_field = getattr(Music, sort_by, Music.created_at)
    query = query.order_by(desc(sort_field))

    result = await paginate_query(db, query, page, size)
    result["items"] = [MusicRead.model_validate(m) for m in result["items"]]
    return result


@router.post("/", response_model=MusicRead, status_code=status.HTTP_201_CREATED)
async def create_music(
    title: str = Form(...),
    composer: str = Form(...),
    performer: Optional[str] = Form(None),
    genre: str = Form(...),
    duration_seconds: int = Form(0),
    description: Optional[str] = Form(None),
    price: float = Form(0.0),
    is_free: bool = Form(False),
    category_id: Optional[str] = Form(None),
    audio_file: UploadFile = File(...),
    cover_file: Optional[UploadFile] = File(None),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new music track (admin only)."""
    s3 = get_s3_service()

    # Validate audio file
    allowed_audio = {"audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3"}
    if audio_file.content_type not in allowed_audio:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid audio format. Allowed: {allowed_audio}",
        )

    # Upload audio
    audio_key = await s3.upload_file(audio_file, folder="music/audio")
    audio_url = await s3.get_presigned_url(audio_key, expiry=3600)

    # Upload cover if provided
    cover_url = None
    if cover_file:
        allowed_images = {"image/jpeg", "image/png", "image/webp"}
        if cover_file.content_type not in allowed_images:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cover must be JPEG, PNG, or WebP",
            )
        cover_key = await s3.upload_file(cover_file, folder="music/covers")
        cover_url = await s3.get_presigned_url(cover_key, expiry=86400 * 7)

    music = Music(
        title=title,
        composer=composer,
        performer=performer,
        genre=MusicGenre(genre),
        duration_seconds=duration_seconds,
        audio_url=audio_url,
        cover_url=cover_url,
        description=description,
        price=price,
        is_free=is_free,
        is_published=True,
        category_id=uuid.UUID(category_id) if category_id else None,
    )
    db.add(music)
    await db.commit()
    await db.refresh(music)
    return MusicRead.model_validate(music)


@router.get("/{music_id}", response_model=MusicRead)
async def get_music(
    music_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single music track and increment play count."""
    result = await db.execute(select(Music).where(Music.id == music_id))
    music = result.scalar_one_or_none()
    if not music:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Music track not found",
        )

    # Increment play count
    music.play_count += 1
    await db.commit()

    return MusicRead.model_validate(music)


@router.put("/{music_id}", response_model=MusicRead)
async def update_music(
    music_id: uuid.UUID,
    data: MusicUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a music track (admin only)."""
    result = await db.execute(select(Music).where(Music.id == music_id))
    music = result.scalar_one_or_none()
    if not music:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Music track not found",
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(music, field, value)

    await db.commit()
    await db.refresh(music)
    return MusicRead.model_validate(music)


@router.delete("/{music_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_music(
    music_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a music track and its files (admin only)."""
    result = await db.execute(select(Music).where(Music.id == music_id))
    music = result.scalar_one_or_none()
    if not music:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Music track not found",
        )

    # Delete from S3
    s3 = get_s3_service()
    if music.audio_url:
        await s3.delete_file(music.audio_url)
    if music.cover_url:
        await s3.delete_file(music.cover_url)

    await db.delete(music)
    await db.commit()
    return None


@router.get("/{music_id}/stream")
async def stream_music(
    music_id: uuid.UUID,
    user: Optional[User] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a presigned streaming URL for a music track."""
    result = await db.execute(select(Music).where(Music.id == music_id))
    music = result.scalar_one_or_none()
    if not music:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Music track not found",
        )

    # Free tracks don't require authentication
    if not music.is_free and not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required for this track",
        )

    # Generate fresh presigned URL (1 hour)
    s3 = get_s3_service()
    # Extract key from existing URL or use directly
    from urllib.parse import urlparse, parse_qs
    stream_url = await s3.get_presigned_url(music.audio_url, expiry=3600)

    return {"stream_url": stream_url}


@router.post("/{music_id}/like")
async def toggle_like(
    music_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Toggle like on a music track."""
    result = await db.execute(select(Music).where(Music.id == music_id))
    music = result.scalar_one_or_none()
    if not music:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Music track not found",
        )

    # Simple like toggle - in production, use a likes table
    music.likes_count += 1
    await db.commit()

    return {"liked": True, "count": music.likes_count}


@router.get("/featured/list")
async def get_featured_music(
    db: AsyncSession = Depends(get_db),
):
    """Get top 6 featured music tracks."""
    result = await db.execute(
        select(Music)
        .where(Music.is_featured == True, Music.is_published == True)
        .order_by(desc(Music.created_at))
        .limit(6)
    )
    tracks = result.scalars().all()
    return [MusicRead.model_validate(t) for t in tracks]
