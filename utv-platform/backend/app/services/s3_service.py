import boto3
from botocore.exceptions import ClientError
from typing import Optional, BinaryIO
import uuid
import os
from app.core.config import settings


class S3Service:
    def __init__(self):
        self.s3 = boto3.client(
            "s3",
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_REGION
        )
        self.bucket = settings.S3_BUCKET_NAME
    
    def upload_file(
        self,
        file_obj: BinaryIO,
        filename: str,
        folder: str = "uploads",
        content_type: Optional[str] = None
    ) -> str:
        """Upload a file to S3 and return the URL"""
        if not self.bucket:
            raise ValueError("S3 bucket not configured")
        
        # Generate unique filename
        ext = os.path.splitext(filename)[1]
        unique_name = f"{folder}/{uuid.uuid4().hex}{ext}"
        
        extra_args = {}
        if content_type:
            extra_args["ContentType"] = content_type
        
        self.s3.upload_fileobj(file_obj, self.bucket, unique_name, ExtraArgs=extra_args)
        
        # Generate URL
        url = f"https://{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/{unique_name}"
        return url
    
    def delete_file(self, file_url: str) -> bool:
        """Delete a file from S3"""
        try:
            key = file_url.split(f"{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/")[1]
            self.s3.delete_object(Bucket=self.bucket, Key=key)
            return True
        except (ClientError, IndexError):
            return False
    
    def generate_presigned_url(self, file_url: str, expiration: int = 3600) -> str:
        """Generate a presigned URL for temporary access"""
        try:
            key = file_url.split(f"{self.bucket}.s3.{settings.AWS_REGION}.amazonaws.com/")[1]
            url = self.s3.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expiration
            )
            return url
        except (ClientError, IndexError):
            return file_url


# Singleton
_s3_service: Optional[S3Service] = None


def get_s3_service() -> S3Service:
    global _s3_service
    if _s3_service is None:
        _s3_service = S3Service()
    return _s3_service
