from fastapi import APIRouter
from typing import Dict
from app.services.weather.imd_nwp import nwp_registry, IntegrationStatus

router = APIRouter(prefix="/nwp", tags=["NWP & IMD Integrations"])

@router.get("/status", response_model=Dict[str, IntegrationStatus])
def get_nwp_integration_status():
    """
    Returns verified status of all integrated Numerical Weather Prediction models
    and MoES/IMD data feeds.
    """
    return nwp_registry.get_status()
