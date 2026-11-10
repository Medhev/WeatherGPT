from sqlalchemy import Column, Integer, String, Text, DateTime, Float, Boolean
from datetime import datetime
from app.database import Base

class WeatherAlert(Base):
    __tablename__ = "weather_alerts"

    id = Column(Integer, primary_key=True, index=True)
    event_type = Column(String(100), nullable=False)        # Heatwave, Cyclone, Heavy Rain, Thunderstorm, Flood Warning
    severity = Column(String(50), nullable=False)           # Minor, Moderate, Severe, Extreme
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    instruction = Column(Text, nullable=True)               # Precautionary advice / action
    location_name = Column(String(150), nullable=False)     # e.g., Chennai, Coastal Tamil Nadu
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    effective_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)
    source = Column(String(100), default="Open-Meteo Severe Weather") # 'IMD Official', 'Open-Meteo', 'Demo Simulated'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
