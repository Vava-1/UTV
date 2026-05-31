"""Pydantic v2 schemas for AI chat operations."""

import uuid
from typing import Optional, List

from pydantic import BaseModel


class ChatRequest(BaseModel):
    """AI chat request schema."""
    message: str
    session_id: Optional[uuid.UUID] = None
    language: str = "en"


class ChatResponse(BaseModel):
    """AI chat response schema."""
    response: str
    session_id: uuid.UUID


class ChatMessage(BaseModel):
    """Individual chat message for history."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: str


class ChatHistory(BaseModel):
    """Chat history response."""
    session_id: uuid.UUID
    messages: List[ChatMessage]
