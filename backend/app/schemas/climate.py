from pydantic import BaseModel
from typing import List, Optional

class HistoricalDayData(BaseModel):
    date: str
    temperature_max: float
    temperature_min: float
    temperature_mean: float
    precipitation_sum: float
    wind_speed_max: float
    relative_humidity_mean: Optional[float] = None

class ClimateSummaryStats(BaseModel):
    mean_max_temp: float
    mean_min_temp: float
    overall_avg_temp: float
    record_max_temp: float
    record_min_temp: float
    total_rainfall_mm: float
    rainy_days_count: int
    max_single_day_rainfall: float
    dry_spell_days: int
    analyzed_days_count: int
    temperature_anomaly: Optional[float] = None  # deviation from standard normal

class ClimateTrendsResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    start_date: str
    end_date: str
    daily_records: List[HistoricalDayData]
    statistics: ClimateSummaryStats
    data_source: str = "Open-Meteo Historical Climate Archive"
