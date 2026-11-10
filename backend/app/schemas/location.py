from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationSearchResult(BaseModel):
    id: Optional[int] = None
    name: str
    latitude: float
    longitude: float
    elevation: Optional[float] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    admin1: Optional[str] = None       # State / Province
    timezone: Optional[str] = None

class SavedLocationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    country: Optional[str] = "India"
    admin1: Optional[str] = None
    is_favorite: Optional[bool] = False

class SavedLocationResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    country: Optional[str] = None
    admin1: Optional[str] = None
    is_favorite: bool
    created_at: datetime

    class Config:
        from_attributes = True
