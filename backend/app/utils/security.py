"""Security utilities for admin verification."""

from fastapi import HTTPException, status

from app.models.user import User, UserRole


def verify_admin(user: User) -> None:
    """Verify the user has admin or superadmin role.

    Args:
        user: The authenticated user.

    Raises:
        HTTPException: If user is not an admin.
    """
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )
    if user.role not in (UserRole.ADMIN, UserRole.SUPERADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
