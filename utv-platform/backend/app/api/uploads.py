from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
import os
import requests
from app.db.database import get_db
from app.models.models import User, Order, OrderItem, Content
from app.core.deps import get_current_user
from app.services.s3_service import get_s3_service
from app.services.pdf_service import add_watermark_to_pdf

router = APIRouter(prefix="/uploads", tags=["Uploads & Downloads"])


@router.post("/file")
def upload_file(
    file: UploadFile = File(...),
    folder: str = "uploads",
    current_user: User = Depends(get_current_user)
):
    """Upload a file to S3"""
    s3 = get_s3_service()
    url = s3.upload_file(file.file, file.filename, folder, file.content_type)
    return {"url": url, "filename": file.filename}


@router.get("/download/{content_id}")
def download_content(
    content_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Download a purchased content with PDF watermarking for books/scores"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Check if user has purchased this content
    has_purchased = db.query(OrderItem).join(Order).filter(
        Order.user_id == current_user.id,
        OrderItem.content_id == content_id,
        Order.status == "completed"
    ).first()
    
    # Allow free downloads or if purchased
    is_free = content.price is None or content.price == 0
    if not has_purchased and not is_free and not content.is_downloadable:
        raise HTTPException(status_code=403, detail="You must purchase this content first")
    
    # Handle PDF watermarking for books/scores
    if content.content_type in ["book", "score"] and content.pdf_url:
        try:
            # Download original PDF
            response = requests.get(content.pdf_url, timeout=30)
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Could not fetch file")
            
            # Add watermark
            watermarked_pdf = add_watermark_to_pdf(
                response.content,
                current_user.email,
                logo_path=None  # Add logo path if available
            )
            
            # Stream response
            filename = f"UTV_{content.title.replace(' ', '_')}_watermarked.pdf"
            return StreamingResponse(
                io.BytesIO(watermarked_pdf),
                media_type="application/pdf",
                headers={"Content-Disposition": f"attachment; filename={filename}"}
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")
    
    # For audio/video, return the URL
    if content.content_type == "music" and content.audio_url:
        return {"download_url": content.audio_url}
    
    if content.content_type == "video" and content.video_url:
        return {"download_url": content.video_url}
    
    raise HTTPException(status_code=400, detail="Content type not supported for download")
