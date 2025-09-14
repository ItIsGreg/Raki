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
    
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    @property
    def id(self) -> str:
        """Return the MongoDB _id as a string 'id' field"""
        return str(self._id)
    
    def dict(self, **kwargs):
        """Override dict to include id field in API responses"""
        data = super().dict(**kwargs)
        data['id'] = self.id
        return data
    
    def model_dump(self, **kwargs):
        """Override model_dump to include id field in API responses"""
        data = super().model_dump(**kwargs)
        data['id'] = self.id
        return data
    
    class Settings:
        # This ensures the computed 'id' field is not saved to MongoDB
        # It's only available in Python/API responses
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
