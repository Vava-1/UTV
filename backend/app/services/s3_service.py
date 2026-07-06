"""
S3-compatible file storage service for UNA TANTUM VOCE.

When AWS credentials are configured: uploads to S3 bucket.
When AWS credentials are NOT set: falls back to local disk storage (uploads/ directory).

This allows the app to work out-of-the-box without any cloud storage,
and seamlessly switch to S3 when credentials are provided.
"""

import os
import uuid
import logging
from pathlib import Path
from typing import Optional, BinaryIO
from app.core.config import settings

logger = logging.getLogger(__name__)

# Local fallback upload directory
LOCAL_UPLOAD_DIR = Path("uploads")
LOCAL_UPLOAD_DIR.mkdir(exist_ok=True)


class S3Service:
    """AWS S3 / S3-Compatible (Cloudflare R2) file upload service"""

    def __init__(self):
        import boto3
        client_kwargs = {
            "aws_access_key_id": settings.AWS_ACCESS_KEY_ID,
            "aws_secret_access_key": settings.AWS_SECRET_ACCESS_KEY,
            "region_name": settings.AWS_REGION,
        }
        if settings.S3_ENDPOINT_URL:
            client_kwargs["endpoint_url"] = settings.S3_ENDPOINT_URL

        self.client = boto3.client("s3", **client_kwargs)
        self.bucket = settings.S3_BUCKET_NAME

    def upload_file(
        self,
        file_obj: BinaryIO,
        filename: str,
        folder: str = "uploads",
        content_type: Optional[str] = None
    ) -> str:
        """Upload file to S3/R2 and return public URL"""
        ext = Path(filename).suffix
        unique_name = f"{folder}/{uuid.uuid4().hex}{ext}"

        extra_args = {}
        if content_type:
            extra_args["ContentType"] = content_type

        self.client.upload_fileobj(file_obj, self.bucket, unique_name, ExtraArgs=extra_args)

        # Return public URL (Custom domain e.g. R2 public bucket URL, or fallback to standard AWS S3)
        if settings.S3_CUSTOM_DOMAIN:
            domain = settings.S3_CUSTOM_DOMAIN.rstrip("/")
            return f"{domain}/{unique_name}"

        region = settings.AWS_REGION
        return f"https://{self.bucket}.s3.{region}.amazonaws.com/{unique_name}"

    def delete_file(self, url: str) -> bool:
        """Delete file by URL"""
        try:
            # Parse key from URL
            if settings.S3_CUSTOM_DOMAIN:
                domain = settings.S3_CUSTOM_DOMAIN.rstrip("/")
                key = url.split(f"{domain}/")[1]
            else:
                key = url.split(f"{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/")[1]

            self.client.delete_object(Bucket=self.bucket, Key=key)
            return True
        except Exception as e:
            logger.error(f"[S3] Delete failed: {e}")
            return False


class LocalStorageService:
    """
    Local disk storage fallback.
    Files are stored in ./uploads/ and served via /uploads/ static route.
    """

    def upload_file(
        self,
        file_obj: BinaryIO,
        filename: str,
        folder: str = "uploads",
        content_type: Optional[str] = None
    ) -> str:
        """Save file to local disk and return URL path"""
        folder_path = LOCAL_UPLOAD_DIR / folder
        folder_path.mkdir(parents=True, exist_ok=True)

        ext = Path(filename).suffix
        unique_name = f"{uuid.uuid4().hex}{ext}"
        file_path = folder_path / unique_name

        with open(file_path, "wb") as f:
            content = file_obj.read()
            f.write(content)

        logger.info(f"[LocalStorage] Saved: {file_path}")

        # Return URL path (served by FastAPI StaticFiles at /uploads/)
        # NOTE: In production, this should be served from the backend domain, not frontend
        backend_url = settings.FRONTEND_URL.rstrip('/')
        return f"{backend_url}/uploads/{folder}/{unique_name}"

    def delete_file(self, url: str) -> bool:
        """Delete local file by URL"""
        try:
            # Extract relative path from URL
            path_part = url.split("/uploads/")[1]
            file_path = LOCAL_UPLOAD_DIR / path_part
            if file_path.exists():
                file_path.unlink()
                return True
        except Exception as e:
            logger.error(f"[LocalStorage] Delete failed: {e}")
        return False


def get_s3_service():
    """
    Returns the appropriate storage service:
    - S3Service if AWS credentials are configured
    - LocalStorageService as fallback (DEVELOPMENT ONLY — blocked in production)
    """
    if (
        settings.AWS_ACCESS_KEY_ID
        and settings.AWS_SECRET_ACCESS_KEY
        and settings.S3_BUCKET_NAME
    ):
        try:
            return S3Service()
        except Exception as e:
            logger.warning(f"[Storage] S3 init failed: {e}")
            if settings.APP_ENV == "production":
                raise RuntimeError(
                    "CRITICAL: S3/R2 object storage must be configured in production. "
                    "Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME. "
                    "Local disk storage is not permitted in production — files are ephemeral."
                )

    if settings.APP_ENV == "production":
        raise RuntimeError(
            "CRITICAL: Object storage (S3 or Cloudflare R2) must be configured in production. "
            "Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME environment variables. "
            "Local disk storage is ephemeral on most PaaS platforms and will result in data loss."
        )

    logger.info("[Storage] Using local disk storage (set AWS_* env vars to enable S3)")
    return LocalStorageService()
