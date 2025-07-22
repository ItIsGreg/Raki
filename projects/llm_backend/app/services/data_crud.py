from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from fastapi import HTTPException, status

from app.models.data_models import (
    Profile as ProfileModel,
    ProfilePoint as ProfilePointModel,
    SegmentationProfilePoint as SegmentationProfilePointModel,
    Dataset as DatasetModel,
    Text as TextModel,
    AnnotatedDataset as AnnotatedDatasetModel,
    AnnotatedText as AnnotatedTextModel,
    DataPoint as DataPointModel,
    SegmentDataPoint as SegmentDataPointModel,
    UserSettings as UserSettingsModel,
    UserLLMConfig as UserLLMConfigModel,
)
from app.models.data_schemas import (
    ProfileCreate, ProfilePointCreate, SegmentationProfilePointCreate,
    DatasetCreate, TextCreate, AnnotatedDatasetCreate, AnnotatedTextCreate,
    DataPointCreate, SegmentDataPointCreate, UserSettingsCreate, UserLLMConfigCreate,
)
from app.models.auth_models import User

# Profile CRUD
def create_profile(db: Session, profile: ProfileCreate, user_id: str) -> ProfileModel:
    db_profile = ProfileModel(**profile.model_dump(), user_id=user_id)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

def get_user_profiles(db: Session, user_id: str) -> List[ProfileModel]:
    return db.query(ProfileModel).filter(ProfileModel.user_id == user_id).all()

def get_profile(db: Session, profile_id: str, user_id: str) -> Optional[ProfileModel]:
    return db.query(ProfileModel).filter(
        and_(ProfileModel.id == profile_id, ProfileModel.user_id == user_id)
    ).first()

def update_profile(db: Session, profile_id: str, profile_update: ProfileCreate, user_id: str) -> Optional[ProfileModel]:
    db_profile = get_profile(db, profile_id, user_id)
    if db_profile is None:
        return None
    
    for key, value in profile_update.model_dump(exclude_unset=True).items():
        setattr(db_profile, key, value)
    
    db.commit()
    db.refresh(db_profile)
    return db_profile

def delete_profile(db: Session, profile_id: str, user_id: str) -> bool:
    db_profile = get_profile(db, profile_id, user_id)
    if db_profile is None:
        return False
    
    db.delete(db_profile)
    db.commit()
    return True

# Profile Point CRUD
def create_profile_point(db: Session, point: ProfilePointCreate, user_id: str) -> ProfilePointModel:
    # Verify the profile belongs to the user
    profile = get_profile(db, str(point.profile_id), user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    db_point = ProfilePointModel(**point.model_dump())
    db.add(db_point)
    db.commit()
    db.refresh(db_point)
    return db_point

def get_profile_points(db: Session, profile_id: str, user_id: str) -> List[ProfilePointModel]:
    # Verify the profile belongs to the user
    profile = get_profile(db, profile_id, user_id)
    if not profile:
        return []
    
    return db.query(ProfilePointModel).filter(ProfilePointModel.profile_id == profile_id).all()

# Dataset CRUD
def create_dataset(db: Session, dataset: DatasetCreate, user_id: str) -> DatasetModel:
    db_dataset = DatasetModel(**dataset.model_dump(), user_id=user_id)
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset

def get_user_datasets(db: Session, user_id: str) -> List[DatasetModel]:
    return db.query(DatasetModel).filter(DatasetModel.user_id == user_id).all()

def get_dataset(db: Session, dataset_id: str, user_id: str) -> Optional[DatasetModel]:
    return db.query(DatasetModel).filter(
        and_(DatasetModel.id == dataset_id, DatasetModel.user_id == user_id)
    ).first()

# Text CRUD
def create_text(db: Session, text: TextCreate, user_id: str) -> TextModel:
    # Verify the dataset belongs to the user
    dataset = get_dataset(db, str(text.dataset_id), user_id)
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
    
    db_text = TextModel(**text.model_dump())
    db.add(db_text)
    db.commit()
    db.refresh(db_text)
    return db_text

def get_dataset_texts(db: Session, dataset_id: str, user_id: str) -> List[TextModel]:
    # Verify the dataset belongs to the user
    dataset = get_dataset(db, dataset_id, user_id)
    if not dataset:
        return []
    
    return db.query(TextModel).filter(TextModel.dataset_id == dataset_id).all()

# Annotated Dataset CRUD
def create_annotated_dataset(db: Session, annotated_dataset: AnnotatedDatasetCreate, user_id: str) -> AnnotatedDatasetModel:
    # Verify the dataset and profile belong to the user
    dataset = get_dataset(db, str(annotated_dataset.dataset_id), user_id)
    profile = get_profile(db, str(annotated_dataset.profile_id), user_id)
    
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found")
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    
    db_annotated_dataset = AnnotatedDatasetModel(**annotated_dataset.model_dump(), user_id=user_id)
    db.add(db_annotated_dataset)
    db.commit()
    db.refresh(db_annotated_dataset)
    return db_annotated_dataset

def get_user_annotated_datasets(db: Session, user_id: str) -> List[AnnotatedDatasetModel]:
    return db.query(AnnotatedDatasetModel).filter(AnnotatedDatasetModel.user_id == user_id).all()

# Annotated Text CRUD
def create_annotated_text(db: Session, annotated_text: AnnotatedTextCreate, user_id: str) -> AnnotatedTextModel:
    # Verify the annotated dataset belongs to the user
    annotated_dataset = db.query(AnnotatedDatasetModel).filter(
        and_(AnnotatedDatasetModel.id == annotated_text.annotated_dataset_id, AnnotatedDatasetModel.user_id == user_id)
    ).first()
    
    if not annotated_dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Annotated dataset not found")
    
    db_annotated_text = AnnotatedTextModel(**annotated_text.model_dump())
    db.add(db_annotated_text)
    db.commit()
    db.refresh(db_annotated_text)
    return db_annotated_text

# Data Point CRUD
def create_data_point(db: Session, data_point: DataPointCreate, user_id: str) -> DataPointModel:
    # Verify the annotated text belongs to the user (through annotated dataset)
    annotated_text = db.query(AnnotatedTextModel).join(AnnotatedDatasetModel).filter(
        and_(AnnotatedTextModel.id == data_point.annotated_text_id, AnnotatedDatasetModel.user_id == user_id)
    ).first()
    
    if not annotated_text:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Annotated text not found")
    
    db_data_point = DataPointModel(**data_point.model_dump())
    db.add(db_data_point)
    db.commit()
    db.refresh(db_data_point)
    return db_data_point

# User Settings CRUD
def get_or_create_user_settings(db: Session, user_id: str) -> UserSettingsModel:
    settings = db.query(UserSettingsModel).filter(UserSettingsModel.user_id == user_id).first()
    if not settings:
        settings = UserSettingsModel(user_id=user_id, tutorial_completed=False)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_user_settings(db: Session, user_id: str, settings_update: UserSettingsCreate) -> UserSettingsModel:
    settings = get_or_create_user_settings(db, user_id)
    
    for key, value in settings_update.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    
    db.commit()
    db.refresh(settings)
    return settings

# User LLM Config CRUD
def get_or_create_user_llm_config(db: Session, user_id: str) -> UserLLMConfigModel:
    config = db.query(UserLLMConfigModel).filter(UserLLMConfigModel.user_id == user_id).first()
    if not config:
        config = UserLLMConfigModel(user_id=user_id)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

def update_user_llm_config(db: Session, user_id: str, config_update: UserLLMConfigCreate) -> UserLLMConfigModel:
    config = get_or_create_user_llm_config(db, user_id)
    
    for key, value in config_update.model_dump(exclude_unset=True).items():
        setattr(config, key, value)
    
    db.commit()
    db.refresh(config)
    return config 