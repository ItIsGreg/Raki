from beanie import Indexed
from pydantic import BaseModel, Field, ConfigDict, field_validator, field_serializer
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from bson import ObjectId
from .base import MongoDocument, MongoBaseModel

# User Storage Models
class UserStorage(MongoDocument):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    userId: ObjectId
    storageName: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    
    @field_serializer('userId')
    def serialize_userId(self, userId: ObjectId) -> str:
        return str(userId)
    
    class Settings:
        name = "user_storages"
        indexes = [
            "userId",
            "storageName",
        ]

class UserStorageCreate(BaseModel):
    storageName: str

class UserStorageUpdate(BaseModel):
    storageName: Optional[str] = None

class UserStorageResponse(MongoBaseModel):
    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)
    
    id: str
    userId: str
    storageName: str
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    
    @classmethod
    def from_document(cls, doc: UserStorage):
        return cls(
            id=str(doc.id),
            userId=str(doc.userId),
            storageName=doc.storageName,
            createdAt=doc.createdAt,
            updatedAt=doc.updatedAt
        )

# Base model for all data entities
class BaseDataModel(MongoDocument):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    
    userId: ObjectId
    storageId: ObjectId
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: Optional[datetime] = None
    
    @field_serializer('userId')
    def serialize_userId(self, userId: ObjectId) -> str:
        return str(userId)
    
    @field_serializer('storageId')
    def serialize_storageId(self, storageId: ObjectId) -> str:
        return str(storageId)
    
    class Settings:
        abstract = True
        indexes = [
            "userId",
            "storageId",
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
            "userId",
            "storageId",
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
            "userId",
            "storageId",
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
    datasetId: ObjectId
    filename: str
    text: str
    
    class Settings:
        name = "texts"
        indexes = [
            "userId",
            "storageId",
            "datasetId",
        ]

class TextCreate(BaseModel):
    datasetId: str
    filename: str
    text: str

class TextUpdate(BaseModel):
    filename: Optional[str] = None
    text: Optional[str] = None
    datasetId: Optional[str] = None

# Annotated Dataset Models
class AnnotatedDataset(BaseDataModel):
    name: str
    description: str
    datasetId: ObjectId
    profileId: ObjectId
    mode: str
    
    @field_serializer('datasetId')
    def serialize_datasetId(self, datasetId: ObjectId) -> str:
        return str(datasetId)
    
    @field_serializer('profileId')
    def serialize_profileId(self, profileId: ObjectId) -> str:
        return str(profileId)
    
    class Settings:
        name = "annotated_datasets"
        indexes = [
            "userId",
            "storageId",
            "datasetId",
            "profileId",
        ]

# Annotated Text Models
class AnnotatedText(BaseDataModel):
    textId: ObjectId
    annotatedDatasetId: ObjectId
    verified: Optional[bool] = None
    aiFaulty: Optional[bool] = None
    
    @field_serializer('textId')
    def serialize_textId(self, textId: ObjectId) -> str:
        return str(textId)
    
    @field_serializer('annotatedDatasetId')
    def serialize_annotatedDatasetId(self, annotatedDatasetId: ObjectId) -> str:
        return str(annotatedDatasetId)
    
    class Settings:
        name = "annotated_texts"
        indexes = [
            "userId",
            "storageId",
            "textId",
            "annotatedDatasetId",
        ]

class AnnotatedDatasetCreate(BaseModel):
    name: str
    description: str
    datasetId: str
    profileId: str
    mode: str

class AnnotatedDatasetUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    datasetId: Optional[str] = None
    profileId: Optional[str] = None
    mode: Optional[str] = None

class AnnotatedTextCreate(BaseModel):
    textId: str
    annotatedDatasetId: str
    verified: Optional[bool] = None
    aiFaulty: Optional[bool] = None

class AnnotatedTextUpdate(BaseModel):
    textId: Optional[str] = None
    annotatedDatasetId: Optional[str] = None
    verified: Optional[bool] = None
    aiFaulty: Optional[bool] = None

# Data Point Models
class DataPoint(BaseDataModel):
    annotatedTextId: ObjectId
    name: str
    value: Optional[Union[str, int, float]] = None
    match: Optional[List[int]] = None
    profilePointId: Optional[ObjectId] = None
    verified: Optional[bool] = None
    
    @field_serializer('annotatedTextId')
    def serialize_annotatedTextId(self, annotatedTextId: ObjectId) -> str:
        return str(annotatedTextId)
    
    @field_serializer('profilePointId')
    def serialize_profilePointId(self, profilePointId: Optional[ObjectId]) -> Optional[str]:
        return str(profilePointId) if profilePointId else None
    
    class Settings:
        name = "data_points"
        indexes = [
            "userId",
            "storageId",
            "annotatedTextId",
        ]

class DataPointCreate(BaseModel):
    annotatedTextId: str
    name: str
    value: Optional[Union[str, int, float]] = None
    match: Optional[List[int]] = None
    profilePointId: Optional[str] = None
    verified: Optional[bool] = None

class DataPointUpdate(BaseModel):
    name: Optional[str] = None
    value: Optional[Union[str, int, float]] = None
    match: Optional[List[int]] = None
    profilePointId: Optional[str] = None
    verified: Optional[bool] = None

# Segment Data Point Models
class SegmentDataPoint(BaseDataModel):
    annotatedTextId: ObjectId
    name: str
    beginMatch: Optional[List[int]] = None
    endMatch: Optional[List[int]] = None
    profilePointId: Optional[ObjectId] = None
    verified: Optional[bool] = None
    
    @field_serializer('annotatedTextId')
    def serialize_annotatedTextId(self, annotatedTextId: ObjectId) -> str:
        return str(annotatedTextId)
    
    @field_serializer('profilePointId')
    def serialize_profilePointId(self, profilePointId: Optional[ObjectId]) -> Optional[str]:
        return str(profilePointId) if profilePointId else None
    
    class Settings:
        name = "segment_data_points"
        indexes = [
            "userId",
            "storageId",
            "annotatedTextId",
        ]

class SegmentDataPointCreate(BaseModel):
    annotatedTextId: str
    name: str
    beginMatch: Optional[List[int]] = None
    endMatch: Optional[List[int]] = None
    profilePointId: Optional[str] = None
    verified: Optional[bool] = None

class SegmentDataPointUpdate(BaseModel):
    name: Optional[str] = None
    beginMatch: Optional[List[int]] = None
    endMatch: Optional[List[int]] = None
    profilePointId: Optional[str] = None
    verified: Optional[bool] = None

# Profile Point Models
class ProfilePoint(BaseDataModel):
    name: str
    explanation: str
    synonyms: List[str] = []
    datatype: str
    valueset: Optional[List[str]] = None
    unit: Optional[str] = None
    profileId: ObjectId
    order: Optional[int] = None
    previousPointId: Optional[ObjectId] = None
    nextPointId: Optional[ObjectId] = None
    
    @field_serializer('profileId')
    def serialize_profileId(self, profileId: ObjectId) -> str:
        return str(profileId)
    
    @field_serializer('previousPointId')
    def serialize_previousPointId(self, previousPointId: Optional[ObjectId]) -> Optional[str]:
        return str(previousPointId) if previousPointId else None
    
    @field_serializer('nextPointId')
    def serialize_nextPointId(self, nextPointId: Optional[ObjectId]) -> Optional[str]:
        return str(nextPointId) if nextPointId else None
    
    class Settings:
        name = "profile_points"
        indexes = [
            "userId",
            "storageId",
            "profileId",
        ]

class ProfilePointCreate(BaseModel):
    name: str
    explanation: str
    synonyms: List[str] = []
    datatype: str
    valueset: Optional[List[str]] = None
    unit: Optional[str] = None
    profileId: str
    order: Optional[int] = None
    previousPointId: Optional[str] = None
    nextPointId: Optional[str] = None

class ProfilePointUpdate(BaseModel):
    name: Optional[str] = None
    explanation: Optional[str] = None
    synonyms: Optional[List[str]] = None
    datatype: Optional[str] = None
    valueset: Optional[List[str]] = None
    unit: Optional[str] = None
    profileId: Optional[str] = None
    order: Optional[int] = None
    previousPointId: Optional[str] = None
    nextPointId: Optional[str] = None


# Segmentation Profile Point Models
class SegmentationProfilePoint(BaseDataModel):
    name: str
    explanation: str
    synonyms: List[str] = []
    profileId: ObjectId
    order: Optional[int] = None
    previousPointId: Optional[ObjectId] = None
    nextPointId: Optional[ObjectId] = None
    
    @field_serializer('profileId')
    def serialize_profileId(self, profileId: ObjectId) -> str:
        return str(profileId)
    
    @field_serializer('previousPointId')
    def serialize_previousPointId(self, previousPointId: Optional[ObjectId]) -> Optional[str]:
        return str(previousPointId) if previousPointId else None
    
    @field_serializer('nextPointId')
    def serialize_nextPointId(self, nextPointId: Optional[ObjectId]) -> Optional[str]:
        return str(nextPointId) if nextPointId else None
    
    class Settings:
        name = "segmentation_profile_points"
        indexes = [
            "userId",
            "storageId",
            "profileId",
        ]

class SegmentationProfilePointCreate(BaseModel):
    name: str
    explanation: str
    synonyms: List[str] = []
    profileId: str
    order: Optional[int] = None
    previousPointId: Optional[str] = None
    nextPointId: Optional[str] = None

class SegmentationProfilePointUpdate(BaseModel):
    name: Optional[str] = None
    explanation: Optional[str] = None
    synonyms: Optional[List[str]] = None
    profileId: Optional[str] = None
    order: Optional[int] = None
    previousPointId: Optional[str] = None
    nextPointId: Optional[str] = None

# Settings Models
class ApiKey(BaseDataModel):
    key: str
    
    class Settings:
        name = "api_keys"
        indexes = [
            "userId",
            "storageId",
        ]

class Model(BaseDataModel):
    name: str
    
    class Settings:
        name = "models"
        indexes = [
            "userId",
            "storageId",
        ]

class LLMProvider(BaseDataModel):
    provider: str
    
    class Settings:
        name = "llm_providers"
        indexes = [
            "userId",
            "storageId",
        ]

class LLMUrl(BaseDataModel):
    url: str
    
    class Settings:
        name = "llm_urls"
        indexes = [
            "userId",
            "storageId",
        ]

class BatchSize(BaseDataModel):
    value: int
    
    class Settings:
        name = "batch_sizes"
        indexes = [
            "userId",
            "storageId",
        ]

class MaxTokens(BaseDataModel):
    value: Optional[int] = None
    
    class Settings:
        name = "max_tokens"
        indexes = [
            "userId",
            "storageId",
        ]

class UserSettings(BaseDataModel):
    tutorialCompleted: bool = False
    
    class Settings:
        name = "user_settings"
        indexes = [
            "userId",
            "storageId",
        ]

# Settings Create/Update Models
class ApiKeyCreate(BaseModel):
    key: str

class ApiKeyUpdate(BaseModel):
    key: Optional[str] = None

class ModelCreate(BaseModel):
    name: str

class ModelUpdate(BaseModel):
    name: Optional[str] = None

class LLMProviderCreate(BaseModel):
    provider: str

class LLMProviderUpdate(BaseModel):
    provider: Optional[str] = None

class LLMUrlCreate(BaseModel):
    url: str

class LLMUrlUpdate(BaseModel):
    url: Optional[str] = None

class BatchSizeCreate(BaseModel):
    value: int

class BatchSizeUpdate(BaseModel):
    value: Optional[int] = None

class MaxTokensCreate(BaseModel):
    value: Optional[int] = None

class MaxTokensUpdate(BaseModel):
    value: Optional[int] = None

class UserSettingsCreate(BaseModel):
    tutorialCompleted: bool = False

class UserSettingsUpdate(BaseModel):
    tutorialCompleted: Optional[bool] = None

# Migration and Export Models
class MigrateLocalToCloudRequest(BaseModel):
    storageName: str
    profiles: List[Dict[str, Any]] = []
    datasets: List[Dict[str, Any]] = []
    texts: List[Dict[str, Any]] = []
    annotatedDatasets: List[Dict[str, Any]] = []
    annotatedTexts: List[Dict[str, Any]] = []
    dataPoints: List[Dict[str, Any]] = []
    segmentDataPoints: List[Dict[str, Any]] = []
    profilePoints: List[Dict[str, Any]] = []
    segmentationProfilePoints: List[Dict[str, Any]] = []
    apiKeys: List[Dict[str, Any]] = []
    models: List[Dict[str, Any]] = []
    llmProviders: List[Dict[str, Any]] = []
    llmUrls: List[Dict[str, Any]] = []
    batchSizes: List[Dict[str, Any]] = []
    maxTokens: List[Dict[str, Any]] = []
    userSettings: List[Dict[str, Any]] = []

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
