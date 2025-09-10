from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta
from typing import Optional
import httpx
import json
from bson import ObjectId

from app.models.auth_models import (
    UserCreate, UserLogin, UserResponse, Token, GoogleAuthRequest,
    PasswordResetRequest, PasswordReset, ChangePassword
)
from app.services.auth_service import AuthService
from app.config.environment import get_settings

router = APIRouter(prefix="/auth", tags=["authentication"])
security = HTTPBearer()
settings = get_settings()

def get_auth_service() -> AuthService:
    return AuthService()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    auth_service: AuthService = Depends(get_auth_service)
) -> UserResponse:
    """Get current authenticated user from token."""
    token = credentials.credentials
    
    # Try session token first
    user = await auth_service.get_user_from_session(token)
    if user:
        user_dict = user.model_dump()
        user_dict['id'] = str(user.id)  # Use user.id directly instead of user_dict['id']
        return UserResponse.model_validate(user_dict)
    
    # Try JWT token
    payload = auth_service.verify_token(token)
    if not payload or "user_id" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = await auth_service.get_user_by_id(ObjectId(payload["user_id"]))
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_dict = user.model_dump()
    user_dict['id'] = str(user.id)  # Use user.id directly instead of user_dict['id']
    return UserResponse.model_validate(user_dict)

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new user."""
    # Check if user already exists
    existing_user = await auth_service.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = await auth_service.create_user(
        email=user_data.email,
        full_name=user_data.full_name,
        password=user_data.password
    )
    
    user_dict = user.model_dump()
    user_dict['id'] = str(user.id)  # Use user.id directly instead of user_dict['id']
    return UserResponse.model_validate(user_dict)

@router.post("/login", response_model=Token)
async def login(
    login_data: UserLogin,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Authenticate user and return access token."""
    user = await auth_service.authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    # Create session token
    session_token = await auth_service.create_user_session(user.id)
    
    # Create JWT token for API access
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = auth_service.create_access_token(
        data={"user_id": str(user.id), "email": user.email},
        expires_delta=access_token_expires
    )
    
    # Convert ObjectId to string for UserResponse
    user_data = user.model_dump()
    user_data['id'] = str(user_data['id'])
    
    return Token(
        access_token=session_token,  # Return session token for frontend
        token_type="bearer",
        expires_in=settings.session_token_expire_days * 24 * 60 * 60,  # Convert days to seconds
        user=UserResponse.model_validate(user_data)
    )

@router.post("/google", response_model=Token)
async def google_auth(
    google_data: GoogleAuthRequest,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Authenticate user with Google OAuth using ID token."""
    try:
        # Verify Google ID token
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={google_data.google_token}"
            )
            
        if response.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Google token"
            )
        
        google_user_data = response.json()
        google_id = google_user_data.get("sub")  # 'sub' is the user ID in ID tokens
        email = google_user_data.get("email")
        full_name = google_user_data.get("name", "")
        avatar_url = google_user_data.get("picture")
        
        # Verify the token was issued for our application
        if google_user_data.get("aud") != settings.google_client_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token audience"
            )
        
        if not google_id or not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Google user data"
            )
        
        # Check if user exists
        user = await auth_service.get_user_by_google_id(google_id)
        if not user:
            # Check if user exists with same email
            user = await auth_service.get_user_by_email(email)
            if user:
                # Link Google account to existing user
                user.google_id = google_id
                user.avatar_url = avatar_url
                await user.save()
            else:
                # Create new user
                user = await auth_service.create_user(
                    email=email,
                    full_name=full_name,
                    google_id=google_id,
                    avatar_url=avatar_url
                )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive user"
            )
        
        # Create session token
        session_token = await auth_service.create_user_session(user.id)
        
        # Create JWT token for API access
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = auth_service.create_access_token(
            data={"user_id": str(user.id), "email": user.email},
            expires_delta=access_token_expires
        )
        
        # Convert ObjectId to string for UserResponse
        user_data = user.model_dump()
        user_data['id'] = str(user_data['id'])
        
        return Token(
            access_token=session_token,
            token_type="bearer",
            expires_in=settings.session_token_expire_days * 24 * 60 * 60,  # Convert days to seconds
            user=UserResponse.model_validate(user_data)
        )
        
    except httpx.RequestError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error verifying Google token"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication error: {str(e)}"
        )

@router.post("/logout")
async def logout(
    current_user: UserResponse = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Logout user and revoke all sessions."""
    await auth_service.revoke_all_user_sessions(ObjectId(current_user.id))
    return {"message": "Successfully logged out"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserResponse = Depends(get_current_user)
):
    """Get current user information."""
    return current_user

@router.post("/refresh", response_model=Token)
async def refresh_token(
    current_user: UserResponse = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Refresh access token."""
    # Create new session token
    session_token = await auth_service.create_user_session(ObjectId(current_user.id))
    
    # Create new JWT token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = auth_service.create_access_token(
        data={"user_id": str(current_user.id), "email": current_user.email},
        expires_delta=access_token_expires
    )
    
    return Token(
        access_token=session_token,
        token_type="bearer",
        expires_in=settings.session_token_expire_days * 24 * 60 * 60,  # Convert days to seconds
        user=current_user
    )

@router.post("/change-password")
async def change_password(
    password_data: ChangePassword,
    current_user: UserResponse = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Change user password."""
    user = await auth_service.get_user_by_id(ObjectId(current_user.id))
    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found or no password set"
        )
    
    # Verify current password
    if not auth_service.verify_password(password_data.current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )
    
    # Update password
    user.hashed_password = auth_service.get_password_hash(password_data.new_password)
    await user.save()
    
    return {"message": "Password changed successfully"}

@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "authentication"}
