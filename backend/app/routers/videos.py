"""Videos router - browse and watch video content."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.content import Video
from app.models.user import User
from app.schemas.content import VideoRead, VideoCreate, VideoUpdate
from app.middleware.auth import require_admin
from app.services.s3_service import get_s3_service
from app.utils.pagination import paginate_query

router = APIRouter(prefix="/videos", tags=["Videos"])


@router.get("/", response_model=dict)
async def list_videos(
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_free: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List videos with filtering."""
    query = select(Video).where(Video.is_published == True)

    if is_free is not None:
        query = query.where(Video.is_free == is_free)
    if search:
        term = f"%{search}%"
        query = query.where(Video.title.ilike(term))

    query = query.order_by(desc(Video.created_at))
    result = await paginate_query(db, query, page, size)
    result["items"] = [VideoRead.model_validate(v) for v in result["items"]]
    return result


@router.post("/", response_model=VideoRead, status_code=status.HTTP_201_CREATED)
async def create_video(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    duration_seconds: int = Form(0),
    is_free: bool = Form(True),
    price: float = Form(0.0),
    category_id: Optional[str] = Form(None),
    video_file: UploadFile = File(...),
    thumbnail_file: Optional[UploadFile] = File(None),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new video (admin only)."""
    s3 = get_s3_service()

    allowed_video = {"video/mp4", "video/webm", "video/ogg"}
    if video_file.content_type not in allowed_video:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid video format. Allowed: {allowed_video}",
        )

    video_key = await s3.upload_file(video_file, folder="videos")
    video_url = await s3.get_presigned_url(video_key, expiry=86400 * 7)

    thumbnail_url = None
    if thumbnail_file:
        thumb_key = await s3.upload_file(thumbnail_file, folder="videos/thumbnails")
        thumbnail_url = await s3.get_presigned_url(thumb_key, expiry=86400 * 7)

    video = Video(
        title=title,
        description=description,
        video_url=video_url,
        thumbnail_url=thumbnail_url,
        duration_seconds=duration_seconds,
        is_free=is_free,
        price=price,
        is_published=True,
        category_id=uuid.UUID(category_id) if category_id else None,
    )
    db.add(video)
    await db.commit()
    await db.refresh(video)
    return VideoRead.model_validate(video)


@router.get("/{video_id}", response_model=VideoRead)
async def get_video(
    video_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single video and increment view count."""
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    video.view_count += 1
    await db.commit()

    return VideoRead.model_validate(video)


@router.put("/{video_id}", response_model=VideoRead)
async def update_video(
    video_id: uuid.UUID,
    data: VideoUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a video (admin only)."""
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(video, field, value)

    await db.commit()
    await db.refresh(video)
    return VideoRead.model_validate(video)


@router.delete("/{video_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_video(
    video_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a video (admin only)."""
    result = await db.execute(select(Video).where(Video.id == video_id))
    video = result.scalar_one_or_none()
    if not video:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    s3 = get_s3_service()
    if video.video_url:
        await s3.delete_file(video.video_url)
    if video.thumbnail_url:
        await s3.delete_file(video.thumbnail_url)

    await db.delete(video)
    await db.commit()
    return None
