from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.config.database import get_db
from app.models.auth_models import User
from app.models.data_schemas import (
    Profile, ProfileCreate, ProfilePoint, ProfilePointCreate,
    Dataset, DatasetCreate, Text, TextCreate,
    AnnotatedDataset, AnnotatedDatasetCreate,
    UserSettings, UserSettingsCreate,
    UserLLMConfig, UserLLMConfigCreate,
)
from app.services.data_crud import (
    create_profile, get_user_profiles, get_profile, update_profile, delete_profile,
    create_profile_point, get_profile_points,
    create_dataset, get_user_datasets, get_dataset,
    create_text, get_dataset_texts,
    create_annotated_dataset, get_user_annotated_datasets,
    get_or_create_user_settings, update_user_settings,
    get_or_create_user_llm_config, update_user_llm_config,
)
from app.utils.auth import get_current_active_user

router = APIRouter()

# Profile endpoints
@router.post("/profiles", response_model=Profile)
def create_user_profile(
    profile: ProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return create_profile(db=db, profile=profile, user_id=str(current_user.id))

@router.get("/profiles", response_model=List[Profile])
def read_user_profiles(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_user_profiles(db=db, user_id=str(current_user.id))

@router.get("/profiles/{profile_id}", response_model=Profile)
def read_profile(
    profile_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = get_profile(db=db, profile_id=profile_id, user_id=str(current_user.id))
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.put("/profiles/{profile_id}", response_model=Profile)
def update_user_profile(
    profile_id: str,
    profile_update: ProfileCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = update_profile(db=db, profile_id=profile_id, profile_update=profile_update, user_id=str(current_user.id))
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.delete("/profiles/{profile_id}")
def delete_user_profile(
    profile_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    success = delete_profile(db=db, profile_id=profile_id, user_id=str(current_user.id))
    if not success:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"message": "Profile deleted successfully"}

# Profile Points endpoints
@router.post("/profile-points", response_model=ProfilePoint)
def create_user_profile_point(
    point: ProfilePointCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return create_profile_point(db=db, point=point, user_id=str(current_user.id))

@router.get("/profiles/{profile_id}/points", response_model=List[ProfilePoint])
def read_profile_points(
    profile_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_profile_points(db=db, profile_id=profile_id, user_id=str(current_user.id))

# Dataset endpoints
@router.post("/datasets", response_model=Dataset)
def create_user_dataset(
    dataset: DatasetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return create_dataset(db=db, dataset=dataset, user_id=str(current_user.id))

@router.get("/datasets", response_model=List[Dataset])
def read_user_datasets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_user_datasets(db=db, user_id=str(current_user.id))

@router.get("/datasets/{dataset_id}", response_model=Dataset)
def read_dataset(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    dataset = get_dataset(db=db, dataset_id=dataset_id, user_id=str(current_user.id))
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset

# Text endpoints
@router.post("/texts", response_model=Text)
def create_dataset_text(
    text: TextCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return create_text(db=db, text=text, user_id=str(current_user.id))

@router.get("/datasets/{dataset_id}/texts", response_model=List[Text])
def read_dataset_texts(
    dataset_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_dataset_texts(db=db, dataset_id=dataset_id, user_id=str(current_user.id))

# Annotated Dataset endpoints
@router.post("/annotated-datasets", response_model=AnnotatedDataset)
def create_user_annotated_dataset(
    annotated_dataset: AnnotatedDatasetCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return create_annotated_dataset(db=db, annotated_dataset=annotated_dataset, user_id=str(current_user.id))

@router.get("/annotated-datasets", response_model=List[AnnotatedDataset])
def read_user_annotated_datasets(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_user_annotated_datasets(db=db, user_id=str(current_user.id))

# User Settings endpoints
@router.get("/settings", response_model=UserSettings)
def read_user_settings(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_or_create_user_settings(db=db, user_id=str(current_user.id))

@router.put("/settings", response_model=UserSettings)
def update_settings(
    settings: UserSettingsCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return update_user_settings(db=db, user_id=str(current_user.id), settings_update=settings)

# LLM Config endpoints
@router.get("/llm-config", response_model=UserLLMConfig)
def read_user_llm_config(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return get_or_create_user_llm_config(db=db, user_id=str(current_user.id))

@router.put("/llm-config", response_model=UserLLMConfig)
def update_llm_config(
    config: UserLLMConfigCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return update_user_llm_config(db=db, user_id=str(current_user.id), config_update=config) 