from beanie import Indexed
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from bson import ObjectId
from .base import MongoDocument, MongoBaseModel

# User Storage Models
class UserStorage(MongoDocument):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    storage_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        name = "user_storages"
        indexes = [
            "user_id",
            "storage_name",
        ]

class UserStorageCreate(BaseModel):
    storage_name: str

class UserStorageUpdate(BaseModel):
    storage_name: Optional[str] = None

class UserStorageResponse(MongoBaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)
    
    id: str
    user_id: str
    storage_name: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @classmethod
    def from_document(cls, doc: UserStorage):
        return cls(
            id=str(doc.id),
            user_id=str(doc.user_id),
            storage_name=doc.storage_name,
            created_at=doc.created_at,
            updated_at=doc.updated_at
        )

# Base model for all data entities
class BaseDataModel(Document):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    storage_id: ObjectId
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    class Settings:
        abstract = True
        indexes = [
            "user_id",
            "storage_id",
        ]

# Profile Models
class Profile(BaseDataModel):
    name: str
    description: str
    mode: str  # 'datapoint_extraction' or 'text_segmentation'
    example: Optional[Dict[str, Any]] = None
    
    class Settings:
        name = "profiles"
        indexes = [
            "user_id",
            "storage_id",
            "name",
        ]

class ProfileCreate(BaseModel):
    name: str
    description: str
    mode: str
    example: Optional[Dict[str, Any]] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mode: Optional[str] = None
    example: Optional[Dict[str, Any]] = None

# Dataset Models
class Dataset(BaseDataModel):
    name: str
    description: str
    mode: str  # 'datapoint_extraction' or 'text_segmentation'
    
    class Settings:
        name = "datasets"
        indexes = [
            "user_id",
            "storage_id",
            "name",
        ]

class DatasetCreate(BaseModel):
    name: str
    description: str
    mode: str

class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mode: Optional[str] = None

# Migration and Export Models
class MigrateLocalToCloudRequest(BaseModel):
    storage_name: str
    profiles: List[Dict[str, Any]] = []
    datasets: List[Dict[str, Any]] = []
    texts: List[Dict[str, Any]] = []
    annotated_datasets: List[Dict[str, Any]] = []
    annotated_texts: List[Dict[str, Any]] = []
    data_points: List[Dict[str, Any]] = []
    segment_data_points: List[Dict[str, Any]] = []
    profile_points: List[Dict[str, Any]] = []
    segmentation_profile_points: List[Dict[str, Any]] = []
    api_keys: List[Dict[str, Any]] = []
    models: List[Dict[str, Any]] = []
    llm_providers: List[Dict[str, Any]] = []
    llm_urls: List[Dict[str, Any]] = []
    batch_sizes: List[Dict[str, Any]] = []
    max_tokens: List[Dict[str, Any]] = []
    user_settings: List[Dict[str, Any]] = []

class StorageDataExport(BaseModel):
    profiles: List[Dict[str, Any]] = []
    datasets: List[Dict[str, Any]] = []
    texts: List[Dict[str, Any]] = []
    annotated_datasets: List[Dict[str, Any]] = []
    annotated_texts: List[Dict[str, Any]] = []
    data_points: List[Dict[str, Any]] = []
    segment_data_points: List[Dict[str, Any]] = []
    profile_points: List[Dict[str, Any]] = []
    segmentation_profile_points: List[Dict[str, Any]] = []
    api_keys: List[Dict[str, Any]] = []
    models: List[Dict[str, Any]] = []
    llm_providers: List[Dict[str, Any]] = []
    llm_urls: List[Dict[str, Any]] = []
    batch_sizes: List[Dict[str, Any]] = []
    max_tokens: List[Dict[str, Any]] = []
    user_settings: List[Dict[str, Any]] = []
