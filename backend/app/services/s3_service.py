"""S3 file storage service with local filesystem fallback."""

import logging
import os
import uuid
from typing import Optional

import boto3
import httpx
from botocore.exceptions import ClientError

from app.config import settings

logger = logging.getLogger(__name__)


class S3Service:
    """AWS S3 file storage with graceful local filesystem fallback."""

    def __init__(self):
        """Initialize S3 client or local fallback mode."""
        self.local_mode = not (
            settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY
        )
        self.bucket = settings.AWS_S3_BUCKET
        self.region = settings.AWS_REGION
        self.local_dir = "/app/media"

        if not self.local_mode:
            try:
                self.client = boto3.client(
                    "s3",
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=self.region,
                )
                logger.info("S3Service initialized in S3 mode")
            except Exception as e:
                logger.warning(f"Failed to init S3 client: {e}, falling back to local")
                self.local_mode = True

        if self.local_mode:
            os.makedirs(self.local_dir, exist_ok=True)
            logger.info(f"S3Service initialized in local mode ({self.local_dir})")

    def _local_path(self, key: str) -> str:
        """Get local filesystem path for a key."""
        safe_key = key.replace("..", "").lstrip("/")
        full = os.path.join(self.local_dir, safe_key)
        os.makedirs(os.path.dirname(full), exist_ok=True)
        return full

    async def upload_file(self, file_obj, folder: str = "uploads") -> str:
        """Upload a file object to S3 or local storage.

        Args:
            file_obj: File-like object with filename and read methods.
            folder: S3 folder prefix.

        Returns:
            The S3 key or local path of the uploaded file.
        """
        ext = os.path.splitext(getattr(file_obj, "filename", ""))[1] or ".bin"
        key = f"{folder}/{uuid.uuid4()}{ext}"
        content = await file_obj.read()

        if self.local_mode:
            path = self._local_path(key)
            with open(path, "wb") as f:
                f.write(content)
            return key

        content_type = self._guess_content_type(ext)
        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=content,
                ContentType=content_type,
            )
            return key
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            raise

    async def upload_bytes(self, data: bytes, key: str, content_type: str = "application/octet-stream") -> str:
        """Upload raw bytes to S3 or local storage.

        Args:
            data: Raw bytes to upload.
            key: S3 object key.
            content_type: MIME type of the content.

        Returns:
            The S3 key or local path.
        """
        if self.local_mode:
            path = self._local_path(key)
            with open(path, "wb") as f:
                f.write(data)
            return key

        try:
            self.client.put_object(
                Bucket=self.bucket,
                Key=key,
                Body=data,
                ContentType=content_type,
            )
            return key
        except ClientError as e:
            logger.error(f"S3 upload failed: {e}")
            raise

    async def get_presigned_url(self, key: str, expiry: int = 3600) -> str:
        """Generate a presigned URL for accessing an object.

        Args:
            key: S3 object key.
            expiry: URL expiry time in seconds.

        Returns:
            Presigned URL or local file URL.
        """
        if self.local_mode:
            return f"/media/{key}"

        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expiry,
            )
            return url
        except ClientError as e:
            logger.error(f"Failed to generate presigned URL: {e}")
            return ""

    async def delete_file(self, key: str) -> None:
        """Delete a file from S3 or local storage.

        Args:
            key: S3 object key or local path.
        """
        if self.local_mode:
            path = self._local_path(key)
            if os.path.exists(path):
                os.remove(path)
            return

        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
        except ClientError as e:
            logger.error(f"S3 delete failed: {e}")
            raise

    async def download_file(self, key: str) -> bytes:
        """Download a file from S3 or local storage.

        Args:
            key: S3 object key.

        Returns:
            File contents as bytes.
        """
        if self.local_mode:
            path = self._local_path(key)
            with open(path, "rb") as f:
                return f.read()

        try:
            resp = self.client.get_object(Bucket=self.bucket, Key=key)
            return resp["Body"].read()
        except ClientError as e:
            logger.error(f"S3 download failed: {e}")
            raise

    @staticmethod
    def _guess_content_type(ext: str) -> str:
        """Guess MIME type from file extension."""
        mapping = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".pdf": "application/pdf",
            ".mp3": "audio/mpeg",
            ".mp4": "video/mp4",
            ".wav": "audio/wav",
            ".ogg": "audio/ogg",
            ".webm": "video/webm",
        }
        return mapping.get(ext.lower(), "application/octet-stream")


# Singleton instance
_s3_service: Optional[S3Service] = None


def get_s3_service() -> S3Service:
    """Get or create the global S3 service singleton."""
    global _s3_service
    if _s3_service is None:
        _s3_service = S3Service()
    return _s3_service
