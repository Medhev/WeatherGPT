import json
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.services.ai.intent_analyzer import intent_analyzer
from app.services.ai.tool_executor import tool_executor
from app.services.ai.response_generator import response_generator
from app.services.ai.llm_provider import get_llm_provider
from app.schemas.chat import ChatMessageRequest, ChatMessageResponse, GroundedDataRecord
from app.models.chat import ChatSession, ChatMessage
from app.models.user import User

FOLLOWUP_PROMPTS_MAP: Dict[str, List[str]] = {
    "CURRENT_WEATHER": [
        "Will it rain here tomorrow?",
        "Should I carry an umbrella today?",
        "Give me a simple weather advisory for farmers."
    ],
    "FORECAST": [
        "Explain the upcoming temperature changes.",
        "Is it safe to travel during these forecast conditions?",
        "Compare Chennai and Bengaluru weather."
    ],
    "UMBRELLA_DECISION": [
        "What is the hourly rainfall probability?",
        "Is it safe to travel on the highway today?",
        "What do the current weather warnings mean?"
    ],
    "COMPARE_CITIES": [
        "Which city has higher humidity?",
        "Will it rain in Chennai tomorrow?",
        "Give me a simple weather advisory for farmers."
    ],
    "FARMER_ADVISORY": [
        "What is the 7-day rainfall forecast?",
        "When is the best window for spraying pesticides?",
        "Are there any active weather alerts?"
    ],
    "ALERTS_WARNINGS": [
        "What precautionary actions should I take?",
        "Is it safe to drive on regional roads?",
        "What is the 24-hour rainfall forecast?"
    ],
    "TRAVEL_SAFETY": [
        "Will there be fog or high winds?",
        "Should I carry an umbrella today?",
        "Compare Chennai and Bengaluru weather."
    ]
}

class ChatService:
    async def process_chat_message(
        self,
        request: ChatMessageRequest,
        db: Optional[Session] = None,
        user: Optional[User] = None
    ) -> ChatMessageResponse:
        # Load conversation history and inherit prior location if session exists
        conversation_history: List[Dict[str, str]] = []
        inherited_location: Optional[str] = None

        if db and request.session_id:
            past_messages = (
                db.query(ChatMessage)
                .filter(ChatMessage.session_id == request.session_id)
                .order_by(ChatMessage.created_at.asc())
                .all()
            )
            for m in past_messages:
                conversation_history.append({"sender": m.sender, "content": m.content})
                if m.location:
                    inherited_location = m.location

        # 1. Intent Analysis
        analysis = intent_analyzer.analyze(request.message)
        intent = analysis["intent"]
        locations = analysis["locations"]
        time_context = analysis["time_context"]
        
        # Determine primary location
        primary_loc = analysis["primary_location"]
        if not primary_loc and inherited_location:
            primary_loc = inherited_location
        if not primary_loc and request.current_location:
            primary_loc = request.current_location
        if not primary_loc:
            primary_loc = "Chennai"  # Default reference city for MoES/IMD demonstration

        secondary_loc = analysis["secondary_location"]
        if intent == "COMPARE_CITIES" and not secondary_loc:
            secondary_loc = "Bengaluru"

        # 2. Tool Execution
        tool_result = await tool_executor.execute(
            intent=intent,
            primary_location=primary_loc,
            secondary_location=secondary_loc,
            time_context=time_context
        )

        # 3. Grounded Response Generation via LLM Provider (Gemini / Deterministic Fallback)
        llm = get_llm_provider()
        llm_response = await llm.generate_response(
            prompt=request.message,
            system_context="WeatherGPT Conversational Assistant",
            grounded_data={
                "intent": intent,
                "tool": tool_result.get("tool"),
                "success": tool_result.get("success", False),
                "location": tool_result.get("location") or primary_loc,
                "time_context": time_context,
                "tool_data": tool_result
            },
            conversation_history=conversation_history,
            language=request.language or "en"
        )
        final_reply = llm_response.content
        provider_name = llm_response.provider
        is_fallback = llm_response.is_fallback
        model_name = llm_response.model_name
        warning_msg = llm_response.warning

        # Extract uncertainty note from deterministic engine if present
        grounded_dict = response_generator.generate_grounded_response(
            intent=intent,
            tool_data=tool_result,
            language=request.language or "en",
            time_context=time_context
        )
        uncertainty = grounded_dict.get("uncertainty")

        # 4. Extract Grounded Data Record for Frontend UI
        grounded_data_record = None
        if tool_result.get("success"):
            curr = tool_result.get("current", {})
            hourly = tool_result.get("hourly", [])
            p_prob = max([h.get("precipitation_probability", 0) for h in hourly[:6]]) if hourly else None
            grounded_data_record = GroundedDataRecord(
                tool=tool_result.get("tool", intent),
                location=tool_result.get("location") or primary_loc,
                temperature=curr.get("temperature"),
                weather_condition=curr.get("weather_description"),
                rain_probability=p_prob,
                precipitation=curr.get("precipitation"),
                date_context=time_context,
                raw_snippet={"intent": intent, "source": "Open-Meteo & IMD Harmonized"}
            )

        # 5. Database Persistence (if DB session available)
        session_id = request.session_id or 1
        if db:
            chat_sess = None
            if request.session_id:
                chat_sess = db.query(ChatSession).filter(ChatSession.id == request.session_id).first()
            if not chat_sess:
                chat_sess = ChatSession(
                    user_id=user.id if user else None,
                    title=f"Weather in {primary_loc}"
                )
                db.add(chat_sess)
                db.commit()
                db.refresh(chat_sess)
            session_id = chat_sess.id

            # Save user message
            user_msg = ChatMessage(
                session_id=session_id,
                sender="user",
                content=request.message,
                intent=intent,
                location=primary_loc
            )
            db.add(user_msg)

            # Save assistant message
            asst_msg = ChatMessage(
                session_id=session_id,
                sender="assistant",
                content=final_reply,
                intent=intent,
                location=primary_loc,
                tool_called=tool_result.get("tool"),
                tool_data=json.dumps(tool_result.get("tool_data") or {"summary": tool_result.get("summary")})
            )
            db.add(asst_msg)
            db.commit()

        # Follow-ups
        followups = FOLLOWUP_PROMPTS_MAP.get(intent, [
            "What is the weather in Chennai right now?",
            "Will it rain tomorrow?",
            "Give me a simple weather advisory for farmers."
        ])

        return ChatMessageResponse(
            session_id=session_id,
            reply=final_reply,
            intent=intent,
            detected_location=primary_loc,
            grounded_data=grounded_data_record,
            tool_executed=tool_result.get("tool"),
            uncertainty_note=uncertainty,
            language=request.language or "en",
            suggested_followups=followups,
            provider=provider_name,
            is_fallback=is_fallback,
            model_name=model_name,
            warning=warning_msg
        )

chat_service = ChatService()
