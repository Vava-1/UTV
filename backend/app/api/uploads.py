"""
File uploads & content downloads.

Security:
- Admin-only uploads with strict file type + size validation
- SSRF guard on PDF download (only https://, block private IP ranges)
- Paywall enforced: download requires purchase OR free content
- PDF watermarking for books/scores (licensee email in footer + diagonal)
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import os
import ipaddress
import urllib.parse
import requests
from app.db.database import get_db
from app.models.models import User, Order, OrderItem, Content
from app.core.deps import get_current_user, get_current_admin
from app.services.s3_service import get_s3_service
from app.services.pdf_service import add_watermark_to_pdf
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/uploads", tags=["Uploads & Downloads"])

# ─── File Upload Validation ──────────────────────────────────────────────────
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_AUDIO_TYPES = {"audio/mpeg", "audio/wav", "audio/ogg", "audio/mp3", "audio/x-wav", "audio/mpeg3"}
ALLOWED_DOCUMENT_TYPES = {"application/pdf"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo"}
ALLOWED_UPLOAD_TYPES = (
    ALLOWED_IMAGE_TYPES | ALLOWED_AUDIO_TYPES
    | ALLOWED_DOCUMENT_TYPES | ALLOWED_VIDEO_TYPES
)

MAX_FILE_SIZES = {
    "image": 10 * 1024 * 1024,    # 10 MB
    "audio": 50 * 1024 * 1024,    # 50 MB
    "document": 20 * 1024 * 1024, # 20 MB
    "video": 200 * 1024 * 1024,   # 200 MB
}


def _get_max_size(content_type: str) -> int:
    if content_type in ALLOWED_IMAGE_TYPES:
        return MAX_FILE_SIZES["image"]
    if content_type in ALLOWED_AUDIO_TYPES:
        return MAX_FILE_SIZES["audio"]
    if content_type in ALLOWED_DOCUMENT_TYPES:
        return MAX_FILE_SIZES["document"]
    return MAX_FILE_SIZES["video"]


def _validate_upload(file: UploadFile) -> None:
    """Validate file type and size before upload."""
    content_type = (file.content_type or "application/octet-stream").lower()
    if content_type not in ALLOWED_UPLOAD_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"File type '{content_type}' not allowed. Allowed: "
                "images (jpg, png, webp, gif), audio (mp3, wav, ogg), "
                "PDF, video (mp4, webm, mov, avi)."
            ),
        )
    max_size = _get_max_size(content_type)
    file.file.seek(0, os.SEEK_END)
    actual_size = file.file.tell()
    file.file.seek(0)
    if actual_size > max_size:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=(
                f"File too large ({actual_size / 1024 / 1024:.1f}MB). "
                f"Maximum: {max_size / 1024 / 1024:.0f}MB"
            ),
        )


def _is_safe_url(url: str) -> bool:
    """SSRF guard: only https://, block private/loopback/link-local IPs."""
    try:
        parsed = urllib.parse.urlparse(url)
        if parsed.scheme not in ("https",):
            return False
        if not parsed.hostname:
            return False
        # Resolve hostname and check for private/loopback/link-local
        try:
            ip = ipaddress.ip_address(parsed.hostname)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved:
                return False
        except ValueError:
            # It's a domain name, not an IP — allow (DNS resolution happens at fetch time)
            # Block obvious metadata-service hostnames
            blocked_hosts = {"169.254.169.254", "metadata.google.internal"}
            if parsed.hostname.lower() in blocked_hosts:
                return False
        return True
    except Exception:
        return False


@router.post("/file")
def upload_file(
    file: UploadFile = File(...),
    folder: str = "uploads",
    current_user: User = Depends(get_current_admin),
):
    """Upload a file to S3 — ADMIN ONLY with file type/size validation."""
    _validate_upload(file)
    s3 = get_s3_service()
    url = s3.upload_file(file.file, file.filename, folder, file.content_type)
    return {"url": url, "filename": file.filename, "content_type": file.content_type}


@router.get("/download/{content_id}")
def download_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Download purchased content with PDF watermarking for books/scores.

    SECURITY: Purchase check is the ONLY gate for paid content.
    `is_downloadable` only controls delivery method, never payment gate.
    """
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")

    has_purchased = db.query(OrderItem).join(Order).filter(
        Order.user_id == current_user.id,
        OrderItem.content_id == content_id,
        Order.status == "completed",
    ).first()

    is_free = content.price is None or float(content.price) == 0

    if not has_purchased and not is_free:
        raise HTTPException(status_code=403, detail="You must purchase this content first")

    # PDF watermarking for books/scores
    if content.content_type in ["book", "score"] and content.pdf_url:
        if not _is_safe_url(content.pdf_url):
            raise HTTPException(
                status_code=400,
                detail="Content URL is not allowed (SSRF guard).",
            )
        try:
            response = requests.get(content.pdf_url, timeout=30)
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Could not fetch file")

            watermarked_pdf = add_watermark_to_pdf(
                response.content,
                current_user.email,
                logo_path=None,
            )

            filename = f"UTV_{content.title.replace(' ', '_')}_watermarked.pdf"
            return StreamingResponse(
                io.BytesIO(watermarked_pdf),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={filename}"},
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"[Download] PDF watermarking failed: {e}", exc_info=True)
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

    # For audio/video, return the URL
    if content.content_type == "music" and content.audio_url:
        return {"download_url": content.audio_url}

    if content.content_type == "video" and content.video_url:
        return {"download_url": content.video_url}

    raise HTTPException(status_code=400, detail="Content type not supported for download")
