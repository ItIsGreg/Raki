from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

# Base schemas
class ProfileBase(BaseModel):
    name: str
    description: Optional[str] = None
    mode: str  # TaskMode
    example: Optional[Dict[str, Any]] = None

class ProfileCreate(ProfileBase):
    pass

class Profile(ProfileBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# Profile Point schemas
class ProfilePointBase(BaseModel):
    name: str
    explanation: Optional[str] = None
    synonyms: List[str] = []
    datatype: str
    valueset: Optional[List[str]] = None
    unit: Optional[str] = None
    order: int = 0
    previous_point_id: Optional[uuid.UUID] = None
    next_point_id: Optional[uuid.UUID] = None

class ProfilePointCreate(ProfilePointBase):
    profile_id: uuid.UUID

class ProfilePoint(ProfilePointBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    profile_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# Segmentation Profile Point schemas
class SegmentationProfilePointBase(BaseModel):
    name: str
    explanation: Optional[str] = None
    synonyms: List[str] = []
    order: int = 0
    previous_point_id: Optional[uuid.UUID] = None
    next_point_id: Optional[uuid.UUID] = None

class SegmentationProfilePointCreate(SegmentationProfilePointBase):
    profile_id: uuid.UUID

class SegmentationProfilePoint(SegmentationProfilePointBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    profile_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# Dataset schemas
class DatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    mode: str  # TaskMode

class DatasetCreate(DatasetBase):
    pass

class Dataset(DatasetBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# Text schemas
class TextBase(BaseModel):
    filename: str
    text: str

class TextCreate(TextBase):
    dataset_id: uuid.UUID

class Text(TextBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    dataset_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# Annotated Dataset schemas
class AnnotatedDatasetBase(BaseModel):
    name: str
    description: Optional[str] = None
    mode: str  # TaskMode

class AnnotatedDatasetCreate(AnnotatedDatasetBase):
    dataset_id: uuid.UUID
    profile_id: uuid.UUID

class AnnotatedDataset(AnnotatedDatasetBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    user_id: uuid.UUID
    dataset_id: uuid.UUID
    profile_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# Annotated Text schemas
class AnnotatedTextBase(BaseModel):
    verified: Optional[bool] = None
    ai_faulty: Optional[bool] = None

class AnnotatedTextCreate(AnnotatedTextBase):
    text_id: uuid.UUID
    annotated_dataset_id: uuid.UUID

class AnnotatedText(AnnotatedTextBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    text_id: uuid.UUID
    annotated_dataset_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# Data Point schemas
class DataPointBase(BaseModel):
    name: str
    value: Optional[str] = None
    match: Optional[List[int]] = None
    verified: Optional[bool] = None

class DataPointCreate(DataPointBase):
    annotated_text_id: uuid.UUID
    profile_point_id: Optional[uuid.UUID] = None

class DataPoint(DataPointBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    annotated_text_id: uuid.UUID
    profile_point_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

# Segment Data Point schemas
class SegmentDataPointBase(BaseModel):
    name: str
    begin_match: Optional[List[int]] = None
    end_match: Optional[List[int]] = None
    verified: Optional[bool] = None

class SegmentDataPointCreate(SegmentDataPointBase):
    annotated_text_id: uuid.UUID
    profile_point_id: Optional[uuid.UUID] = None

class SegmentDataPoint(SegmentDataPointBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    annotated_text_id: uuid.UUID
    profile_point_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

# User Settings schemas
class UserSettingsBase(BaseModel):
    tutorial_completed: bool = False

class UserSettingsCreate(UserSettingsBase):
    pass

class UserSettings(UserSettingsBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

# LLM Config schemas
class UserLLMConfigBase(BaseModel):
    api_key: Optional[str] = None
    llm_provider: Optional[str] = None
    llm_model: Optional[str] = None
    llm_url: Optional[str] = None
    batch_size: int = 10
    max_tokens: Optional[int] = None

class UserLLMConfigCreate(UserLLMConfigBase):
    pass

class UserLLMConfig(UserLLMConfigBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime 