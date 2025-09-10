import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from passlib.context import CryptContext
from jose import JWTError, jwt
from bson import ObjectId
from app.models.user import User, UserSession
from app.config.environment import get_settings

settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = settings.secret_key or "your-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = settings.access_token_expire_minutes

class AuthService:
    def __init__(self):
        pass
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash a password."""
        return pwd_context.hash(password)
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create a JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify and decode a JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError:
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return await User.find_one(User.email == email)
    
    async def get_user_by_id(self, user_id: ObjectId) -> Optional[User]:
        """Get user by ID."""
        return await User.get(user_id)
    
    async def get_user_by_google_id(self, google_id: str) -> Optional[User]:
        """Get user by Google ID."""
        return await User.find_one(User.google_id == google_id)
    
    async def create_user(self, email: str, full_name: str, password: Optional[str] = None, 
                   google_id: Optional[str] = None, avatar_url: Optional[str] = None) -> User:
        """Create a new user."""
        hashed_password = None
        if password:
            hashed_password = self.get_password_hash(password)
        
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hashed_password,
            google_id=google_id,
            avatar_url=avatar_url,
            is_verified=google_id is not None  # Google users are pre-verified
        )
        
        await user.insert()
        return user
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate a user with email and password."""
        user = await self.get_user_by_email(email)
        if not user or not user.hashed_password:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    async def create_user_session(self, user_id: ObjectId) -> str:
        """Create a new user session and return the token."""
        # Generate a random token
        token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        # Set expiration time from environment
        expires_at = datetime.utcnow() + timedelta(days=settings.session_token_expire_days)
        
        # Create session record
        session = UserSession(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at
        )
        
        await session.insert()
        return token
    
    async def get_user_from_session(self, token: str) -> Optional[User]:
        """Get user from session token."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        session = await UserSession.find_one(
            UserSession.token_hash == token_hash,
            UserSession.is_active == True,
            UserSession.expires_at > datetime.utcnow()
        )
        
        if not session:
            return None
        
        return await self.get_user_by_id(session.user_id)
    
    async def revoke_session(self, token: str) -> bool:
        """Revoke a user session."""
        token_hash = hashlib.sha256(token.encode()).hexdigest()
        
        session = await UserSession.find_one(UserSession.token_hash == token_hash)
        
        if session:
            session.is_active = False
            await session.save()
            return True
        
        return False
    
    async def revoke_all_user_sessions(self, user_id: ObjectId) -> int:
        """Revoke all sessions for a user."""
        sessions = await UserSession.find(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).to_list()
        
        for session in sessions:
            session.is_active = False
            await session.save()
        
        return len(sessions)
