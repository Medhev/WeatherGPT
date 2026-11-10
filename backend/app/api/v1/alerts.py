from fastapi import APIRouter, Query, HTTPException, status
from typing import Optional, List
from app.services.alerts.alert_service import alert_service
from app.services.weather.weather_service import weather_service
from app.schemas.alerts import AlertListResponse, AlertItem, DisasterAdvisory

router = APIRouter(prefix="/alerts", tags=["Alerts & Warnings"])

@router.get("", response_model=AlertListResponse)
async def list_alerts(
    location: Optional[str] = Query(None, description="Filter by location name"),
    severity: Optional[str] = Query(None, description="Filter by severity: Minor, Moderate, Severe, Extreme"),
    include_simulated: bool = Query(True, description="Include academic simulation demo alerts")
):
    alerts = await alert_service.get_alerts(
        location_name=location,
        severity=severity,
        include_simulated=include_simulated
    )
    active_count = len([a for a in alerts if a.is_active])
    severe_count = len([a for a in alerts if a.severity.lower() == "severe"])
    extreme_count = len([a for a in alerts if a.severity.lower() == "extreme"])

    from datetime import datetime
    return AlertListResponse(
        total=len(alerts),
        alerts=alerts,
        active_count=active_count,
        severe_count=severe_count,
        extreme_count=extreme_count,
        timestamp=datetime.utcnow()
    )

@router.get("/advisories", response_model=List[DisasterAdvisory])
async def get_location_advisories(
    city: Optional[str] = Query("Chennai", description="Target city for advisory generation")
):
    weather = await weather_service.get_weather_for_city(city)
    if not weather:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Unable to find meteorological data for '{city}'."
        )
    return alert_service.generate_advisories(weather.dict())
