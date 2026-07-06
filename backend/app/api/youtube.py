"""
YouTube API routes — admin-only channel sync + public video listing.

The public video listing uses the existing /api/contents endpoint with
content_type=video. This router adds:
  POST /api/youtube/sync — admin triggers channel sync
  GET  /api/youtube/status — admin checks sync configuration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User, Content, ContentType
from app.core.deps import get_current_admin
from app.services.youtube_service import sync_channel_videos, is_youtube_enabled
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/youtube", tags=["YouTube"])


@router.get("/status")
def youtube_status(
    _: User = Depends(get_current_admin),
):
    """Check YouTube integration configuration — admin only."""
    return {
        "enabled": is_youtube_enabled(),
        "channel_handle": "UNATANTUMVOCEOFFICIAL",
        "channel_url": "https://www.youtube.com/@UNATANTUMVOCEOFFICIAL",
    }


@router.post("/sync")
def sync_videos(
    max_results: int = 50,
    _: User = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    """Sync videos from the UTV YouTube channel — admin only.

    Pulls the latest `max_results` videos (max 50 per YouTube API limits)
    from the @UNATANTUMVOCEOFFICIAL channel and creates/updates Content
    records with content_type='video', platform='youtube'.

    Idempotent: running twice won't duplicate videos.
    """
    try:
        result = sync_channel_videos(db, max_results=max_results)
        return {
            "message": "YouTube sync complete",
            **result,
        }
    except RuntimeError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"[YouTube] Sync failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"YouTube sync failed: {str(e)}",
        )


@router.get("/videos")
def list_youtube_videos(
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db),
):
    """Public endpoint: list YouTube-synced videos (newest first)."""
    query = db.query(Content).filter(
        Content.content_type == ContentType.VIDEO,
        Content.platform == "youtube",
        Content.is_published == True,
    )

    total = query.count()
    items = (
        query.order_by(Content.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
    }
