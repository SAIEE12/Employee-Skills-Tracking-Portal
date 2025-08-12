from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ...db.session import get_db
from ...core.security import authenticate_user, create_access_token
from ...schemas.auth import UserLogin, UserRegister, Token, UserResponse, LoginResponse
from ...db import crud
from ...utils.email import send_welcome_email
from ...api.dependencies import get_current_user_dependency

router = APIRouter(prefix="/auth", tags=["authentication"])

# @router.post("/login", response_model=Token)
# def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
#     """Login user and return access token."""
#     user = authenticate_user(db, user_credentials.email, user_credentials.password)
#     if not user:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Incorrect email or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )
    # 
    # access_token = create_access_token(data={"sub": user.id})
    # return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=LoginResponse)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.model_validate(user)
    }


@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user."""
    # Check if user already exists
    existing_user = crud.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate role
    valid_roles = ["employee", "trainer", "manager", "super-user"]
    if user_data.role not in valid_roles:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid role. Must be one of: {valid_roles}"
        )
    
    # Create user
    db_user = crud.create_user(
        db=db,
        email=user_data.email,
        name=user_data.name,
        password=user_data.password,
        role=user_data.role,
        avatar=user_data.avatar,
        department=user_data.department,
        experience=user_data.experience
    )
    
    # Send welcome email
    send_welcome_email(user_data.email, user_data.name)
    
    return UserResponse.model_validate(db_user)

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: UserResponse = Depends(get_current_user_dependency)):
    """Get current user information."""
    return current_user 