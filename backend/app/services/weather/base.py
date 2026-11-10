from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.weather import WeatherResponse, CurrentWeather
from app.schemas.location import LocationSearchResult
from app.schemas.climate import ClimateTrendsResponse

class WeatherProvider(ABC):
    """
    Abstract base class for all meteorological data providers.
    Enables pluggable integration of Open-Meteo, IMD, GFS, WRF, or custom sources.
    """

    @abstractmethod
    async def search_locations(self, query: str, count: int = 10) -> List[LocationSearchResult]:
        """Search geographic coordinates by city/region name."""
        pass

    @abstractmethod
    async def get_weather(self, lat: float, lon: float, location_name: Optional[str] = None) -> WeatherResponse:
        """Fetch current weather and 7-day forecast."""
        pass

    @abstractmethod
    async def get_historical(self, lat: float, lon: float, start_date: str, end_date: str, location_name: Optional[str] = None) -> ClimateTrendsResponse:
        """Fetch historical meteorological data over a specified date range."""
        pass
