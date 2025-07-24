from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import os
import re

from app.config.database import get_db
from app.models.auth_models import User
from app.models.auth_schemas import UserCreate, UserLogin, UserResponse, Token
from app.utils.auth import (
    get_password_hash, 
    verify_password, 
    create_access_token,
    get_current_active_user
)

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password
    )
    
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    return db_user

@router.post("/login", response_model=Token)
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    # Authenticate user
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": db_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.delete("/me")
def delete_current_user(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete the current authenticated user and all associated data.
    
    This will cascade delete:
    - All workspaces
    - All profiles and their points
    - All datasets and their texts
    - All annotated datasets and their annotations
    - User settings and LLM configs
    """
    user_email = current_user.email
    
    try:
        db.delete(current_user)
        db.commit()
        return {"message": f"User {user_email} and all associated data deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )

@router.delete("/test-cleanup/{user_email}")
def delete_test_user(
    user_email: str,
    db: Session = Depends(get_db),
    x_test_token: str = Header(None, alias="X-Test-Token")
):
    """Delete a test user and all associated data.
    
    SAFETY MEASURES:
    1. Only works in development environment
    2. Only accepts emails with test patterns
    3. Requires special test token header
    4. Multiple validation checks
    """
    
    # Safety Check 1: Environment restriction
    environment = os.getenv("ENVIRONMENT", "production").lower()
    if environment not in ["development", "test", "dev"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Test cleanup only available in development/test environments"
        )
    
    # Safety Check 2: Test token validation
    expected_token = os.getenv("TEST_CLEANUP_TOKEN", "test-cleanup-secret-2024")
    if not x_test_token or x_test_token != expected_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid or missing test token"
        )
    
    # Safety Check 3: Email pattern validation (must contain test/cypress/demo patterns)
    test_patterns = [
        r".*test.*",
        r".*cypress.*", 
        r".*demo.*",
        r".*staging.*",
        r".*dev.*",
        r".*temp.*"
    ]
    
    email_lower = user_email.lower()
    if not any(re.match(pattern, email_lower) for pattern in test_patterns):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only test/demo/dev email patterns are allowed for cleanup"
        )
    
    
    # Find and delete the test user
    db_user = db.query(User).filter(User.email == user_email).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Test user {user_email} not found"
        )
    
    try:
        db.delete(db_user)
        db.commit()
        return {
            "message": f"Test user {user_email} and all associated data deleted successfully",
            "environment": environment
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete test user: {str(e)}"
        )

@router.get("/protected")
def protected_route(current_user: User = Depends(get_current_active_user)):
    return {"message": f"Hello {current_user.email}, this is a protected route!"} 