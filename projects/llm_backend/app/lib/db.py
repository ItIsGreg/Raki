from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config.environment import get_settings
from app.models.user import User, UserSession
from app.models.user_data_models import (
    UserStorage, Profile, Dataset
)
import asyncio

settings = get_settings()

# MongoDB connection
client = None
database = None

async def init_db():
    """Initialize MongoDB connection and Beanie."""
    global client, database
    
    # MongoDB URL
    DATABASE_URL = settings.database_url or "mongodb://localhost:27017"
    
    # Create MongoDB client
    client = AsyncIOMotorClient(DATABASE_URL)
    database = client.raki_db
    
    # Initialize Beanie with document models
    await init_beanie(
        database=database,
        document_models=[
            User, UserSession, UserStorage, Profile, Dataset
        ]
    )
    
    print("✅ MongoDB connection initialized")

async def close_db():
    """Close MongoDB connection."""
    global client
    if client:
        client.close()
        print("✅ MongoDB connection closed")

def get_database():
    """Get database instance."""
    return database
