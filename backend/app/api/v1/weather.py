from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional
from app.services.weather.weather_service import weather_service
from app.schemas.weather import WeatherResponse, CityComparisonResponse

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/current", response_model=WeatherResponse)
async def get_current_weather(
    city: Optional[str] = Query(None, description="City name, e.g. Chennai"),
    lat: Optional[float] = Query(None, description="Latitude coordinate"),
    lon: Optional[float] = Query(None, description="Longitude coordinate"),
):
    # If coordinates are provided, resolve weather directly for coordinates
    if lat is not None and lon is not None:
        loc_name = city if (city and city != "My Current Location") else None
        return await weather_service.get_weather_for_coords(lat, lon, location_name=loc_name)

    if city:
        weather = await weather_service.get_weather_for_city(city)
        if not weather:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Location '{city}' could not be resolved."
            )
        return weather

    # Default fallback to Chennai for MoES / IMD demonstration
    return await weather_service.get_weather_for_city("Chennai")

@router.get("/forecast", response_model=WeatherResponse)
async def get_forecast(
    city: Optional[str] = Query(None, description="City name, e.g. Chennai"),
    lat: Optional[float] = Query(None, description="Latitude coordinate"),
    lon: Optional[float] = Query(None, description="Longitude coordinate"),
):
    return await get_current_weather(city=city, lat=lat, lon=lon)

@router.get("/compare", response_model=CityComparisonResponse)
async def compare_weather(
    city_a: str = Query(..., description="First city name, e.g. Chennai"),
    city_b: str = Query(..., description="Second city name, e.g. Bengaluru")
):
    comparison = await weather_service.compare_cities(city_a, city_b)
    if not comparison:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unable to compare '{city_a}' and '{city_b}'. Please check spelling."
        )
    return comparison
