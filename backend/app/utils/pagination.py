"""Pagination utilities for API responses."""

import math
from typing import TypeVar, Generic, List, Optional

from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import func, select
from sqlalchemy.orm import DeclarativeMeta

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""
    items: List[T]
    total: int
    page: int
    size: int
    pages: int


async def paginate_query(
    db: AsyncSession,
    query,
    page: int = 1,
    size: int = 20,
) -> dict:
    """Execute a query with pagination.

    Args:
        db: Database session.
        query: SQLAlchemy select query.
        page: Page number (1-indexed).
        size: Items per page.

    Returns:
        Dict with items, total, page, size, pages.
    """
    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    # Get paginated items
    offset = (page - 1) * size
    paginated_query = query.offset(offset).limit(size)
    result = await db.execute(paginated_query)
    items = result.scalars().all()

    pages = math.ceil(total / size) if size > 0 else 1

    return {
        "items": list(items),
        "total": total,
        "page": page,
        "size": size,
        "pages": pages,
    }
