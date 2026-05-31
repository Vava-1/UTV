"""AI Chat router - conversational assistant with RAG."""

import uuid

from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.ai import ChatRequest, ChatResponse
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat(
    data: ChatRequest,
):
    """Send a message to the AI assistant and get a response."""
    service = get_ai_service()

    # Generate session ID if not provided
    session_id = data.session_id or uuid.uuid4()

    try:
        answer = await service.chat(
            message=data.message,
            session_id=str(session_id),
            language=data.language,
        )
        return ChatResponse(
            response=answer,
            session_id=session_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI service error: {str(e)}",
        )


@router.get("/chat/history/{session_id}")
async def get_chat_history(
    session_id: uuid.UUID,
):
    """Get chat history for a session."""
    service = get_ai_service()
    history = await service.get_history(str(session_id))
    return {"session_id": session_id, "messages": history}


@router.delete("/chat/history/{session_id}")
async def clear_chat_history(
    session_id: uuid.UUID,
):
    """Clear chat history for a session."""
    service = get_ai_service()
    await service.clear_history(str(session_id))
    return {"message": "Chat history cleared"}
