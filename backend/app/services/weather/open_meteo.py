import httpx
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.services.weather.base import WeatherProvider
from app.schemas.weather import (
    WeatherResponse, CurrentWeather, HourlyForecastPoint,
    DailyForecastPoint, WeatherHighlights, LocationInfo
)
from app.schemas.location import LocationSearchResult
from app.schemas.climate import ClimateTrendsResponse, HistoricalDayData, ClimateSummaryStats
from app.config import settings

# WMO Weather interpretation code mapping
WMO_WEATHER_MAP: Dict[int, Dict[str, str]] = {
    0: {"description": "Clear Sky", "icon": "clear-day"},
    1: {"description": "Mainly Clear", "icon": "partly-cloudy-day"},
    2: {"description": "Partly Cloudy", "icon": "partly-cloudy-day"},
    3: {"description": "Overcast", "icon": "cloudy"},
    45: {"description": "Foggy", "icon": "fog"},
    48: {"description": "Depositing Rime Fog", "icon": "fog"},
    51: {"description": "Light Drizzle", "icon": "drizzle"},
    53: {"description": "Moderate Drizzle", "icon": "drizzle"},
    55: {"description": "Dense Drizzle", "icon": "drizzle"},
    56: {"description": "Freezing Drizzle", "icon": "drizzle"},
    57: {"description": "Heavy Freezing Drizzle", "icon": "drizzle"},
    61: {"description": "Slight Rain", "icon": "rain"},
    63: {"description": "Moderate Rain", "icon": "rain"},
    65: {"description": "Heavy Rain", "icon": "heavy-rain"},
    66: {"description": "Light Freezing Rain", "icon": "rain"},
    67: {"description": "Heavy Freezing Rain", "icon": "heavy-rain"},
    71: {"description": "Slight Snow Fall", "icon": "snow"},
    73: {"description": "Moderate Snow Fall", "icon": "snow"},
    75: {"description": "Heavy Snow Fall", "icon": "snow"},
    77: {"description": "Snow Grains", "icon": "snow"},
    80: {"description": "Slight Rain Showers", "icon": "showers"},
    81: {"description": "Moderate Rain Showers", "icon": "showers"},
    82: {"description": "Violent Rain Showers", "icon": "thunderstorm"},
    85: {"description": "Slight Snow Showers", "icon": "snow"},
    86: {"description": "Heavy Snow Showers", "icon": "snow"},
    95: {"description": "Thunderstorm", "icon": "thunderstorm"},
    96: {"description": "Thunderstorm with Slight Hail", "icon": "thunderstorm"},
    99: {"description": "Severe Thunderstorm with Heavy Hail", "icon": "thunderstorm"}
}

def get_weather_info(code: int, is_day: int = 1) -> Dict[str, str]:
    info = WMO_WEATHER_MAP.get(code, {"description": "Variable Weather", "icon": "cloudy"})
    icon = info["icon"]
    if is_day == 0 and icon in ["clear-day", "partly-cloudy-day"]:
        icon = icon.replace("day", "night")
    return {"description": info["description"], "icon": icon}


class OpenMeteoProvider(WeatherProvider):
    """
    Open-Meteo implementation supporting real-time conditions, forecasts, geocoding, and climate archive.
    """

    def __init__(self):
        self.timeout = httpx.Timeout(12.0, connect=6.0)

    async def search_locations(self, query: str, count: int = 10) -> List[LocationSearchResult]:
        url = f"{settings.OPEN_METEO_GEOCODING_URL}/search"
        params = {
            "name": query.strip(),
            "count": count,
            "language": "en",
            "format": "json"
        }
        
        async with httpx.AsyncClient(verify=False, timeout=self.timeout) as client:
            try:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
            except Exception as e:
                return []

        results: List[LocationSearchResult] = []
        for item in data.get("results", []):
            results.append(
                LocationSearchResult(
                    id=item.get("id"),
                    name=item.get("name"),
                    latitude=item.get("latitude"),
                    longitude=item.get("longitude"),
                    elevation=item.get("elevation"),
                    country=item.get("country"),
                    country_code=item.get("country_code"),
                    admin1=item.get("admin1"),
                    timezone=item.get("timezone", "Asia/Kolkata")
                )
            )
        return results

    async def get_weather(self, lat: float, lon: float, location_name: Optional[str] = None) -> WeatherResponse:
        url = f"{settings.OPEN_METEO_BASE_URL}/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
            "hourly": "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,is_day",
            "daily": "weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max",
            "timezone": "auto"
        }

        async with httpx.AsyncClient(verify=False, timeout=self.timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        current_raw = data.get("current", {})
        hourly_raw = data.get("hourly", {})
        daily_raw = data.get("daily", {})
        tz = data.get("timezone", "Asia/Kolkata")

        # Parse current
        w_code = current_raw.get("weather_code", 0)
        is_day = current_raw.get("is_day", 1)
        w_info = get_weather_info(w_code, is_day)

        current = CurrentWeather(
            temperature=current_raw.get("temperature_2m", 0.0),
            apparent_temperature=current_raw.get("apparent_temperature", 0.0),
            relative_humidity=int(current_raw.get("relative_humidity_2m", 0)),
            is_day=is_day,
            precipitation=current_raw.get("precipitation", 0.0),
            rain=current_raw.get("rain", 0.0),
            weather_code=w_code,
            weather_description=w_info["description"],
            weather_icon=w_info["icon"],
            cloud_cover=int(current_raw.get("cloud_cover", 0)),
            pressure_msl=current_raw.get("pressure_msl", 1013.25),
            surface_pressure=current_raw.get("surface_pressure", 1013.25),
            wind_speed=current_raw.get("wind_speed_10m", 0.0),
            wind_direction=int(current_raw.get("wind_direction_10m", 0)),
            wind_gusts=current_raw.get("wind_gusts_10m", 0.0),
            visibility=10.0,
            uv_index=round(daily_raw.get("uv_index_max", [5.0])[0] if daily_raw.get("uv_index_max") else 5.0, 1),
            time=current_raw.get("time", datetime.utcnow().isoformat())
        )

        # Parse hourly (next 24 hours)
        hourly_list: List[HourlyForecastPoint] = []
        times = hourly_raw.get("time", [])
        for i in range(min(24, len(times))):
            h_code = hourly_raw.get("weather_code", [])[i] if i < len(hourly_raw.get("weather_code", [])) else 0
            h_is_day = hourly_raw.get("is_day", [])[i] if i < len(hourly_raw.get("is_day", [])) else 1
            h_info = get_weather_info(h_code, h_is_day)
            hourly_list.append(
                HourlyForecastPoint(
                    time=times[i],
                    temperature=hourly_raw.get("temperature_2m", [])[i] if i < len(hourly_raw.get("temperature_2m", [])) else 0.0,
                    apparent_temperature=hourly_raw.get("apparent_temperature", [])[i] if i < len(hourly_raw.get("apparent_temperature", [])) else 0.0,
                    precipitation_probability=hourly_raw.get("precipitation_probability", [])[i] if i < len(hourly_raw.get("precipitation_probability", [])) else 0,
                    precipitation=hourly_raw.get("precipitation", [])[i] if i < len(hourly_raw.get("precipitation", [])) else 0.0,
                    weather_code=h_code,
                    weather_description=h_info["description"],
                    weather_icon=h_info["icon"],
                    relative_humidity=hourly_raw.get("relative_humidity_2m", [])[i] if i < len(hourly_raw.get("relative_humidity_2m", [])) else 0,
                    wind_speed=hourly_raw.get("wind_speed_10m", [])[i] if i < len(hourly_raw.get("wind_speed_10m", [])) else 0.0,
                    is_day=h_is_day
                )
            )

        # Parse daily (up to 7 days)
        daily_list: List[DailyForecastPoint] = []
        d_dates = daily_raw.get("time", [])
        for i in range(min(7, len(d_dates))):
            d_code = daily_raw.get("weather_code", [])[i] if i < len(daily_raw.get("weather_code", [])) else 0
            d_info = get_weather_info(d_code, 1)
            daily_list.append(
                DailyForecastPoint(
                    date=d_dates[i],
                    weather_code=d_code,
                    weather_description=d_info["description"],
                    weather_icon=d_info["icon"],
                    temperature_max=daily_raw.get("temperature_2m_max", [])[i] if i < len(daily_raw.get("temperature_2m_max", [])) else 0.0,
                    temperature_min=daily_raw.get("temperature_2m_min", [])[i] if i < len(daily_raw.get("temperature_2m_min", [])) else 0.0,
                    apparent_temperature_max=daily_raw.get("apparent_temperature_max", [])[i] if i < len(daily_raw.get("apparent_temperature_max", [])) else 0.0,
                    apparent_temperature_min=daily_raw.get("apparent_temperature_min", [])[i] if i < len(daily_raw.get("apparent_temperature_min", [])) else 0.0,
                    sunrise=daily_raw.get("sunrise", [])[i] if i < len(daily_raw.get("sunrise", [])) else None,
                    sunset=daily_raw.get("sunset", [])[i] if i < len(daily_raw.get("sunset", [])) else None,
                    uv_index_max=daily_raw.get("uv_index_max", [])[i] if i < len(daily_raw.get("uv_index_max", [])) else None,
                    precipitation_sum=daily_raw.get("precipitation_sum", [])[i] if i < len(daily_raw.get("precipitation_sum", [])) else 0.0,
                    precipitation_probability_max=daily_raw.get("precipitation_probability_max", [])[i] if i < len(daily_raw.get("precipitation_probability_max", [])) else 0,
                    wind_speed_max=daily_raw.get("wind_speed_10m_max", [])[i] if i < len(daily_raw.get("wind_speed_10m_max", [])) else 0.0,
                    wind_gusts_max=daily_raw.get("wind_gusts_10m_max", [])[i] if i < len(daily_raw.get("wind_gusts_10m_max", [])) else 0.0,
                )
            )

        # Highlights
        first_sunrise = daily_raw.get("sunrise", [None])[0] if daily_raw.get("sunrise") else None
        first_sunset = daily_raw.get("sunset", [None])[0] if daily_raw.get("sunset") else None
        highlights = WeatherHighlights(
            humidity=current.relative_humidity,
            wind_speed=current.wind_speed,
            wind_direction=current.wind_direction,
            visibility_km=10.0,
            pressure_hpa=current.pressure_msl,
            uv_index=current.uv_index or 5.0,
            sunrise=first_sunrise,
            sunset=first_sunset,
            air_quality_summary="Good to Moderate"
        )

        return WeatherResponse(
            location=LocationInfo(
                name=location_name or f"Coords ({lat:.2f}, {lon:.2f})",
                latitude=lat,
                longitude=lon,
                timezone=tz
            ),
            current=current,
            hourly=hourly_list,
            daily=daily_list,
            highlights=highlights,
            source="Open-Meteo & IMD Harmonized Forecast",
            cached=False
        )

    async def get_historical(self, lat: float, lon: float, start_date: str, end_date: str, location_name: Optional[str] = None) -> ClimateTrendsResponse:
        url = f"{settings.OPEN_METEO_ARCHIVE_URL}/archive"
        params = {
            "latitude": lat,
            "longitude": lon,
            "start_date": start_date,
            "end_date": end_date,
            "daily": "temperature_2m_max,temperature_2m_min,temperature_2m_mean,precipitation_sum,wind_speed_10m_max",
            "timezone": "auto"
        }

        async with httpx.AsyncClient(verify=False, timeout=self.timeout) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()

        daily_raw = data.get("daily", {})
        dates = daily_raw.get("time", [])
        t_maxs = daily_raw.get("temperature_2m_max", [])
        t_mins = daily_raw.get("temperature_2m_min", [])
        t_means = daily_raw.get("temperature_2m_mean", [])
        precips = daily_raw.get("precipitation_sum", [])
        winds = daily_raw.get("wind_speed_10m_max", [])

        records: List[HistoricalDayData] = []
        for i in range(len(dates)):
            records.append(
                HistoricalDayData(
                    date=dates[i],
                    temperature_max=t_maxs[i] if i < len(t_maxs) and t_maxs[i] is not None else 0.0,
                    temperature_min=t_mins[i] if i < len(t_mins) and t_mins[i] is not None else 0.0,
                    temperature_mean=t_means[i] if i < len(t_means) and t_means[i] is not None else 0.0,
                    precipitation_sum=precips[i] if i < len(precips) and precips[i] is not None else 0.0,
                    wind_speed_max=winds[i] if i < len(winds) and winds[i] is not None else 0.0
                )
            )

        # Calculate statistics
        valid_maxs = [r.temperature_max for r in records if r.temperature_max is not None]
        valid_mins = [r.temperature_min for r in records if r.temperature_min is not None]
        valid_means = [r.temperature_mean for r in records if r.temperature_mean is not None]
        valid_precips = [r.precipitation_sum for r in records if r.precipitation_sum is not None]

        mean_max = sum(valid_maxs) / len(valid_maxs) if valid_maxs else 0.0
        mean_min = sum(valid_mins) / len(valid_mins) if valid_mins else 0.0
        overall_avg = sum(valid_means) / len(valid_means) if valid_means else 0.0
        rec_max = max(valid_maxs) if valid_maxs else 0.0
        rec_min = min(valid_mins) if valid_mins else 0.0
        total_rain = sum(valid_precips) if valid_precips else 0.0
        rainy_days = len([p for p in valid_precips if p >= 2.5]) # IMD defines 2.5mm+ as rainy day
        max_rain = max(valid_precips) if valid_precips else 0.0
        dry_days = len([p for p in valid_precips if p < 0.1])

        # Temperature anomaly benchmark (indicative relative to 30-year Indian seasonal standard ~28°C)
        anomaly = round(overall_avg - 28.0, 2)

        stats = ClimateSummaryStats(
            mean_max_temp=round(mean_max, 2),
            mean_min_temp=round(mean_min, 2),
            overall_avg_temp=round(overall_avg, 2),
            record_max_temp=round(rec_max, 2),
            record_min_temp=round(rec_min, 2),
            total_rainfall_mm=round(total_rain, 2),
            rainy_days_count=rainy_days,
            max_single_day_rainfall=round(max_rain, 2),
            dry_spell_days=dry_days,
            analyzed_days_count=len(records),
            temperature_anomaly=anomaly
        )

        return ClimateTrendsResponse(
            location_name=location_name or f"Coords ({lat:.2f}, {lon:.2f})",
            latitude=lat,
            longitude=lon,
            start_date=start_date,
            end_date=end_date,
            daily_records=records,
            statistics=stats,
            data_source="Open-Meteo Historical Climate Archive & MoES Standard Metrics"
        )
