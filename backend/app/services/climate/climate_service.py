import io
import csv
from typing import Optional, List
from datetime import datetime, timedelta
from app.services.weather.open_meteo import OpenMeteoProvider
from app.schemas.climate import ClimateTrendsResponse

class ClimateService:
    def __init__(self):
        self.provider = OpenMeteoProvider()

    async def get_climate_analysis(
        self,
        lat: float,
        lon: float,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
        location_name: Optional[str] = None
    ) -> ClimateTrendsResponse:
        # Default to previous 30 days if not specified
        if not end_date:
            end_date = (datetime.utcnow() - timedelta(days=2)).strftime("%Y-%m-%d")
        if not start_date:
            start_date = (datetime.utcnow() - timedelta(days=32)).strftime("%Y-%m-%d")

        return await self.provider.get_historical(
            lat=lat,
            lon=lon,
            start_date=start_date,
            end_date=end_date,
            location_name=location_name
        )

    def generate_csv_report(self, climate_data: ClimateTrendsResponse) -> str:
        """
        Generate downloadable CSV string with metadata headers and daily observations.
        """
        output = io.StringIO()
        writer = csv.writer(output)

        # Header metadata
        writer.writerow(["# WeatherGPT MoES / IMD Climate Analytics Report"])
        writer.writerow(["# Location", climate_data.location_name])
        writer.writerow(["# Latitude", f"{climate_data.latitude:.4f}"])
        writer.writerow(["# Longitude", f"{climate_data.longitude:.4f}"])
        writer.writerow(["# Period", f"{climate_data.start_date} to {climate_data.end_date}"])
        writer.writerow(["# Generated", datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")])
        writer.writerow([])

        # Summary statistics
        stats = climate_data.statistics
        writer.writerow(["# SUMMARY METRICS"])
        writer.writerow(["Analyzed Days", stats.analyzed_days_count])
        writer.writerow(["Average Temperature (°C)", stats.overall_avg_temp])
        writer.writerow(["Mean Maximum Temperature (°C)", stats.mean_max_temp])
        writer.writerow(["Mean Minimum Temperature (°C)", stats.mean_min_temp])
        writer.writerow(["Record Highest Temperature (°C)", stats.record_max_temp])
        writer.writerow(["Record Lowest Temperature (°C)", stats.record_min_temp])
        writer.writerow(["Total Accumulated Rainfall (mm)", stats.total_rainfall_mm])
        writer.writerow(["Rainy Days Count (>=2.5mm)", stats.rainy_days_count])
        writer.writerow(["Max Single Day Rainfall (mm)", stats.max_single_day_rainfall])
        writer.writerow(["Dry Spell Days (<0.1mm)", stats.dry_spell_days])
        writer.writerow(["Temperature Anomaly (°C)", stats.temperature_anomaly])
        writer.writerow([])

        # Table data
        writer.writerow([
            "Date",
            "Max Temperature (°C)",
            "Min Temperature (°C)",
            "Mean Temperature (°C)",
            "Precipitation (mm)",
            "Max Wind Speed (km/h)"
        ])

        for row in climate_data.daily_records:
            writer.writerow([
                row.date,
                row.temperature_max,
                row.temperature_min,
                row.temperature_mean,
                row.precipitation_sum,
                row.wind_speed_max
            ])

        return output.getvalue()

climate_service = ClimateService()
