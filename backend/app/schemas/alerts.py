from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class AlertItem(BaseModel):
    id: int
    event_type: str
    severity: str          # Minor, Moderate, Severe, Extreme
    title: str
    description: str
    instruction: Optional[str] = None
    location_name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    effective_at: datetime
    expires_at: Optional[datetime] = None
    source: str            # 'IMD Official', 'Open-Meteo', 'Demo Simulated'
    is_active: bool = True
    is_simulated: bool = False

    class Config:
        from_attributes = True

class AlertListResponse(BaseModel):
    total: int
    alerts: List[AlertItem]
    active_count: int
    severe_count: int
    extreme_count: int
    timestamp: datetime

class DisasterAdvisory(BaseModel):
    category: str          # Agriculture, Travel, Heat Safety, Heavy Rainfall & Flood, General
    level: str             # Normal, Caution, Warning, Emergency
    headline: str
    advice_points: List[str]
    target_demographic: str
    relevance_context: str
