"""
Base models for MongoDB with automatic _id to id mapping
This provides a clean way to expose 'id' instead of '_id' in API responses
"""

from beanie import Document
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from bson import ObjectId

class MongoDocument(Document):
    """
    Base MongoDB document that automatically maps _id to id
    This provides a clean API where all documents have an 'id' field
    instead of the MongoDB-specific '_id' field
    """
    
    # Define id field that maps to MongoDB's _id
    id: ObjectId = Field(default_factory=ObjectId, alias="_id", serialization_alias="id")
    
    class Config:
        # Makes FastAPI/Pydantic output "id" instead of "_id"
        allow_population_by_field_name = True
        json_encoders = {ObjectId: str}
        arbitrary_types_allowed = True
    
    class Settings:
        use_revision = False

class MongoBaseModel(BaseModel):
    """
    Base Pydantic model for API requests/responses
    Provides consistent field mapping and validation
    """
    
    model_config = ConfigDict(
        arbitrary_types_allowed=True,
        populate_by_name=True
    )
