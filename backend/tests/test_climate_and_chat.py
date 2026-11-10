import pytest
from app.services.ai.intent_analyzer import intent_analyzer
from app.services.ai.response_generator import response_generator

def test_intent_analyzer_current_weather():
    q = "What is the weather in Chennai right now?"
    res = intent_analyzer.analyze(q)
    assert res["intent"] == "CURRENT_WEATHER"
    assert "Chennai" in res["locations"]

def test_intent_analyzer_forecast():
    q = "Will it rain in Chennai tomorrow?"
    res = intent_analyzer.analyze(q)
    assert res["intent"] == "FORECAST"
    assert res["time_context"] == "tomorrow"
    assert "Chennai" in res["locations"]

def test_intent_analyzer_umbrella():
    q = "Should I carry an umbrella today in Mumbai?"
    res = intent_analyzer.analyze(q)
    assert res["intent"] == "UMBRELLA_DECISION"
    assert "Mumbai" in res["locations"]

def test_intent_analyzer_comparison():
    q = "Compare Chennai and Bengaluru weather."
    res = intent_analyzer.analyze(q)
    assert res["intent"] == "COMPARE_CITIES"
    assert "Chennai" in res["locations"]
    assert "Bengaluru" in res["locations"]

def test_intent_analyzer_farmer():
    q = "Give me a simple weather advisory for farmers."
    res = intent_analyzer.analyze(q)
    assert res["intent"] == "FARMER_ADVISORY"

def test_intent_analyzer_travel_and_alerts():
    q_travel = "Is it safe to travel during the forecast conditions in Delhi?"
    assert intent_analyzer.analyze(q_travel)["intent"] == "TRAVEL_SAFETY"

    q_alerts = "What do the current weather warnings mean?"
    assert intent_analyzer.analyze(q_alerts)["intent"] == "ALERTS_WARNINGS"

def test_multilingual_response_generation():
    mock_tool_data = {
        "success": True,
        "location": "Chennai",
        "current": {
            "temperature": 31.0,
            "apparent_temperature": 35.0,
            "weather_description": "Partly Cloudy",
            "relative_humidity": 75,
            "wind_speed": 18.0,
            "rain": 0.0,
            "pressure_msl": 1012.0,
            "wind_direction": 120
        },
        "daily": [],
        "hourly": [{"precipitation_probability": 15}],
        "advisories": []
    }

    # English
    en_res = response_generator.generate_grounded_response("CURRENT_WEATHER", mock_tool_data, language="en")
    assert "Current Weather in Chennai" in en_res["reply"]
    assert "31.0°C" in en_res["reply"]

    # Tamil
    ta_res = response_generator.generate_grounded_response("CURRENT_WEATHER", mock_tool_data, language="ta")
    assert "தற்போதைய வானிலை" in ta_res["reply"]
    assert "31.0°C" in ta_res["reply"]

    # Hindi
    hi_res = response_generator.generate_grounded_response("CURRENT_WEATHER", mock_tool_data, language="hi")
    assert "वर्तमान मौसम" in hi_res["reply"]
    assert "31.0°C" in hi_res["reply"]

def test_chat_endpoint_execution(client):
    payload = {
        "message": "What is the weather in Chennai right now?",
        "language": "en"
    }
    res = client.post("/api/v1/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["intent"] == "CURRENT_WEATHER"
    assert "Chennai" in data["detected_location"]
    assert len(data["reply"]) > 20
    assert len(data["suggested_followups"]) > 0
    assert "provider" in data
    assert "is_fallback" in data

def test_general_chat_intent_analysis():
    q_greet = "Hello WeatherGPT, can you help me?"
    assert intent_analyzer.analyze(q_greet)["intent"] == "GENERAL_CHAT"

    q_science = "Can you explain what El Niño is?"
    assert intent_analyzer.analyze(q_science)["intent"] == "GENERAL_CHAT"

@pytest.mark.asyncio
async def test_gemini_provider_mock_success(monkeypatch):
    import httpx
    from app.services.ai.llm_provider import GeminiProvider

    class MockResponse:
        status_code = 200
        def json(self):
            return {
                "candidates": [
                    {
                        "content": {
                            "parts": [{"text": "Hello! Chennai is currently experiencing 31°C with clear skies and calm winds."}]
                        }
                    }
                ]
            }

    async def mock_post(*args, **kwargs):
        return MockResponse()

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    provider = GeminiProvider(api_key="mock_test_key_12345", model="gemini-1.5-flash")
    resp = await provider.generate_response(
        prompt="What is the weather in Chennai?",
        system_context="Context",
        grounded_data={"tool": "CURRENT_WEATHER", "success": True, "location": "Chennai"}
    )

    assert resp.provider == "gemini"
    assert resp.model_name == "gemini-1.5-flash"
    assert resp.is_fallback is False
    assert "Chennai" in resp.content

@pytest.mark.asyncio
async def test_gemini_provider_rate_limit_fallback(monkeypatch):
    import httpx
    from app.services.ai.llm_provider import GeminiProvider

    class Mock429Response:
        status_code = 429
        def json(self):
            return {"error": {"message": "Resource exhausted"}}

    async def mock_post(*args, **kwargs):
        return Mock429Response()

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    provider = GeminiProvider(api_key="mock_test_key_12345")
    resp = await provider.generate_response(
        prompt="What is the weather in Chennai?",
        system_context="Context",
        grounded_data={
            "intent": "CURRENT_WEATHER",
            "tool_data": {
                "success": True,
                "location": "Chennai",
                "current": {"temperature": 30.0, "weather_description": "Clear", "relative_humidity": 65, "wind_speed": 10.0}
            }
        }
    )

    assert resp.provider == "deterministic"
    assert resp.is_fallback is True
    assert resp.warning is not None
    assert "rate limit" in resp.warning.lower()
    assert "30.0°C" in resp.content

@pytest.mark.asyncio
async def test_gemini_provider_network_timeout_fallback(monkeypatch):
    import httpx
    from app.services.ai.llm_provider import GeminiProvider

    async def mock_post(*args, **kwargs):
        raise httpx.TimeoutException("Connection timed out")

    monkeypatch.setattr(httpx.AsyncClient, "post", mock_post)

    provider = GeminiProvider(api_key="mock_test_key_12345")
    resp = await provider.generate_response(
        prompt="What is the weather in Chennai?",
        system_context="Context",
        grounded_data={
            "intent": "CURRENT_WEATHER",
            "tool_data": {
                "success": True,
                "location": "Chennai",
                "current": {"temperature": 29.5, "weather_description": "Partly Cloudy", "relative_humidity": 70, "wind_speed": 12.0}
            }
        }
    )

    assert resp.provider == "deterministic"
    assert resp.is_fallback is True
    assert resp.warning is not None
    assert "timeout" in resp.warning.lower()

def test_missing_gemini_key_uses_deterministic_provider(monkeypatch):
    from app.config import settings
    from app.services.ai.llm_provider import get_llm_provider, DeterministicFallbackProvider

    monkeypatch.setattr(settings, "GEMINI_API_KEY", "")
    provider = get_llm_provider()
    assert isinstance(provider, DeterministicFallbackProvider)

