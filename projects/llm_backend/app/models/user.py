from beanie import Indexed
from pydantic import Field, EmailStr, ConfigDict
from datetime import datetime
from typing import Optional
from bson import ObjectId
from .base import MongoDocument

class User(MongoDocument):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    email: Indexed(EmailStr, unique=True)
    full_name: str
    hashed_password: Optional[str] = None  # None for OAuth users
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    # OAuth fields
    google_id: Optional[str] = None
    avatar_url: Optional[str] = None
    
    class Settings:
        name = "users"
        indexes = [
            "email",
            "google_id",
        ]
    
    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', full_name='{self.full_name}')>"

class UserSession(MongoDocument):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    token_hash: Indexed(str, unique=True)
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    class Settings:
        name = "user_sessions"
        indexes = [
            "user_id",
            "token_hash",
            "expires_at",
        ]
    
    def __repr__(self):
        return f"<UserSession(id={self.id}, user_id={self.user_id}, expires_at='{self.expires_at}')>"
