"""
Base models for MongoDB with automatic _id to id mapping
This provides a clean way to expose 'id' instead of '_id' in API responses
"""

from beanie import Document
from pydantic import BaseModel, Field, ConfigDict, field_serializer
from typing import Optional
from bson import ObjectId

class MongoDocument(Document):
    """
    Base MongoDB document that automatically maps _id to id
    This provides a clean API where all documents have an 'id' field
    instead of the MongoDB-specific '_id' field
    """
    
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    def model_dump(self, **kwargs):
        """Override model_dump to convert _id to id"""
        data = super().model_dump(**kwargs)
        # Convert _id to id for API responses
        if '_id' in data:
            data['id'] = str(data.pop('_id'))
            print(f"DEBUG: model_dump called, converted _id to id: {data.get('id')}")
        return data
    
    def dict(self, **kwargs):
        """Override dict to convert _id to id"""
        data = super().dict(**kwargs)
        # Convert _id to id for API responses
        if '_id' in data:
            data['id'] = str(data.pop('_id'))
            print(f"DEBUG: dict called, converted _id to id: {data.get('id')}")
        return data
    
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
