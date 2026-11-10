from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.alerts import AlertItem, DisasterAdvisory

class AlertProvider(ABC):
    """
    Abstract interface for severe weather alerts and disaster warnings.
    """

    @abstractmethod
    async def get_alerts(self, location_name: Optional[str] = None, severity: Optional[str] = None) -> List[AlertItem]:
        """Fetch active meteorological alerts."""
        pass

    @abstractmethod
    def generate_advisories(self, weather_data: dict) -> List[DisasterAdvisory]:
        """Generate domain-specific disaster and daily advisories based on meteorological metrics."""
        pass
