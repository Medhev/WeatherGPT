# Numerical Weather Prediction (NWP) & MoES/IMD Integration Specification

**Problem Statement ID:** 26068  
**Department:** India Meteorological Department (IMD) / Ministry of Earth Sciences (MoES)  
**Theme:** Disaster Management  

---

## 1. Overview of Meteorological Modeling Systems

Weather forecasting at the national level relies on complex numerical weather prediction (NWP) models executed on high-performance supercomputers (such as the MoES *Pratyush* and *Mihir* systems). WeatherGPT provides a unified abstraction layer connecting real-time APIs with prospective gridded numerical model pipelines.

---

## 2. Integration Status Matrix

| System / Model | Provider Entity | Operational Status | Data Format | Ingestion Pipeline |
| :--- | :--- | :--- | :--- | :--- |
| **Open-Meteo Harmonized** | Open-Meteo Global | **OPERATIONAL** | JSON REST API | Live HTTP client with in-memory caching |
| **IMD Mausam National API** | IMD / MoES | **PENDING_CREDENTIALS** | JSON / XML CAP | Abstracted connector awaiting MoES organizational API key |
| **IMD-WRF (3km Meso)** | IMD NWFC | **PLANNED_HPC** | NetCDF-4 / GRIB2 | Gridded binary ingest requiring shared HPC directory mount |
| **IMD-GFS (12km Global)** | IMD Synoptic Center | **PLANNED_HPC** | GRIB2 | Synoptic synched binary pipeline |

---

## 3. Provider Abstraction Contract

Every weather and NWP provider in WeatherGPT adheres to the `WeatherProvider` abstract interface defined in `backend/app/services/weather/base.py`:

```python
class WeatherProvider(ABC):
    @abstractmethod
    async def search_locations(self, query: str, count: int = 10) -> List[LocationSearchResult]:
        """Resolve geographic coordinates from city names."""
        pass

    @abstractmethod
    async def get_weather(self, lat: float, lon: float, location_name: Optional[str] = None) -> WeatherResponse:
        """Fetch current telemetry and 7-day hourly forecast."""
        pass

    @abstractmethod
    async def get_historical(self, lat: float, lon: float, start_date: str, end_date: str) -> ClimateTrendsResponse:
        """Fetch historical climate archive telemetry."""
        pass
```

---

## 4. IMD Official Warnings & Disaster Early Warning Protocol

In compliance with IMD disaster protocols, alerts follow a 4-tier color standard:
1. **Green (No Warning):** Normal atmospheric parameters.
2. **Yellow (Watch / Moderate):** Deteriorating conditions; be aware of changing weather.
3. **Orange (Alert / Severe):** High risk of severe weather (heavy rainfall 70–120mm, squally winds); be prepared with contingency plans.
4. **Red (Warning / Extreme):** Immediate emergency disaster threat (cyclones, extreme inundation >120mm); take immediate protective action.

WeatherGPT clearly identifies academic demonstration alerts with the tag `[DEMO - SIMULATED FOR EVALUATION]` to preserve scientific and government integrity.
