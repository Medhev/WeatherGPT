from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services.ai.chat_service import chat_service
from app.services.auth.deps import get_optional_user, get_current_user
from app.models.user import User
from app.models.chat import ChatSession, ChatMessage
from app.schemas.chat import (
    ChatMessageRequest, ChatMessageResponse,
    ChatSessionResponse, MessageHistoryItem
)

router = APIRouter(prefix="/chat", tags=["Conversational AI"])

@router.post("", response_model=ChatMessageResponse)
async def send_chat_message(
    req: ChatMessageRequest,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    return await chat_service.process_chat_message(
        request=req,
        db=db,
        user=user
    )

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_user_chat_sessions(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(ChatSession).filter(ChatSession.user_id == user.id).order_by(ChatSession.updated_at.desc()).all()

@router.get("/history/{session_id}", response_model=List[MessageHistoryItem])
def get_session_history(
    session_id: int,
    user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db)
):
    session = db.query(ChatSession).filter(ChatSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat session not found.")
    
    # If session belongs to a user, ensure ownership
    if session.user_id and (not user or user.id != session.user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to this chat session.")

    return db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.created_at.asc()).all()
