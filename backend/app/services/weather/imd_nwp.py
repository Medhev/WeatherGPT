"""
NWP (Numerical Weather Prediction) and MoES/IMD Integration Specification & Interface

This module defines the architectural contracts for integrating:
1. IMD National Weather Forecasting Centre (NWFC) bulletins & District Weather Warnings
2. Global Forecast System (GFS) 12km/28km Indian domain grids
3. Weather Research and Forecasting (WRF) 3km High-Resolution Meso-scale model outputs
4. INSAT-3D / 3DR satellite meteorological data streams

Status:
- Open-Meteo Harmonized Provider: FULLY OPERATIONAL (Real-time live feeds)
- IMD API Connector: PENDING OFFICIAL MoES API CREDENTIALS (Documented Interface)
- WRF / GFS Direct NetCDF Pipeline: SPECIFIED (Ready for High-Performance Computing / HPC ingestion)
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel

class IntegrationStatus(BaseModel):
    provider_name: str
    status: str            # "OPERATIONAL", "PENDING_CREDENTIALS", "PLANNED_HPC"
    description: str
    auth_required: bool
    data_format: str
    update_frequency: str
    api_endpoint: Optional[str] = None
    notes: str

class NwpIntegrationRegistry:
    @staticmethod
    def get_status() -> Dict[str, IntegrationStatus]:
        return {
            "open_meteo": IntegrationStatus(
                provider_name="Open-Meteo High-Resolution Global",
                status="OPERATIONAL",
                description="Live real-time weather, 7-day hourly forecasting, and 70-year historical climate reanalysis.",
                auth_required=False,
                data_format="JSON REST API",
                update_frequency="Hourly",
                api_endpoint="https://api.open-meteo.com/v1",
                notes="Primary operational provider powering current live dashboard and historical analytics."
            ),
            "imd_mausam": IntegrationStatus(
                provider_name="India Meteorological Department (Mausam API)",
                status="PENDING_CREDENTIALS",
                description="Official Indian national weather alerts, agro-meteorological advisories, and cyclone bulletins.",
                auth_required=True,
                data_format="JSON / XML CAP (Common Alerting Protocol)",
                update_frequency="3-Hourly",
                api_endpoint="https://mausam.imd.gov.in/api/v1",
                notes="Interface implemented; requires official Ministry of Earth Sciences organizational API key for production authorization."
            ),
            "wrf_mesoscale": IntegrationStatus(
                provider_name="IMD-WRF 3km Mesoscale Model",
                status="PLANNED_HPC",
                description="High-resolution numerical weather prediction model executed on MoES supercomputers (Pratyush / Mihir).",
                auth_required=True,
                data_format="NetCDF-4 / GRIB2",
                update_frequency="6-Hourly (00, 06, 12, 18 UTC)",
                api_endpoint="ftp://imdgen.imd.gov.in/wrf_runs",
                notes="Requires HPC compute node or distributed file system mount for direct binary ingestion."
            ),
            "gfs_india": IntegrationStatus(
                provider_name="IMD-GFS 12km Global Forecast System",
                status="PLANNED_HPC",
                description="Global numerical weather prediction providing medium-range synoptic scale guidance up to 10 days.",
                auth_required=True,
                data_format="GRIB2",
                update_frequency="Daily 00/12 UTC",
                api_endpoint="https://nwp.imd.gov.in/gfs",
                notes="Specification prepared for future gridded binary ingestion."
            )
        }

nwp_registry = NwpIntegrationRegistry()
