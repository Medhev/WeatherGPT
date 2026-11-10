from pydantic import BaseModel
from typing import Optional

class UserPreferencesSchema(BaseModel):
    temp_unit: str = "celsius"          # celsius, fahrenheit
    wind_speed_unit: str = "kmh"        # kmh, ms, mph
    language: str = "en"                # en, ta, hi
    theme: str = "dark"                 # light, dark, system
    notifications_enabled: bool = True

    class Config:
        from_attributes = True

class UserPreferencesUpdate(BaseModel):
    temp_unit: Optional[str] = None
    wind_speed_unit: Optional[str] = None
    language: Optional[str] = None
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
