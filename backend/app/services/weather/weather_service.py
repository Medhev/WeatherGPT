import time
from typing import Dict, Any, Optional, List, Tuple
from app.services.weather.open_meteo import OpenMeteoProvider
from app.schemas.weather import WeatherResponse, CityComparisonResponse
from app.schemas.location import LocationSearchResult

class WeatherCache:
    def __init__(self, ttl_seconds: int = 600):
        self.ttl = ttl_seconds
        self._cache: Dict[str, Tuple[float, Any]] = {}

    def get(self, key: str) -> Optional[Any]:
        if key in self._cache:
            timestamp, data = self._cache[key]
            if time.time() - timestamp < self.ttl:
                return data
            else:
                del self._cache[key]
        return None

    def set(self, key: str, data: Any):
        self._cache[key] = (time.time(), data)


class WeatherService:
    def __init__(self):
        self.provider = OpenMeteoProvider()
        self.cache = WeatherCache(ttl_seconds=600)  # 10 minute cache

    async def search_cities(self, query: str) -> List[LocationSearchResult]:
        if not query or len(query.strip()) < 2:
            return []
        cache_key = f"search_{query.strip().lower()}"
        cached = self.cache.get(cache_key)
        if cached:
            return cached
        
        results = await self.provider.search_locations(query)
        self.cache.set(cache_key, results)
        return results

    async def get_weather_for_coords(self, lat: float, lon: float, location_name: Optional[str] = None) -> WeatherResponse:
        cache_key = f"weather_{round(lat, 2)}_{round(lon, 2)}"
        cached: Optional[WeatherResponse] = self.cache.get(cache_key)
        if cached:
            cached.cached = True
            if location_name:
                cached.location.name = location_name
            return cached

        weather = await self.provider.get_weather(lat, lon, location_name)
        self.cache.set(cache_key, weather)
        return weather

    async def get_weather_for_city(self, city_name: str) -> Optional[WeatherResponse]:
        search_results = await self.search_cities(city_name)
        if not search_results:
            return None
        
        best = search_results[0]
        full_name = f"{best.name}, {best.admin1 or best.country or ''}".strip(", ")
        return await self.get_weather_for_coords(best.latitude, best.longitude, full_name)

    async def compare_cities(self, city_a: str, city_b: str) -> Optional[CityComparisonResponse]:
        weather_a = await self.get_weather_for_city(city_a)
        weather_b = await self.get_weather_for_city(city_b)

        if not weather_a or not weather_b:
            return None

        temp_diff = round(weather_a.current.temperature - weather_b.current.temperature, 1)
        if abs(temp_diff) < 0.5:
            temp_desc = f"Both cities have virtually identical temperatures (~{weather_a.current.temperature}°C)."
        elif temp_diff > 0:
            temp_desc = f"{weather_a.location.name} is warmer by {temp_diff}°C compared to {weather_b.location.name}."
        else:
            temp_desc = f"{weather_b.location.name} is warmer by {abs(temp_diff)}°C compared to {weather_a.location.name}."

        rain_a = weather_a.current.rain
        rain_b = weather_b.current.rain
        if rain_a > rain_b:
            rain_desc = f"{weather_a.location.name} is experiencing higher precipitation ({rain_a} mm)."
        elif rain_b > rain_a:
            rain_desc = f"{weather_b.location.name} is experiencing higher precipitation ({rain_b} mm)."
        else:
            rain_desc = "Neither city has significant active precipitation right now."

        wind_a = weather_a.current.wind_speed
        wind_b = weather_b.current.wind_speed
        wind_desc = f"Wind is {wind_a} km/h in {weather_a.location.name} vs {wind_b} km/h in {weather_b.location.name}."

        summary = f"{temp_desc} {rain_desc} {wind_desc}"

        return CityComparisonResponse(
            city_a=weather_a,
            city_b=weather_b,
            comparison_summary=summary,
            temp_difference=temp_diff,
            rain_comparison=rain_desc,
            wind_comparison=wind_desc
        )

weather_service = WeatherService()
