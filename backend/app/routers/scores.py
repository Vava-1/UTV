"""Scores router - browse, purchase, download sheet music."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.content import Score, ScoreDifficulty
from app.models.user import User
from app.models.order import Order, OrderItem, OrderStatus, OrderItemType
from app.schemas.content import ScoreRead, ScoreCreate, ScoreUpdate
from app.middleware.auth import get_current_user, require_admin
from app.services.s3_service import get_s3_service
from app.utils.pagination import paginate_query

router = APIRouter(prefix="/scores", tags=["Scores"])


@router.get("/", response_model=dict)
async def list_scores(
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=100),
    search: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    instrument: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List musical scores with filtering."""
    query = select(Score).where(Score.is_published == True)

    if search:
        term = f"%{search}%"
        query = query.where(
            (Score.title.ilike(term)) | (Score.composer.ilike(term))
        )
    if difficulty:
        try:
            d = ScoreDifficulty(difficulty)
            query = query.where(Score.difficulty == d)
        except ValueError:
            pass
    if instrument:
        query = query.where(Score.instrument == instrument)

    query = query.order_by(desc(Score.created_at))
    result = await paginate_query(db, query, page, size)
    result["items"] = [ScoreRead.model_validate(s) for s in result["items"]]
    return result


@router.post("/", response_model=ScoreRead, status_code=status.HTTP_201_CREATED)
async def create_score(
    title: str = Form(...),
    composer: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(0.0),
    difficulty: str = Form(...),
    instrument: str = Form("piano"),
    number_of_pages: int = Form(0),
    category_id: Optional[str] = Form(None),
    pdf_file: UploadFile = File(...),
    cover_file: Optional[UploadFile] = File(None),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Upload a new score (admin only)."""
    s3 = get_s3_service()

    if pdf_file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="PDF file required",
        )

    pdf_key = await s3.upload_file(pdf_file, folder="scores/pdfs")
    pdf_url = await s3.get_presigned_url(pdf_key, expiry=86400 * 7)

    cover_url = None
    if cover_file:
        cover_key = await s3.upload_file(cover_file, folder="scores/covers")
        cover_url = await s3.get_presigned_url(cover_key, expiry=86400 * 7)

    score = Score(
        title=title,
        composer=composer,
        description=description,
        pdf_url=pdf_url,
        cover_url=cover_url,
        price=price,
        difficulty=ScoreDifficulty(difficulty),
        instrument=instrument,
        number_of_pages=number_of_pages,
        is_published=True,
        category_id=uuid.UUID(category_id) if category_id else None,
    )
    db.add(score)
    await db.commit()
    await db.refresh(score)
    return ScoreRead.model_validate(score)


@router.get("/{score_id}", response_model=ScoreRead)
async def get_score(
    score_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single score."""
    result = await db.execute(select(Score).where(Score.id == score_id))
    score = result.scalar_one_or_none()
    if not score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found",
        )
    return ScoreRead.model_validate(score)


@router.put("/{score_id}", response_model=ScoreRead)
async def update_score(
    score_id: uuid.UUID,
    data: ScoreUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a score (admin only)."""
    result = await db.execute(select(Score).where(Score.id == score_id))
    score = result.scalar_one_or_none()
    if not score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found",
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(score, field, value)

    await db.commit()
    await db.refresh(score)
    return ScoreRead.model_validate(score)


@router.delete("/{score_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_score(
    score_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a score (admin only)."""
    result = await db.execute(select(Score).where(Score.id == score_id))
    score = result.scalar_one_or_none()
    if not score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found",
        )

    s3 = get_s3_service()
    if score.pdf_url:
        await s3.delete_file(score.pdf_url)
    if score.cover_url:
        await s3.delete_file(score.cover_url)

    await db.delete(score)
    await db.commit()
    return None


@router.get("/{score_id}/download")
async def download_score(
    score_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download a purchased score (watermarked)."""
    result = await db.execute(select(Score).where(Score.id == score_id))
    score = result.scalar_one_or_none()
    if not score or not score.pdf_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score or PDF not found",
        )

    # Verify purchase
    order_result = await db.execute(
        select(OrderItem)
        .join(Order)
        .where(
            Order.user_id == user.id,
            Order.status == OrderStatus.FULFILLED,
            OrderItem.item_type == OrderItemType.SCORE,
            OrderItem.item_id == score_id,
        )
    )
    order_item = order_result.scalar_one_or_none()

    if not order_item and score.price > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Purchase required to download",
        )

    if order_item and order_item.watermarked_url:
        order_item.download_count += 1
        await db.commit()
        return {"download_url": order_item.watermarked_url}

    s3 = get_s3_service()
    url = await s3.get_presigned_url(score.pdf_url, expiry=86400)
    return {"download_url": url}
