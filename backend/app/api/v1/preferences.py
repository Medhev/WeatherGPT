from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserPreference
from app.schemas.preferences import UserPreferencesSchema, UserPreferencesUpdate
from app.services.auth.deps import get_current_user

router = APIRouter(prefix="/preferences", tags=["Preferences"])

@router.get("", response_model=UserPreferencesSchema)
def get_preferences(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not pref:
        pref = UserPreference(user_id=user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return pref

@router.put("", response_model=UserPreferencesSchema)
def update_preferences(
    pref_in: UserPreferencesUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == user.id).first()
    if not pref:
        pref = UserPreference(user_id=user.id)
        db.add(pref)

    if pref_in.temp_unit is not None:
        pref.temp_unit = pref_in.temp_unit
    if pref_in.wind_speed_unit is not None:
        pref.wind_speed_unit = pref_in.wind_speed_unit
    if pref_in.language is not None:
        pref.language = pref_in.language
    if pref_in.theme is not None:
        pref.theme = pref_in.theme
    if pref_in.notifications_enabled is not None:
        pref.notifications_enabled = pref_in.notifications_enabled

    db.commit()
    db.refresh(pref)
    return pref
