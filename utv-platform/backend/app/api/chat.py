from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from app.db.database import get_db
from app.models.models import ChatHistory, User
from app.schemas.schemas import ChatRequest, ChatResponse, ChatMessage
from app.core.deps import get_current_user_optional
from app.services.ai_service import get_utv_assistant

router = APIRouter(prefix="/chat", tags=["UTV Assistant"])


@router.post("/ask", response_model=ChatResponse)
def ask_assistant(
    request: ChatRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db)
):
    """Ask the UTV Assistant a question"""
    # Generate session ID if not provided
    session_id = request.session_id or str(uuid.uuid4())
    
    # Save user message
    user_message = ChatHistory(
        user_id=current_user.id if current_user else None,
        session_id=session_id,
        role="user",
        message=request.message
    )
    db.add(user_message)
    db.commit()
    
    # Get response from AI
    assistant = get_utv_assistant()
    result = assistant.ask(request.message)
    
    # Save assistant response
    assistant_message = ChatHistory(
        user_id=current_user.id if current_user else None,
        session_id=session_id,
        role="assistant",
        message=result["answer"],
        context_sources=result.get("sources")
    )
    db.add(assistant_message)
    db.commit()
    
    return ChatResponse(
        response=result["answer"],
        session_id=session_id,
        sources=result.get("sources", [])
    )


@router.get("/history/{session_id}")
def get_chat_history(session_id: str, db: Session = Depends(get_db)):
    """Get chat history for a session"""
    messages = db.query(ChatHistory).filter(
        ChatHistory.session_id == session_id
    ).order_by(ChatHistory.created_at).all()
    
    return [
        {
            "role": msg.role,
            "message": msg.message,
            "created_at": msg.created_at,
            "sources": msg.context_sources
        }
        for msg in messages
    ]
