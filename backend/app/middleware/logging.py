"""Request logging middleware."""

import logging
import time
import uuid

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("utv.api")


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware that logs all incoming requests with timing."""

    async def dispatch(self, request: Request, call_next):
        """Process and log each request."""
        request_id = str(uuid.uuid4())[:8]
        request.state.request_id = request_id

        start_time = time.time()
        method = request.method
        path = request.url.path
        query = str(request.query_params)

        logger.info(f"[{request_id}] {method} {path} {query}")

        try:
            response = await call_next(request)
            duration = (time.time() - start_time) * 1000
            status_code = response.status_code

            # Add request ID header to response
            response.headers["X-Request-ID"] = request_id

            logger.info(
                f"[{request_id}] {method} {path} -> {status_code} ({duration:.1f}ms)"
            )
            return response

        except Exception as e:
            duration = (time.time() - start_time) * 1000
            logger.error(f"[{request_id}] {method} {path} -> ERROR: {e} ({duration:.1f}ms)")
            raise
