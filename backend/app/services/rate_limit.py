"""
Simple in-memory rate limiter.

For production with multiple workers, replace with Redis-backed slowapi.
This module provides a consistent interface so the swap is trivial.
"""

from collections import defaultdict
import time
import threading
import logging

logger = logging.getLogger(__name__)

_store: dict[str, list[float]] = defaultdict(list)
_lock = threading.Lock()


def check_rate_limit(key: str, max_requests: int = 5, window_seconds: int = 900) -> bool:
    """Check if the key is within rate limit. Returns True if allowed.

    Thread-safe. Cleans up old entries on each call.
    """
    now = time.time()
    with _lock:
        # Clean old entries
        _store[key] = [
            ts for ts in _store[key]
            if now - ts < window_seconds
        ]
        if len(_store[key]) >= max_requests:
            return False
        _store[key].append(now)
        return True


def clear_rate_limits():
    """Clear all rate limit state — useful for tests."""
    with _lock:
        _store.clear()
