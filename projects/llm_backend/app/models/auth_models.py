from pydantic import BaseModel, EmailStr, field_validator, ConfigDict
from typing import Optional, Union
from datetime import datetime
from bson import ObjectId
from .base import MongoBaseModel

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class UserResponse(MongoBaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)
    
    id: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    avatar_url: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None

class GoogleAuthRequest(BaseModel):
    google_token: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordReset(BaseModel):
    token: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class ChangePassword(BaseModel):
    current_password: str
    new_password: str
    
    @field_validator('new_password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

