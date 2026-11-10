from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class CurrentWeather(BaseModel):
    temperature: float
    apparent_temperature: float
    relative_humidity: int
    is_day: int
    precipitation: float
    rain: float
    weather_code: int
    weather_description: str
    weather_icon: str
    cloud_cover: int
    pressure_msl: float
    surface_pressure: float
    wind_speed: float
    wind_direction: int
    wind_gusts: float
    visibility: Optional[float] = None
    uv_index: Optional[float] = None
    time: str

class HourlyForecastPoint(BaseModel):
    time: str
    temperature: float
    apparent_temperature: float
    precipitation_probability: int
    precipitation: float
    weather_code: int
    weather_description: str
    weather_icon: str
    relative_humidity: int
    wind_speed: float
    is_day: int

class DailyForecastPoint(BaseModel):
    date: str
    weather_code: int
    weather_description: str
    weather_icon: str
    temperature_max: float
    temperature_min: float
    apparent_temperature_max: float
    apparent_temperature_min: float
    sunrise: Optional[str] = None
    sunset: Optional[str] = None
    uv_index_max: Optional[float] = None
    precipitation_sum: float
    precipitation_probability_max: int
    wind_speed_max: float
    wind_gusts_max: float

class WeatherHighlights(BaseModel):
    humidity: int
    wind_speed: float
    wind_direction: int
    visibility_km: float
    pressure_hpa: float
    uv_index: float
    sunrise: Optional[str] = None
    sunset: Optional[str] = None
    air_quality_summary: Optional[str] = "Moderate"

class LocationInfo(BaseModel):
    name: str
    latitude: float
    longitude: float
    country: Optional[str] = "India"
    admin1: Optional[str] = None
    timezone: Optional[str] = "Asia/Kolkata"

class WeatherResponse(BaseModel):
    location: LocationInfo
    current: CurrentWeather
    hourly: List[HourlyForecastPoint]
    daily: List[DailyForecastPoint]
    highlights: WeatherHighlights
    source: str = "Open-Meteo & IMD Harmonized Feed"
    cached: bool = False

class CityComparisonResponse(BaseModel):
    city_a: WeatherResponse
    city_b: WeatherResponse
    comparison_summary: str
    temp_difference: float
    rain_comparison: str
    wind_comparison: str
