from fastapi import APIRouter, Query, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.services.weather.weather_service import weather_service
from app.services.auth.deps import get_current_user
from app.models.user import User, SavedLocation
from app.schemas.location import LocationSearchResult, SavedLocationCreate, SavedLocationResponse

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("/search", response_model=List[LocationSearchResult])
async def search_locations(
    q: str = Query(..., min_length=2, description="City query string")
):
    return await weather_service.search_cities(q)

@router.get("/saved", response_model=List[SavedLocationResponse])
def get_saved_locations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(SavedLocation).filter(SavedLocation.user_id == user.id).all()

@router.post("/saved", response_model=SavedLocationResponse, status_code=status.HTTP_201_CREATED)
def add_saved_location(
    loc_in: SavedLocationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check duplicate
    existing = db.query(SavedLocation).filter(
        SavedLocation.user_id == user.id,
        SavedLocation.name == loc_in.name
    ).first()
    if existing:
        return existing

    new_loc = SavedLocation(
        user_id=user.id,
        name=loc_in.name,
        latitude=loc_in.latitude,
        longitude=loc_in.longitude,
        country=loc_in.country,
        admin1=loc_in.admin1,
        is_favorite=loc_in.is_favorite or False
    )
    db.add(new_loc)
    db.commit()
    db.refresh(new_loc)
    return new_loc

@router.delete("/saved/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_saved_location(
    location_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    loc = db.query(SavedLocation).filter(
        SavedLocation.id == location_id,
        SavedLocation.user_id == user.id
    ).first()
    if not loc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved location not found.")
    
    db.delete(loc)
    db.commit()
    return None
