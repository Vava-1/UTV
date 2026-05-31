from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Any
from datetime import datetime
import json
from app.database import get_db
from app.models.models import Content, ContentCategory, ContentType, User
from app.schemas.schemas import (
    ContentCreate, ContentRead, ContentUpdate, ContentListResponse,
    ContentCategoryCreate, ContentCategoryRead
)
from app.core.deps import get_current_user, get_current_admin, get_current_user_optional
from app.services.s3_service import get_s3_service

router = APIRouter(prefix="/contents", tags=["Contents"])


@router.get("/categories", response_model=List[ContentCategoryRead])
def list_categories(db: Session = Depends(get_db)):
    """List all content categories"""
    categories = db.query(ContentCategory).filter(ContentCategory.is_active == True).order_by(ContentCategory.sort_order).all()
    return categories


@router.post("/categories", response_model=ContentCategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(
    category: ContentCategoryCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new category (admin only)"""
    db_category = ContentCategory(**category.dict())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get("", response_model=ContentListResponse)
def list_contents(
    content_type: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    is_featured: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """List contents with filtering and pagination"""
    query = db.query(Content).filter(Content.is_published == True)
    
    if content_type:
        query = query.filter(Content.content_type == content_type)
    if category_id:
        query = query.filter(Content.category_id == category_id)
    if is_featured is not None:
        query = query.filter(Content.is_featured == is_featured)
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Content.title.ilike(search_filter)) |
            (Content.description.ilike(search_filter)) |
            (Content.artist.ilike(search_filter)) |
            (Content.author.ilike(search_filter))
        )
    
    total = query.count()
    items = query.order_by(Content.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    total_pages = (total + page_size - 1) // page_size
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/featured", response_model=List[ContentRead])
def get_featured(db: Session = Depends(get_db)):
    """Get featured contents"""
    return db.query(Content).filter(Content.is_featured == True, Content.is_published == True).limit(10).all()


@router.get("/{content_id}", response_model=ContentRead)
def get_content(content_id: int, db: Session = Depends(get_db)):
    """Get a single content by ID"""
    content = db.query(Content).filter(Content.id == content_id, Content.is_published == True).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    # Increment view count
    content.view_count += 1
    db.commit()
    
    return content


@router.post("", response_model=ContentRead, status_code=status.HTTP_201_CREATED)
def create_content(
    content: ContentCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new content (admin only)"""
    data = content.dict()
    
    # Extract nested fields
    music_fields = data.pop("music_fields", None)
    video_fields = data.pop("video_fields", None)
    book_fields = data.pop("book_fields", None)
    concert_fields = data.pop("concert_fields", None)
    gallery_fields = data.pop("gallery_fields", None)
    
    # Apply type-specific fields
    if music_fields and content.content_type == "music":
        for k, v in music_fields.items():
            if v is not None:
                data[k] = v
    
    if video_fields and content.content_type == "video":
        for k, v in video_fields.items():
            if v is not None:
                data[k] = v
    
    if book_fields and content.content_type in ["book", "score"]:
        for k, v in book_fields.items():
            if v is not None:
                data[k] = v
    
    if concert_fields and content.content_type == "concert":
        for k, v in concert_fields.items():
            if v is not None:
                data[k] = v
    
    if gallery_fields and content.content_type == "gallery":
        for k, v in gallery_fields.items():
            if v is not None:
                data[k] = v
    
    db_content = Content(**data)
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content


@router.put("/{content_id}", response_model=ContentRead)
def update_content(
    content_id: int,
    update: ContentUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update content (admin only)"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    update_data = update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(content, key, value)
    
    db.commit()
    db.refresh(content)
    return content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_content(
    content_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete content (admin only)"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    db.delete(content)
    db.commit()
    return None


@router.post("/{content_id}/upload-cover")
def upload_cover(
    content_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Upload cover image to S3"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(status_code=404, detail="Content not found")
    
    s3 = get_s3_service()
    url = s3.upload_file(file.file, file.filename, f"covers/{content.content_type}", file.content_type)
    
    content.cover_image_url = url
    db.commit()
    
    return {"url": url}
