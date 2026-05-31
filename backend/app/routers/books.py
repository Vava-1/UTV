"""Books router - browse, purchase, download digital books."""

import uuid
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from app.database import get_db
from app.models.content import Book
from app.models.user import User
from app.models.order import Order, OrderItem, OrderStatus, OrderItemType
from app.schemas.content import BookRead, BookCreate, BookUpdate
from app.middleware.auth import get_current_user, require_admin, get_optional_user
from app.services.s3_service import get_s3_service
from app.services.pdf_watermark import watermark_and_upload
from app.utils.pagination import paginate_query

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("/", response_model=dict)
async def list_books(
    page: int = Query(1, ge=1),
    size: int = Query(12, ge=1, le=100),
    search: Optional[str] = Query(None),
    genre: Optional[str] = Query(None),
    language: Optional[str] = Query(None),
    is_featured: Optional[bool] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List books with filtering and pagination."""
    query = select(Book).where(Book.is_published == True)

    if search:
        term = f"%{search}%"
        query = query.where(
            (Book.title.ilike(term)) | (Book.author.ilike(term))
        )
    if genre:
        query = query.where(Book.genre == genre)
    if language:
        query = query.where(Book.language == language)
    if is_featured is not None:
        query = query.where(Book.is_featured == is_featured)

    query = query.order_by(desc(Book.created_at))
    result = await paginate_query(db, query, page, size)
    result["items"] = [BookRead.model_validate(b) for b in result["items"]]
    return result


@router.post("/", response_model=BookRead, status_code=status.HTTP_201_CREATED)
async def create_book(
    title: str = Form(...),
    author: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(0.0),
    language: str = Form("en"),
    pages: int = Form(0),
    genre: str = Form("general"),
    isbn: Optional[str] = Form(None),
    is_digital: bool = Form(True),
    is_physical: bool = Form(False),
    stock_quantity: int = Form(0),
    category_id: Optional[str] = Form(None),
    cover_file: UploadFile = File(...),
    pdf_file: Optional[UploadFile] = File(None),
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new book (admin only)."""
    s3 = get_s3_service()

    # Upload cover
    cover_key = await s3.upload_file(cover_file, folder="books/covers")
    cover_url = await s3.get_presigned_url(cover_key, expiry=86400 * 7)

    # Upload PDF if provided
    pdf_url = None
    if pdf_file:
        if pdf_file.content_type != "application/pdf":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PDF file required",
            )
        pdf_key = await s3.upload_file(pdf_file, folder="books/pdfs")
        pdf_url = await s3.get_presigned_url(pdf_key, expiry=86400 * 7)

    book = Book(
        title=title,
        author=author,
        description=description,
        cover_url=cover_url,
        pdf_url=pdf_url,
        price=price,
        isbn=isbn,
        language=language,
        pages=pages,
        genre=genre,
        is_digital=is_digital,
        is_physical=is_physical,
        stock_quantity=stock_quantity,
        is_published=True,
        category_id=uuid.UUID(category_id) if category_id else None,
    )
    db.add(book)
    await db.commit()
    await db.refresh(book)
    return BookRead.model_validate(book)


@router.get("/{book_id}", response_model=BookRead)
async def get_book(
    book_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a single book."""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )
    return BookRead.model_validate(book)


@router.put("/{book_id}", response_model=BookRead)
async def update_book(
    book_id: uuid.UUID,
    data: BookUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update a book (admin only)."""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    for field, value in data.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(book, field, value)

    await db.commit()
    await db.refresh(book)
    return BookRead.model_validate(book)


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book(
    book_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a book (admin only)."""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found",
        )

    s3 = get_s3_service()
    if book.cover_url:
        await s3.delete_file(book.cover_url)
    if book.pdf_url:
        await s3.delete_file(book.pdf_url)

    await db.delete(book)
    await db.commit()
    return None


@router.get("/{book_id}/download")
async def download_book(
    book_id: uuid.UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Download a purchased book (watermarked)."""
    result = await db.execute(select(Book).where(Book.id == book_id))
    book = result.scalar_one_or_none()
    if not book or not book.pdf_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book or PDF not found",
        )

    # Verify purchase
    order_result = await db.execute(
        select(OrderItem)
        .join(Order)
        .where(
            Order.user_id == user.id,
            Order.status == OrderStatus.FULFILLED,
            OrderItem.item_type == OrderItemType.BOOK,
            OrderItem.item_id == book_id,
        )
    )
    order_item = order_result.scalar_one_or_none()

    if not order_item and book.price > 0:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Purchase required to download",
        )

    # Return watermarked URL if available, otherwise generate
    if order_item and order_item.watermarked_url:
        # Update download count
        order_item.download_count += 1
        await db.commit()
        return {"download_url": order_item.watermarked_url}

    # For free books or admin, return original
    s3 = get_s3_service()
    url = await s3.get_presigned_url(book.pdf_url, expiry=86400)
    return {"download_url": url}


@router.get("/categories/list")
async def list_book_categories(
    db: AsyncSession = Depends(get_db),
):
    """Get unique book genres."""
    from app.models.content import Category
    result = await db.execute(
        select(Category).where(Category.content_type == "book")
    )
    cats = result.scalars().all()
    return [{"id": str(c.id), "name": c.name, "slug": c.slug} for c in cats]
