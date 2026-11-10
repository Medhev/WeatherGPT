from typing import List, Optional
from datetime import datetime, timedelta
from app.services.alerts.base import AlertProvider
from app.services.alerts.advisory_engine import advisory_engine
from app.schemas.alerts import AlertItem, AlertListResponse, DisasterAdvisory

# Curated demonstration disaster warning feeds clearly labeled as simulated
# These adhere to official IMD color coding (Red, Orange, Yellow, Green) for student academic demonstration
DEMO_SIMULATED_ALERTS: List[dict] = [
    {
        "id": 101,
        "event_type": "Heavy Rainfall & Thunderstorm",
        "severity": "Severe",
        "title": "[DEMO - SIMULATED FOR EVALUATION] Orange Alert: Heavy Rainfall Anticipated in Coastal Tamil Nadu",
        "description": "Simulated meteorological scenario: Isolated heavy to very heavy rainfall (70mm - 120mm) accompanied by gusty winds up to 45 km/h over Chennai, Kanchipuram, and Tiruvallur districts.",
        "instruction": "Avoid venturing near waterlogged subways. Ensure storm drains are unobstructed. Secure light roofing sheets and maintain emergency lighting.",
        "location_name": "Chennai, Tamil Nadu",
        "latitude": 13.0827,
        "longitude": 80.2707,
        "effective_at": datetime.utcnow() - timedelta(hours=2),
        "expires_at": datetime.utcnow() + timedelta(hours=22),
        "source": "IMD Prototype / Simulated Demo Feed",
        "is_active": True,
        "is_simulated": True
    },
    {
        "id": 102,
        "event_type": "Heatwave Conditions",
        "severity": "Moderate",
        "title": "[DEMO - SIMULATED FOR EVALUATION] Yellow Alert: Warm to Hot Daytime Temperatures in Vidarbha",
        "description": "Simulated meteorological scenario: Daytime maximum temperatures likely to hover 2.5°C to 3.5°C above seasonal normal over Nagpur and surrounding districts.",
        "instruction": "Avoid prolonged outdoor exposure from 12:00 PM to 3:30 PM. Drink plenty of water and oral rehydration salts.",
        "location_name": "Nagpur, Maharashtra",
        "latitude": 21.1458,
        "longitude": 79.0882,
        "effective_at": datetime.utcnow() - timedelta(hours=5),
        "expires_at": datetime.utcnow() + timedelta(hours=48),
        "source": "IMD Prototype / Simulated Demo Feed",
        "is_active": True,
        "is_simulated": True
    },
    {
        "id": 103,
        "event_type": "Squally Wind & Rough Sea Warning",
        "severity": "Severe",
        "title": "[DEMO - SIMULATED FOR EVALUATION] Fishermen Warning: Rough Sea Conditions along Odisha Coast",
        "description": "Simulated meteorological scenario: Squally winds with speeds reaching 40-50 km/h gusting to 60 km/h likely to prevail over northwest Bay of Bengal off Odisha coast.",
        "instruction": "Fishermen are advised not to venture into the deep sea areas until further notice.",
        "location_name": "Puri, Odisha",
        "latitude": 19.8135,
        "longitude": 85.8312,
        "effective_at": datetime.utcnow() - timedelta(hours=1),
        "expires_at": datetime.utcnow() + timedelta(hours=18),
        "source": "IMD Prototype / Simulated Demo Feed",
        "is_active": True,
        "is_simulated": True
    },
    {
        "id": 104,
        "event_type": "Dense Fog Advisory",
        "severity": "Moderate",
        "title": "[DEMO - SIMULATED FOR EVALUATION] Morning Visibility Reduction over Indo-Gangetic Plains",
        "description": "Simulated meteorological scenario: Shallow to moderate fog during early morning hours reducing visibility to 200-400 meters in isolated pockets of Delhi NCR and Punjab.",
        "instruction": "Motorists must use fog lights and exercise caution at highway intersections.",
        "location_name": "New Delhi, Delhi",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "effective_at": datetime.utcnow() - timedelta(hours=6),
        "expires_at": datetime.utcnow() + timedelta(hours=12),
        "source": "IMD Prototype / Simulated Demo Feed",
        "is_active": True,
        "is_simulated": True
    }
]


class AlertService(AlertProvider):
    def __init__(self):
        self._alerts: List[AlertItem] = [AlertItem(**item) for item in DEMO_SIMULATED_ALERTS]

    async def get_alerts(
        self,
        location_name: Optional[str] = None,
        severity: Optional[str] = None,
        include_simulated: bool = True
    ) -> List[AlertItem]:
        filtered = self._alerts.copy()

        if not include_simulated:
            filtered = [a for a in filtered if not a.is_simulated]

        if severity and severity.lower() != "all":
            filtered = [a for a in filtered if a.severity.lower() == severity.lower()]

        if location_name and location_name.strip():
            query_loc = location_name.strip().lower()
            filtered = [a for a in filtered if query_loc in a.location_name.lower() or query_loc in a.title.lower()]

        return filtered

    async def get_alerts_summary(self, location_name: Optional[str] = None) -> AlertListResponse:
        alerts = await self.get_alerts(location_name=location_name)
        active_count = len([a for a in alerts if a.is_active])
        severe_count = len([a for a in alerts if a.severity.lower() == "severe"])
        extreme_count = len([a for a in alerts if a.severity.lower() == "extreme"])

        return AlertListResponse(
            total=len(alerts),
            alerts=alerts,
            active_count=active_count,
            severe_count=severe_count,
            extreme_count=extreme_count,
            timestamp=datetime.utcnow()
        )

    def generate_advisories(self, weather_data: dict) -> List[DisasterAdvisory]:
        return advisory_engine.evaluate_weather(weather_data)

alert_service = AlertService()
