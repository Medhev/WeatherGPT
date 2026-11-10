from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserPreference
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, TokenResponse, UserResponse
from app.services.auth.jwt import hash_password, verify_password, create_access_token
from app.services.auth.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    # Check existing email
    if db.query(User).filter(User.email == req.email.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )
    
    # Check existing username
    if db.query(User).filter(User.username == req.username.lower()).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username is already taken. Please choose another username."
        )

    # Create new user
    new_user = User(
        email=req.email.lower(),
        username=req.username.lower(),
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
        is_active=True,
        is_admin=False
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize default user preferences
    pref = UserPreference(user_id=new_user.id)
    db.add(pref)
    db.commit()

    token = create_access_token({"sub": str(new_user.id), "username": new_user.username})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_minutes=1440,
        user=UserResponse.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    ident = req.username_or_email.lower().strip()
    user = db.query(User).filter(
        (User.email == ident) | (User.username == ident)
    ).first()

    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated."
        )

    token = create_access_token({"sub": str(user.id), "username": user.username})

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        expires_in_minutes=1440,
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(user: User = Depends(get_current_user)):
    return UserResponse.model_validate(user)
