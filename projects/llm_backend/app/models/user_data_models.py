from beanie import Document, Indexed
from pydantic import BaseModel, Field, ConfigDict, field_validator, field_serializer
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from bson import ObjectId

# User Storage Models
class UserStorage(Document):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    user_id: ObjectId
    storage_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None
    
    @field_serializer('user_id')
    def serialize_user_id(self, user_id: ObjectId) -> str:
        return str(user_id)
    
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

class UserStorageResponse(BaseModel):
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
    
    @field_serializer('user_id')
    def serialize_user_id(self, user_id: ObjectId) -> str:
        return str(user_id)
    
    @field_serializer('storage_id')
    def serialize_storage_id(self, storage_id: ObjectId) -> str:
        return str(storage_id)
    
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

# Text Models
class Text(BaseDataModel):
    dataset_id: ObjectId
    filename: str
    text: str
    
    class Settings:
        name = "texts"
        indexes = [
            "user_id",
            "storage_id",
            "dataset_id",
        ]

# Annotated Dataset Models
class AnnotatedDataset(BaseDataModel):
    name: str
    description: str
    dataset_id: ObjectId
    profile_id: ObjectId
    mode: str
    
    class Settings:
        name = "annotated_datasets"
        indexes = [
            "user_id",
            "storage_id",
            "dataset_id",
            "profile_id",
        ]

# Annotated Text Models
class AnnotatedText(BaseDataModel):
    text_id: ObjectId
    annotated_dataset_id: ObjectId
    verified: Optional[bool] = None
    ai_faulty: Optional[bool] = None
    
    class Settings:
        name = "annotated_texts"
        indexes = [
            "user_id",
            "storage_id",
            "text_id",
            "annotated_dataset_id",
        ]

# Data Point Models
class DataPoint(BaseDataModel):
    annotated_text_id: ObjectId
    name: str
    value: Optional[Union[str, int, float]] = None
    match: Optional[List[int]] = None
    profile_point_id: Optional[ObjectId] = None
    verified: Optional[bool] = None
    
    class Settings:
        name = "data_points"
        indexes = [
            "user_id",
            "storage_id",
            "annotated_text_id",
        ]

class DataPointCreate(BaseModel):
    annotated_text_id: str
    name: str
    value: Optional[Union[str, int, float]] = None
    match: Optional[List[int]] = None
    profile_point_id: Optional[str] = None
    verified: Optional[bool] = None

class DataPointUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[Union[str, int, float]] = None
    match: Optional[List[int]] = None
    profile_point_id: Optional[str] = None
    verified: Optional[bool] = None

# Segment Data Point Models
class SegmentDataPoint(BaseDataModel):
    annotated_text_id: ObjectId
    name: str
    begin_match: Optional[List[int]] = None
    end_match: Optional[List[int]] = None
    profile_point_id: Optional[ObjectId] = None
    verified: Optional[bool] = None
    
    class Settings:
        name = "segment_data_points"
        indexes = [
            "user_id",
            "storage_id",
            "annotated_text_id",
        ]

class SegmentDataPointCreate(BaseModel):
    annotated_text_id: str
    name: str
    begin_match: Optional[List[int]] = None
    end_match: Optional[List[int]] = None
    profile_point_id: Optional[str] = None
    verified: Optional[bool] = None

class SegmentDataPointUpdate(BaseModel):
    name: Optional[str] = None
    begin_match: Optional[List[int]] = None
    end_match: Optional[List[int]] = None
    profile_point_id: Optional[str] = None
    verified: Optional[bool] = None

# Profile Point Models
class ProfilePoint(BaseDataModel):
    name: str
    explanation: str
    synonyms: List[str] = []
    datatype: str
    valueset: Optional[List[str]] = None
    unit: Optional[str] = None
    profile_id: ObjectId
    order: Optional[int] = None
    previous_point_id: Optional[ObjectId] = None
    next_point_id: Optional[ObjectId] = None
    
    class Settings:
        name = "profile_points"
        indexes = [
            "user_id",
            "storage_id",
            "profile_id",
        ]

class ProfilePointCreate(BaseModel):
    name: str
    explanation: str
    synonyms: List[str] = []
    datatype: str
    valueset: Optional[List[str]] = None
    unit: Optional[str] = None
    profile_id: str
    order: Optional[int] = None
    previous_point_id: Optional[str] = None
    next_point_id: Optional[str] = None

class ProfilePointUpdate(BaseModel):
    name: Optional[str] = None
    explanation: Optional[str] = None
    synonyms: Optional[List[str]] = None
    datatype: Optional[str] = None
    valueset: Optional[List[str]] = None
    unit: Optional[str] = None
    profile_id: Optional[str] = None
    order: Optional[int] = None
    previous_point_id: Optional[str] = None
    next_point_id: Optional[str] = None

# Segmentation Profile Point Models
class SegmentationProfilePoint(BaseDataModel):
    name: str
    explanation: str
    synonyms: List[str] = []
    profile_id: ObjectId
    order: Optional[int] = None
    previous_point_id: Optional[ObjectId] = None
    next_point_id: Optional[ObjectId] = None
    
    class Settings:
        name = "segmentation_profile_points"
        indexes = [
            "user_id",
            "storage_id",
            "profile_id",
        ]

class SegmentationProfilePointCreate(BaseModel):
    name: str
    explanation: str
    synonyms: List[str] = []
    profile_id: str
    order: Optional[int] = None
    previous_point_id: Optional[str] = None
    next_point_id: Optional[str] = None

class SegmentationProfilePointUpdate(BaseModel):
    name: Optional[str] = None
    explanation: Optional[str] = None
    synonyms: Optional[List[str]] = None
    profile_id: Optional[str] = None
    order: Optional[int] = None
    previous_point_id: Optional[str] = None
    next_point_id: Optional[str] = None

# Settings Models
class ApiKey(BaseDataModel):
    key: str
    
    class Settings:
        name = "api_keys"
        indexes = [
            "user_id",
            "storage_id",
        ]

class Model(BaseDataModel):
    name: str
    
    class Settings:
        name = "models"
        indexes = [
            "user_id",
            "storage_id",
        ]

class LLMProvider(BaseDataModel):
    provider: str
    
    class Settings:
        name = "llm_providers"
        indexes = [
            "user_id",
            "storage_id",
        ]

class LLMUrl(BaseDataModel):
    url: str
    
    class Settings:
        name = "llm_urls"
        indexes = [
            "user_id",
            "storage_id",
        ]

class BatchSize(BaseDataModel):
    value: int
    
    class Settings:
        name = "batch_sizes"
        indexes = [
            "user_id",
            "storage_id",
        ]

class MaxTokens(BaseDataModel):
    value: Optional[int] = None
    
    class Settings:
        name = "max_tokens"
        indexes = [
            "user_id",
            "storage_id",
        ]

class UserSettings(BaseDataModel):
    tutorial_completed: bool = False
    
    class Settings:
        name = "user_settings"
        indexes = [
            "user_id",
            "storage_id",
        ]

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
