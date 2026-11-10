from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from app.services.weather.weather_service import weather_service
from app.services.alerts.alert_service import alert_service
from app.services.alerts.advisory_engine import advisory_engine
from app.services.climate.climate_service import climate_service

class ToolExecutor:
    """
    Executes domain-specific meteorological tools based on parsed user intent.
    Validates returned data and packages it for LLM grounding or deterministic templates.
    """

    @staticmethod
    async def execute(
        intent: str,
        primary_location: Optional[str] = "Chennai",
        secondary_location: Optional[str] = None,
        time_context: str = "today"
    ) -> Dict[str, Any]:
        loc = primary_location or "Chennai"

        if intent == "GENERAL_CHAT":
            return {
                "tool": "none",
                "success": True,
                "is_general_chat": True
            }

        elif intent == "COMPARE_CITIES":
            sec_loc = secondary_location or "Bengaluru"
            comparison = await weather_service.compare_cities(loc, sec_loc)
            if comparison:
                return {
                    "tool": "compare_cities",
                    "success": True,
                    "city_a": comparison.city_a.location.name,
                    "city_b": comparison.city_b.location.name,
                    "summary": comparison.comparison_summary,
                    "data": comparison.dict()
                }
            return {"tool": "compare_cities", "success": False, "error": f"Could not find weather for '{loc}' or '{sec_loc}'."}

        elif intent == "ALERTS_WARNINGS":
            alerts = await alert_service.get_alerts(location_name=loc)
            return {
                "tool": "get_alerts",
                "success": True,
                "location": loc,
                "count": len(alerts),
                "alerts": [a.dict() for a in alerts]
            }

        elif intent == "HISTORICAL_CLIMATE":
            search = await weather_service.search_cities(loc)
            if search:
                best = search[0]
                end_d = (datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d")
                start_d = (datetime.utcnow() - timedelta(days=32)).strftime("%Y-%m-%d")
                res = await climate_service.get_climate_analysis(
                    lat=best.latitude,
                    lon=best.longitude,
                    start_date=start_d,
                    end_date=end_d,
                    location_name=best.name
                )
                return {
                    "tool": "historical_climate",
                    "success": True,
                    "location": best.name,
                    "data": res.dict()
                }
            return {"tool": "historical_climate", "success": False, "error": f"Location '{loc}' not found."}

        # For CURRENT_WEATHER, FORECAST, UMBRELLA_DECISION, FARMER_ADVISORY, TRAVEL_SAFETY, TEMP_CHANGES:
        weather = await weather_service.get_weather_for_city(loc)
        if not weather:
            return {"tool": "get_weather", "success": False, "error": f"Could not find meteorological data for '{loc}'."}

        advisories = advisory_engine.evaluate_weather(weather.dict())

        return {
            "tool": "get_weather",
            "success": True,
            "location": weather.location.name,
            "current": weather.current.dict(),
            "hourly": [h.dict() for h in weather.hourly[:12]],
            "daily": [d.dict() for d in weather.daily[:7]],
            "highlights": weather.highlights.dict(),
            "advisories": [adv.dict() for adv in advisories],
            "time_context": time_context
        }

tool_executor = ToolExecutor()
