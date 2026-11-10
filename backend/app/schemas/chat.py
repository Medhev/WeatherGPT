from pydantic import BaseModel
from typing import List, Optional, Any, Dict
from datetime import datetime

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[int] = None
    language: Optional[str] = "en"       # en, ta, hi
    current_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class GroundedDataRecord(BaseModel):
    tool: str
    location: Optional[str] = None
    temperature: Optional[float] = None
    weather_condition: Optional[str] = None
    rain_probability: Optional[int] = None
    precipitation: Optional[float] = None
    date_context: Optional[str] = None
    advisory: Optional[str] = None
    raw_snippet: Optional[Dict[str, Any]] = None

class ChatMessageResponse(BaseModel):
    session_id: int
    reply: str
    intent: str
    detected_location: Optional[str] = None
    grounded_data: Optional[GroundedDataRecord] = None
    tool_executed: Optional[str] = None
    uncertainty_note: Optional[str] = None
    language: str = "en"
    audio_transcription: Optional[str] = None
    suggested_followups: List[str] = []
    provider: str = "deterministic"
    is_fallback: bool = False
    model_name: Optional[str] = None
    warning: Optional[str] = None

class MessageHistoryItem(BaseModel):
    id: int
    sender: str
    content: str
    intent: Optional[str] = None
    location: Optional[str] = None
    tool_called: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[MessageHistoryItem] = []

    class Config:
        from_attributes = True
