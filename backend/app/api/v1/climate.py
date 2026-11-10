from fastapi import APIRouter, Query, HTTPException, Response, status
from typing import Optional
from app.services.climate.climate_service import climate_service
from app.services.weather.weather_service import weather_service
from app.schemas.climate import ClimateTrendsResponse

router = APIRouter(prefix="/climate", tags=["Historical Climate"])

@router.get("/trends", response_model=ClimateTrendsResponse)
async def get_climate_trends(
    city: Optional[str] = Query("Chennai", description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
):
    target_lat = lat
    target_lon = lon
    target_name = city

    if target_lat is None or target_lon is None:
        search = await weather_service.search_cities(city or "Chennai")
        if not search:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"City '{city}' not found."
            )
        target_lat = search[0].latitude
        target_lon = search[0].longitude
        target_name = search[0].name

    return await climate_service.get_climate_analysis(
        lat=target_lat,
        lon=target_lon,
        start_date=start_date,
        end_date=end_date,
        location_name=target_name
    )

@router.get("/export-csv")
async def export_climate_csv(
    city: Optional[str] = Query("Chennai", description="City name"),
    lat: Optional[float] = Query(None, description="Latitude"),
    lon: Optional[float] = Query(None, description="Longitude"),
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
):
    trends = await get_climate_trends(city=city, lat=lat, lon=lon, start_date=start_date, end_date=end_date)
    csv_content = climate_service.generate_csv_report(trends)
    filename = f"weathergpt_climate_{trends.location_name.replace(' ', '_').lower()}_{trends.start_date}_to_{trends.end_date}.csv"

    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
