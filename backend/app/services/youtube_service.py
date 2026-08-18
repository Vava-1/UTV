"""
YouTube Data API v3 service.

Syncs videos from the UNA TANTUM VOCE OFFICIAL YouTube channel
(www.youtube.com/@UNATANTUMVOCEOFFICIAL) into the Content table as
content_type='video' with platform='youtube'.

Graceful degradation:
- If YOUTUBE_API_KEY is not set, all methods raise RuntimeError.
- The API layer catches this and returns 503 "service unavailable".
- Frontend YouTube embeds still work without the API key — only the
  admin "sync channel" feature requires it.

Rate limits:
- YouTube Data API v3 default quota: 10,000 units/day.
- search.list costs 100 units per call (returns 50 videos max).
- videos.list costs 1 unit per call.
- So a full sync of a 500-video channel costs ~600 units — well within quota.
"""

import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
import logging
from app.core.config import settings
from app.models.models import Content, ContentType
from sqlalchemy.orm import Session
from sqlalchemy import text
import re

logger = logging.getLogger(__name__)

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"

# Channel handle for UNA TANTUM VOCE OFFICIAL
UTV_CHANNEL_HANDLE = "UNATANTUMVOCEOFFICIAL"


def is_youtube_enabled() -> bool:
    """Check if YouTube sync is configured."""
    return bool(settings.YOUTUBE_API_KEY)


def _extract_youtube_id(url: str) -> Optional[str]:
    """Extract YouTube video ID from any YouTube URL format."""
    if not url:
        return None

    # Already an ID (11 chars, alphanumeric + - _)
    if re.match(r'^[a-zA-Z0-9_-]{11}$', url):
        return url

    patterns = [
        r'youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})',
        r'youtu\.be/([a-zA-Z0-9_-]{11})',
        r'youtube\.com/embed/([a-zA-Z0-9_-]{11})',
        r'youtube\.com/shorts/([a-zA-Z0-9_-]{11})',
        r'youtube\.com/live/([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def _resolve_channel_id(api_key: str, channel_handle: str) -> Optional[str]:
    """Resolve a channel handle (@UNATANTUMVOCEOFFICIAL) to a channel ID (UC...).

    Uses the search endpoint as a fallback if YOUTUBE_CHANNEL_ID is not set.
    """
    if settings.YOUTUBE_CHANNEL_ID:
        return settings.YOUTUBE_CHANNEL_ID

    # Strip @ if present
    handle = channel_handle.lstrip("@")

    try:
        # Try channels.list with forHandle (newer API)
        resp = requests.get(
            f"{YOUTUBE_API_BASE}/channels",
            params={
                "key": api_key,
                "part": "id,snippet",
                "forHandle": handle,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("items"):
            channel_id = data["items"][0]["id"]
            logger.info(f"[YouTube] Resolved handle @{handle} → channel {channel_id}")
            return channel_id

        # Fallback: search.list for the channel
        logger.info(f"[YouTube] forHandle failed, trying search.list")
        resp = requests.get(
            f"{YOUTUBE_API_BASE}/search",
            params={
                "key": api_key,
                "part": "snippet",
                "q": handle,
                "type": "channel",
                "maxResults": 1,
            },
            timeout=30,
        )
        resp.raise_for_status()
        data = resp.json()
        if data.get("items"):
            channel_id = data["items"][0]["id"]["channelId"]
            logger.info(f"[YouTube] Search resolved @{handle} → channel {channel_id}")
            return channel_id

    except requests.RequestException as e:
        logger.error(f"[YouTube] Failed to resolve channel handle: {e}")

    return None


def list_channel_videos(api_key: str, channel_id: str, max_results: int = 50) -> List[Dict[str, Any]]:
    """List recent videos from a channel. Returns list of video metadata dicts.

    Each dict has: video_id, title, description, published_at, thumbnail_url,
    duration_seconds (ISO 8601 → seconds).
    """
    # Step 1: search.list to get video IDs
    try:
        search_resp = requests.get(
            f"{YOUTUBE_API_BASE}/search",
            params={
                "key": api_key,
                "part": "id,snippet",
                "channelId": channel_id,
                "type": "video",
                "order": "date",
                "maxResults": min(max_results, 50),
            },
            timeout=30,
        )
        search_resp.raise_for_status()
        search_data = search_resp.json()
    except requests.RequestException as e:
        logger.error(f"[YouTube] search.list failed: {e}")
        raise RuntimeError(f"YouTube search failed: {e}")

    video_ids = [item["id"]["videoId"] for item in search_data.get("items", []) if "videoId" in item.get("id", {})]
    if not video_ids:
        return []

    # Step 2: videos.list to get durations + better metadata
    try:
        videos_resp = requests.get(
            f"{YOUTUBE_API_BASE}/videos",
            params={
                "key": api_key,
                "part": "snippet,contentDetails",
                "id": ",".join(video_ids),
            },
            timeout=30,
        )
        videos_resp.raise_for_status()
        videos_data = videos_resp.json()
    except requests.RequestException as e:
        logger.error(f"[YouTube] videos.list failed: {e}")
        # Return partial data without durations
        return [
            {
                "video_id": item["id"]["videoId"],
                "title": item["snippet"]["title"],
                "description": item["snippet"].get("description", ""),
                "published_at": item["snippet"].get("publishedAt"),
                "thumbnail_url": _best_thumbnail(item["snippet"].get("thumbnails", {})),
                "duration_seconds": None,
            }
            for item in search_data.get("items", [])
            if "videoId" in item.get("id", {})
        ]

    result = []
    for item in videos_data.get("items", []):
        snippet = item.get("snippet", {})
        content_details = item.get("contentDetails", {})
        result.append({
            "video_id": item["id"],
            "title": snippet.get("title", ""),
            "description": snippet.get("description", ""),
            "published_at": snippet.get("publishedAt"),
            "thumbnail_url": _best_thumbnail(snippet.get("thumbnails", {})),
            "duration_seconds": _parse_iso8601_duration(content_details.get("duration", "")),
        })

    return result


def _best_thumbnail(thumbnails: dict) -> Optional[str]:
    """Pick the best available thumbnail URL."""
    for quality in ["maxres", "standard", "high", "medium", "default"]:
        if quality in thumbnails:
            return thumbnails[quality].get("url")
    return None


def _parse_iso8601_duration(duration: str) -> Optional[int]:
    """Parse ISO 8601 duration (PT1H2M3S) to seconds."""
    if not duration:
        return None
    pattern = r"^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$"
    match = re.match(pattern, duration)
    if not match:
        return None
    hours = int(match.group(1) or 0)
    minutes = int(match.group(2) or 0)
    seconds = int(match.group(3) or 0)
    return hours * 3600 + minutes * 60 + seconds


def sync_channel_videos(db: Session, max_results: int = 50) -> Dict[str, int]:
    """Sync videos from the UTV YouTube channel into the Content table.

    Returns dict with counts: {"synced": N, "created": N, "errors": N}.
    Idempotent: existing videos (by youtube_id) are updated, not duplicated.
    """
    if not is_youtube_enabled():
        raise RuntimeError("YouTube sync is not configured. Set YOUTUBE_API_KEY.")

    api_key = settings.YOUTUBE_API_KEY
    channel_id = _resolve_channel_id(api_key, UTV_CHANNEL_HANDLE)
    if not channel_id:
        raise RuntimeError(
            f"Could not resolve channel ID for @{UTV_CHANNEL_HANDLE}. "
            f"Set YOUTUBE_CHANNEL_ID manually in env vars."
        )

    videos = list_channel_videos(api_key, channel_id, max_results)

    synced = 0
    created = 0
    errors = 0

    for video in videos:
        try:
            existing = db.query(Content).filter(
                Content.youtube_id == video["video_id"]
            ).first()

            if existing:
                # Update metadata
                existing.title = video["title"]
                existing.description = video["description"]
                existing.thumbnail_url = video["thumbnail_url"]
                existing.duration_seconds = video["duration_seconds"]
                existing.video_url = f"https://www.youtube.com/watch?v={video['video_id']}"
                existing.platform = "youtube"
                synced += 1
            else:
                # Create new video content
                slug = f"yt-{video['video_id']}"
                # Ensure slug uniqueness
                if db.query(Content).filter(Content.slug == slug).first():
                    slug = f"yt-{video['video_id']}-{video['video_id'][-4:]}"

                content = Content(
                    title=video["title"],
                    slug=slug,
                    description=video["description"],
                    content_type=ContentType.VIDEO,
                    video_url=f"https://www.youtube.com/watch?v={video['video_id']}",
                    platform="youtube",
                    youtube_id=video["video_id"],
                    thumbnail_url=video["thumbnail_url"],
                    duration_seconds=video["duration_seconds"],
                    cover_image_url=video["thumbnail_url"],
                    is_published=True,
                    is_featured=False,
                )
                db.add(content)
                created += 1

            synced += 1
        except Exception as e:
            logger.error(f"[YouTube] Failed to sync video {video.get('video_id')}: {e}")
            errors += 1

    db.commit()
    logger.info(f"[YouTube] Sync complete: created={created}, updated={synced - created}, errors={errors}")
    return {"synced": synced, "created": created, "errors": errors}
