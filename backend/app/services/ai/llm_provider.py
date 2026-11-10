import logging
import httpx
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from pydantic import BaseModel
from app.config import settings
from app.services.ai.response_generator import response_generator

logger = logging.getLogger("weathergpt.ai")

class LLMResponse(BaseModel):
    content: str
    provider: str
    model_name: Optional[str] = None
    is_fallback: bool = False
    warning: Optional[str] = None


class LLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self,
        prompt: str,
        system_context: str,
        grounded_data: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en"
    ) -> LLMResponse:
        pass


class DeterministicFallbackProvider(LLMProvider):
    async def generate_response(
        self,
        prompt: str,
        system_context: str,
        grounded_data: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en"
    ) -> LLMResponse:
        intent = grounded_data.get("intent", "CURRENT_WEATHER")
        tool_data = grounded_data.get("tool_data", {})
        time_context = grounded_data.get("time_context", "today")
        res = response_generator.generate_grounded_response(
            intent=intent,
            tool_data=tool_data,
            language=language,
            time_context=time_context
        )
        return LLMResponse(
            content=res["reply"],
            provider="deterministic",
            model_name="Deterministic Meteorological Engine",
            is_fallback=True,
            warning=None
        )


class GeminiProvider(LLMProvider):
    def __init__(self, api_key: str, model: Optional[str] = None):
        self.api_key = api_key.strip()
        self.model = model or getattr(settings, "GEMINI_MODEL", "gemini-1.5-flash")
        self.endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        self.fallback = DeterministicFallbackProvider()

    async def generate_response(
        self,
        prompt: str,
        system_context: str,
        grounded_data: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None,
        language: str = "en"
    ) -> LLMResponse:
        lang_name = "Tamil (தமிழ்)" if language == "ta" else ("Hindi (हिन्दी)" if language == "hi" else "English")
        
        # Build contents array with conversation history
        contents: List[Dict[str, Any]] = []

        # Add recent conversation history if provided (ensuring alternating user/model roles)
        if conversation_history:
            last_role = None
            for item in conversation_history[-6:]:
                role = "user" if item.get("sender") == "user" else "model"
                text = item.get("content", "").strip()
                if not text:
                    continue
                if role == last_role:
                    # Append text to previous turn if consecutive same role
                    if contents:
                        contents[-1]["parts"][0]["text"] += f"\n{text}"
                else:
                    contents.append({"role": role, "parts": [{"text": text}]})
                    last_role = role

        # Prepare user query with grounded telemetry context
        user_prompt_parts = []
        user_prompt_parts.append(f"User Query: {prompt}")
        user_prompt_parts.append(f"Language to Respond: {lang_name} ({language})")

        has_grounded = grounded_data and grounded_data.get("tool") not in (None, "none") and grounded_data.get("success")
        if has_grounded:
            user_prompt_parts.append(
                f"\n--- Grounded Real-Time Meteorological Telemetry ---\n"
                f"{grounded_data}\n"
                f"--- Instructions ---\n"
                f"1. Base all weather, temperature, humidity, wind, rainfall, and forecast statements strictly on the telemetry above.\n"
                f"2. Never invent temperature figures or fake emergency warnings.\n"
                f"3. Explain uncertainty if precipitation probabilities or NWP models indicate variability.\n"
                f"4. Provide a helpful, fluent, conversational tone and actionable advice for citizens or farmers."
            )
        else:
            user_prompt_parts.append(
                f"\n--- Instructions ---\n"
                f"1. Respond helpfully to this general inquiry as WeatherGPT (MoES / IMD assistant).\n"
                f"2. If the user asks about atmospheric science, meteorology, or disaster preparedness, explain accurately.\n"
                f"3. If they ask about local weather without providing a location, politely ask which city or district they would like to check."
            )

        current_turn_text = "\n".join(user_prompt_parts)

        # Ensure valid role alternation for the final turn
        if contents and contents[-1]["role"] == "user":
            contents[-1]["parts"][0]["text"] += f"\n\n{current_turn_text}"
        else:
            contents.append({"role": "user", "parts": [{"text": current_turn_text}]})

        payload = {
            "system_instruction": {
                "parts": [
                    {
                        "text": (
                            "You are WeatherGPT, an advanced AI Weather, Climate & Disaster Intelligence Assistant "
                            "developed for the Ministry of Earth Sciences (MoES) and India Meteorological Department (IMD). "
                            "You communicate politely, scientifically, and clearly. You are fluent in English, Tamil, and Hindi. "
                            "Always respect meteorological data grounding."
                        )
                    }
                ]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.35,
                "maxOutputTokens": 1000
            }
        }

        try:
           timeout = httpx.Timeout(60.0, connect=10.0)
           async with httpx.AsyncClient(timeout=timeout) as client:
                resp = await client.post(self.endpoint, json=payload)

                if resp.status_code == 200:
                    data = resp.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts:
                            text = parts[0].get("text", "").strip()
                            if text:
                                return LLMResponse(
                                    content=text,
                                    provider="gemini",
                                    model_name=self.model,
                                    is_fallback=False
                                )
                    logger.warning("Gemini returned empty candidates, using deterministic fallback.")

                elif resp.status_code == 429:
                    logger.warning("Gemini API quota/rate limit (429) encountered. Falling back to deterministic engine.")
                    fallback_res = await self.fallback.generate_response(prompt, system_context, grounded_data, conversation_history, language)
                    fallback_res.warning = "Gemini API rate limit reached. Response generated using WeatherGPT deterministic meteorological engine."
                    return fallback_res

                elif resp.status_code in (400, 401, 403):
                    logger.warning(f"Gemini API authentication/bad request error ({resp.status_code}). Using deterministic fallback.")
                    fallback_res = await self.fallback.generate_response(prompt, system_context, grounded_data, conversation_history, language)
                    fallback_res.warning = f"Gemini API key verification issue (HTTP {resp.status_code}). Response generated using WeatherGPT deterministic meteorological engine."
                    return fallback_res

                else:
                    logger.warning(
                        "Gemini API returned HTTP %s. Details: %s",
                        resp.status_code,
                        resp.text[:1000]
                        )
                    fallback_res = await self.fallback.generate_response(
                        prompt,
                        system_context,
                        grounded_data,
                        conversation_history,
                        language
                        )
                    fallback_res.warning = (
                        f"Gemini API returned HTTP {resp.status_code}. "
                        "Check the backend terminal for the error details."
                        )
                    return fallback_res

        except (httpx.TimeoutException, httpx.RequestError) as e:
            logger.warning(f"Network error communicating with Gemini API: {e}. Using deterministic fallback.")
            fallback_res = await self.fallback.generate_response(prompt, system_context, grounded_data, conversation_history, language)
            fallback_res.warning = "Network timeout communicating with Gemini. Response generated using WeatherGPT deterministic meteorological engine."
            return fallback_res
        except Exception as e:
            logger.error(f"Unexpected error in GeminiProvider: {e}. Using deterministic fallback.")

        # Default fallback
        fallback_res = await self.fallback.generate_response(prompt, system_context, grounded_data, conversation_history, language)
        return fallback_res


def get_llm_provider() -> LLMProvider:
    if settings.GEMINI_API_KEY and len(settings.GEMINI_API_KEY.strip()) > 5:
        return GeminiProvider(settings.GEMINI_API_KEY, settings.GEMINI_MODEL)
    return DeterministicFallbackProvider()
