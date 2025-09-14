from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from app.models.user_data_models import UserStorageCreate, UserStorageUpdate, UserStorageResponse, StorageDataExport, MigrateLocalToCloudRequest
from app.models.user_data_models import Profile, ProfileCreate, ProfileUpdate, Dataset, DatasetCreate, DatasetUpdate
from app.models.user_data_models import DataPoint, DataPointCreate, DataPointUpdate, SegmentDataPoint, SegmentDataPointCreate, SegmentDataPointUpdate
from app.models.user_data_models import ProfilePoint, ProfilePointCreate, ProfilePointUpdate, SegmentationProfilePoint, SegmentationProfilePointCreate, SegmentationProfilePointUpdate
from app.models.user_data_models import Text, TextCreate, TextUpdate, AnnotatedText, AnnotatedTextCreate, AnnotatedTextUpdate, AnnotatedDataset, AnnotatedDatasetCreate, AnnotatedDatasetUpdate
from app.models.user_data_models import ApiKey, ApiKeyCreate, ApiKeyUpdate, Model, ModelCreate, ModelUpdate, LLMProvider, LLMProviderCreate, LLMProviderUpdate
from app.models.user_data_models import LLMUrl, LLMUrlCreate, LLMUrlUpdate, BatchSize, BatchSizeCreate, BatchSizeUpdate, MaxTokens, MaxTokensCreate, MaxTokensUpdate
from app.models.user_data_models import UserSettings, UserSettingsCreate, UserSettingsUpdate
from app.services.user_data_service import UserDataService
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(prefix="/user-data", tags=["user-data"])

def get_user_data_service() -> UserDataService:
    return UserDataService()

@router.post("/", response_model=UserStorageResponse)
async def create_user_storage(
    storage_data: UserStorageCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new cloud storage for the current user."""
    try:
        user_storage = await user_data_service.create_user_storage(current_user.id, storage_data.storage_name)
        return UserStorageResponse.from_document(user_storage)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create storage: {str(e)}"
        )

@router.get("/", response_model=List[UserStorageResponse])
async def get_user_storages(
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all cloud storages for the current user."""
    try:
        user_storages = await user_data_service.get_user_storages(current_user.id)
        return [UserStorageResponse.from_document(storage) for storage in user_storages]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch storages: {str(e)}"
        )

@router.get("/{storage_id}", response_model=UserStorageResponse)
async def get_user_storage(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get a specific cloud storage by ID."""
    try:
        user_storage = await user_data_service.get_user_storage_by_id(ObjectId(storage_id), current_user.id)
        if not user_storage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storage not found"
            )
        return UserStorageResponse.from_document(user_storage)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch storage: {str(e)}"
        )

@router.put("/{storage_id}", response_model=UserStorageResponse)
async def update_user_storage(
    storage_id: str,
    update_data: UserStorageUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a cloud storage."""
    try:
        user_storage = await user_data_service.update_user_storage(ObjectId(storage_id), current_user.id, update_data)
        if not user_storage:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storage not found"
            )
        return UserStorageResponse.from_document(user_storage)
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update storage: {str(e)}"
        )

@router.delete("/{storage_id}")
async def delete_user_storage(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a cloud storage."""
    try:
        success = await user_data_service.delete_user_storage(ObjectId(storage_id), current_user.id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storage not found"
            )
        return {"message": "Storage deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete storage: {str(e)}"
        )

@router.post("/migrate-local")
async def migrate_local_to_cloud(
    request: MigrateLocalToCloudRequest,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Migrate local storage data to cloud storage."""
    try:
        # Convert request to dict format expected by service
        local_data = {
            'profiles': request.profiles,
            'datasets': request.datasets,
            'texts': request.texts,
            'annotated_datasets': request.annotated_datasets,
            'annotated_texts': request.annotated_texts,
            'data_points': request.data_points,
            'segment_data_points': request.segment_data_points,
            'profile_points': request.profile_points,
            'segmentation_profile_points': request.segmentation_profile_points,
            'api_keys': request.api_keys,
            'models': request.models,
            'llm_providers': request.llm_providers,
            'llm_urls': request.llm_urls,
            'batch_sizes': request.batch_sizes,
            'max_tokens': request.max_tokens,
            'user_settings': request.user_settings
        }
        
        user_storage = await user_data_service.migrate_local_to_cloud(current_user.id, request.storage_name, local_data)
        return UserStorageResponse.from_document(user_storage)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to migrate storage: {str(e)}"
        )

@router.get("/{storage_id}/export")
async def export_cloud_data(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Export cloud storage data in local database format."""
    try:
        data = await user_data_service.export_cloud_to_local_format(ObjectId(storage_id), current_user.id)
        if data is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Storage not found"
            )
        return data
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data: {str(e)}"
        )

# Individual Profile CRUD operations
@router.post("/{storage_id}/profiles", response_model=Profile)
async def create_profile(
    storage_id: str,
    profile_data: ProfileCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new profile in the specified cloud storage."""
    try:
        profile = await user_data_service.create_profile(ObjectId(storage_id), current_user.id, profile_data.model_dump())
        return profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile: {str(e)}"
        )

@router.get("/{storage_id}/profiles", response_model=List[Profile])
async def get_profiles(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all profiles from the specified cloud storage."""
    try:
        profiles = await user_data_service.get_profiles(ObjectId(storage_id), current_user.id)
        return profiles
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profiles: {str(e)}"
        )

@router.put("/{storage_id}/profiles/{profile_id}", response_model=Profile)
async def update_profile(
    storage_id: str,
    profile_id: str,
    profile_data: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a profile in the specified cloud storage."""
    try:
        profile = await user_data_service.update_profile(ObjectId(storage_id), ObjectId(profile_id), current_user.id, profile_data.model_dump())
        return profile
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )

@router.delete("/{storage_id}/profiles/{profile_id}")
async def delete_profile(
    storage_id: str,
    profile_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a profile from the specified cloud storage."""
    try:
        await user_data_service.delete_profile(ObjectId(storage_id), ObjectId(profile_id), current_user.id)
        return {"message": "Profile deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete profile: {str(e)}"
        )

# Individual Dataset CRUD operations
@router.post("/{storage_id}/datasets", response_model=Dataset)
async def create_dataset(
    storage_id: str,
    dataset_data: DatasetCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new dataset in the specified cloud storage."""
    try:
        dataset = await user_data_service.create_dataset(ObjectId(storage_id), current_user.id, dataset_data.model_dump())
        return dataset
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create dataset: {str(e)}"
        )

@router.get("/{storage_id}/datasets", response_model=List[Dataset])
async def get_datasets(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all datasets from the specified cloud storage."""
    try:
        datasets = await user_data_service.get_datasets(ObjectId(storage_id), current_user.id)
        return datasets
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get datasets: {str(e)}"
        )

@router.put("/{storage_id}/datasets/{dataset_id}", response_model=Dataset)
async def update_dataset(
    storage_id: str,
    dataset_id: str,
    dataset_data: DatasetUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a dataset in the specified cloud storage."""
    try:
        dataset = await user_data_service.update_dataset(ObjectId(storage_id), ObjectId(dataset_id), current_user.id, dataset_data.model_dump())
        return dataset
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update dataset: {str(e)}"
        )

@router.delete("/{storage_id}/datasets/{dataset_id}")
async def delete_dataset(
    storage_id: str,
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a dataset from the specified cloud storage."""
    try:
        await user_data_service.delete_dataset(ObjectId(storage_id), ObjectId(dataset_id), current_user.id)
        return {"message": "Dataset deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete dataset: {str(e)}"
        )

# Individual DataPoint CRUD operations
@router.post("/{storage_id}/data-points", response_model=DataPoint)
async def create_data_point(
    storage_id: str,
    data_point_data: DataPointCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new data point in the specified cloud storage."""
    try:
        data_point = await user_data_service.create_data_point(ObjectId(storage_id), current_user.id, data_point_data.model_dump())
        return data_point
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create data point: {str(e)}"
        )

@router.get("/{storage_id}/data-points", response_model=List[DataPoint])
async def get_data_points(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all data points from the specified cloud storage."""
    try:
        data_points = await user_data_service.get_data_points(ObjectId(storage_id), current_user.id)
        return data_points
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get data points: {str(e)}"
        )

@router.get("/{storage_id}/data-points/by-annotated-text/{annotated_text_id}", response_model=List[DataPoint])
async def get_data_points_by_annotated_text(
    storage_id: str,
    annotated_text_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all data points for a specific annotated text."""
    try:
        data_points = await user_data_service.get_data_points_by_annotated_text(ObjectId(storage_id), ObjectId(annotated_text_id), current_user.id)
        return data_points
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get data points: {str(e)}"
        )

@router.put("/{storage_id}/data-points/{data_point_id}", response_model=DataPoint)
async def update_data_point(
    storage_id: str,
    data_point_id: str,
    data_point_data: DataPointUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a data point in the specified cloud storage."""
    try:
        data_point = await user_data_service.update_data_point(ObjectId(storage_id), ObjectId(data_point_id), current_user.id, data_point_data.model_dump())
        return data_point
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update data point: {str(e)}"
        )

@router.delete("/{storage_id}/data-points/{data_point_id}")
async def delete_data_point(
    storage_id: str,
    data_point_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a data point from the specified cloud storage."""
    try:
        await user_data_service.delete_data_point(ObjectId(storage_id), ObjectId(data_point_id), current_user.id)
        return {"message": "Data point deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete data point: {str(e)}"
        )

# Individual SegmentDataPoint CRUD operations
@router.post("/{storage_id}/segment-data-points", response_model=SegmentDataPoint)
async def create_segment_data_point(
    storage_id: str,
    segment_data_point_data: SegmentDataPointCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new segment data point in the specified cloud storage."""
    try:
        segment_data_point = await user_data_service.create_segment_data_point(ObjectId(storage_id), current_user.id, segment_data_point_data.model_dump())
        return segment_data_point
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create segment data point: {str(e)}"
        )

@router.get("/{storage_id}/segment-data-points", response_model=List[SegmentDataPoint])
async def get_segment_data_points(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all segment data points from the specified cloud storage."""
    try:
        segment_data_points = await user_data_service.get_segment_data_points(ObjectId(storage_id), current_user.id)
        return segment_data_points
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get segment data points: {str(e)}"
        )

@router.get("/{storage_id}/segment-data-points/by-annotated-text/{annotated_text_id}", response_model=List[SegmentDataPoint])
async def get_segment_data_points_by_annotated_text(
    storage_id: str,
    annotated_text_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all segment data points for a specific annotated text."""
    try:
        segment_data_points = await user_data_service.get_segment_data_points_by_annotated_text(ObjectId(storage_id), ObjectId(annotated_text_id), current_user.id)
        return segment_data_points
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get segment data points: {str(e)}"
        )

@router.put("/{storage_id}/segment-data-points/{segment_data_point_id}", response_model=SegmentDataPoint)
async def update_segment_data_point(
    storage_id: str,
    segment_data_point_id: str,
    segment_data_point_data: SegmentDataPointUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a segment data point in the specified cloud storage."""
    try:
        segment_data_point = await user_data_service.update_segment_data_point(ObjectId(storage_id), ObjectId(segment_data_point_id), current_user.id, segment_data_point_data.model_dump())
        return segment_data_point
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update segment data point: {str(e)}"
        )

@router.delete("/{storage_id}/segment-data-points/{segment_data_point_id}")
async def delete_segment_data_point(
    storage_id: str,
    segment_data_point_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a segment data point from the specified cloud storage."""
    try:
        await user_data_service.delete_segment_data_point(ObjectId(storage_id), ObjectId(segment_data_point_id), current_user.id)
        return {"message": "Segment data point deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete segment data point: {str(e)}"
        )

# Individual ProfilePoint CRUD operations
@router.post("/{storage_id}/profile-points", response_model=ProfilePoint)
async def create_profile_point(
    storage_id: str,
    profile_point_data: ProfilePointCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new profile point in the specified cloud storage."""
    try:
        profile_point = await user_data_service.create_profile_point(ObjectId(storage_id), current_user.id, profile_point_data.model_dump())
        return profile_point
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create profile point: {str(e)}"
        )

@router.get("/{storage_id}/profile-points", response_model=List[ProfilePoint])
async def get_profile_points(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all profile points from the specified cloud storage."""
    try:
        profile_points = await user_data_service.get_profile_points(ObjectId(storage_id), current_user.id)
        return profile_points
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile points: {str(e)}"
        )

@router.get("/{storage_id}/profile-points/by-profile/{profile_id}", response_model=List[ProfilePoint])
async def get_profile_points_by_profile(
    storage_id: str,
    profile_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all profile points for a specific profile."""
    try:
        profile_points = await user_data_service.get_profile_points_by_profile(ObjectId(storage_id), ObjectId(profile_id), current_user.id)
        return profile_points
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get profile points: {str(e)}"
        )

@router.put("/{storage_id}/profile-points/{profile_point_id}", response_model=ProfilePoint)
async def update_profile_point(
    storage_id: str,
    profile_point_id: str,
    profile_point_data: ProfilePointUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a profile point in the specified cloud storage."""
    try:
        profile_point = await user_data_service.update_profile_point(ObjectId(storage_id), ObjectId(profile_point_id), current_user.id, profile_point_data.model_dump())
        return profile_point
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile point: {str(e)}"
        )

@router.delete("/{storage_id}/profile-points/{profile_point_id}")
async def delete_profile_point(
    storage_id: str,
    profile_point_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a profile point from the specified cloud storage."""
    try:
        await user_data_service.delete_profile_point(ObjectId(storage_id), ObjectId(profile_point_id), current_user.id)
        return {"message": "Profile point deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete profile point: {str(e)}"
        )

# Individual SegmentationProfilePoint CRUD operations
@router.post("/{storage_id}/segmentation-profile-points", response_model=SegmentationProfilePoint)
async def create_segmentation_profile_point(
    storage_id: str,
    segmentation_profile_point_data: SegmentationProfilePointCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new segmentation profile point in the specified cloud storage."""
    try:
        segmentation_profile_point = await user_data_service.create_segmentation_profile_point(ObjectId(storage_id), current_user.id, segmentation_profile_point_data.model_dump())
        return segmentation_profile_point
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create segmentation profile point: {str(e)}"
        )

@router.get("/{storage_id}/segmentation-profile-points", response_model=List[SegmentationProfilePoint])
async def get_segmentation_profile_points(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all segmentation profile points from the specified cloud storage."""
    try:
        segmentation_profile_points = await user_data_service.get_segmentation_profile_points(ObjectId(storage_id), current_user.id)
        return segmentation_profile_points
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get segmentation profile points: {str(e)}"
        )

@router.get("/{storage_id}/segmentation-profile-points/by-profile/{profile_id}", response_model=List[SegmentationProfilePoint])
async def get_segmentation_profile_points_by_profile(
    storage_id: str,
    profile_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all segmentation profile points for a specific profile."""
    try:
        segmentation_profile_points = await user_data_service.get_segmentation_profile_points_by_profile(ObjectId(storage_id), ObjectId(profile_id), current_user.id)
        return segmentation_profile_points
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get segmentation profile points: {str(e)}"
        )

@router.put("/{storage_id}/segmentation-profile-points/{segmentation_profile_point_id}", response_model=SegmentationProfilePoint)
async def update_segmentation_profile_point(
    storage_id: str,
    segmentation_profile_point_id: str,
    segmentation_profile_point_data: SegmentationProfilePointUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a segmentation profile point in the specified cloud storage."""
    try:
        segmentation_profile_point = await user_data_service.update_segmentation_profile_point(ObjectId(storage_id), ObjectId(segmentation_profile_point_id), current_user.id, segmentation_profile_point_data.model_dump())
        return segmentation_profile_point
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update segmentation profile point: {str(e)}"
        )

@router.delete("/{storage_id}/segmentation-profile-points/{segmentation_profile_point_id}")
async def delete_segmentation_profile_point(
    storage_id: str,
    segmentation_profile_point_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a segmentation profile point from the specified cloud storage."""
    try:
        await user_data_service.delete_segmentation_profile_point(ObjectId(storage_id), ObjectId(segmentation_profile_point_id), current_user.id)
        return {"message": "Segmentation profile point deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete segmentation profile point: {str(e)}"
        )

# Individual Text CRUD operations
@router.post("/{storage_id}/texts", response_model=Text)
async def create_text(
    storage_id: str,
    text_data: TextCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new text in the specified cloud storage."""
    try:
        text = await user_data_service.create_text(ObjectId(storage_id), current_user.id, text_data.model_dump())
        return text
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create text: {str(e)}"
        )

@router.get("/{storage_id}/texts", response_model=List[Text])
async def get_texts(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all texts from the specified cloud storage."""
    try:
        texts = await user_data_service.get_texts(ObjectId(storage_id), current_user.id)
        return texts
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get texts: {str(e)}"
        )

@router.get("/{storage_id}/texts/by-dataset/{dataset_id}", response_model=List[Text])
async def get_texts_by_dataset(
    storage_id: str,
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all texts for a specific dataset."""
    try:
        texts = await user_data_service.get_texts_by_dataset(ObjectId(storage_id), ObjectId(dataset_id), current_user.id)
        return texts
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get texts: {str(e)}"
        )

@router.put("/{storage_id}/texts/{text_id}", response_model=Text)
async def update_text(
    storage_id: str,
    text_id: str,
    text_data: TextUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a text in the specified cloud storage."""
    try:
        text = await user_data_service.update_text(ObjectId(storage_id), ObjectId(text_id), current_user.id, text_data.model_dump())
        return text
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update text: {str(e)}"
        )

@router.delete("/{storage_id}/texts/{text_id}")
async def delete_text(
    storage_id: str,
    text_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a text from the specified cloud storage."""
    try:
        await user_data_service.delete_text(ObjectId(storage_id), ObjectId(text_id), current_user.id)
        return {"message": "Text deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete text: {str(e)}"
        )

# Individual AnnotatedDataset CRUD operations
@router.post("/{storage_id}/annotated-datasets", response_model=AnnotatedDataset)
async def create_annotated_dataset(
    storage_id: str,
    annotated_dataset_data: AnnotatedDatasetCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new annotated dataset in the specified cloud storage."""
    try:
        annotated_dataset = await user_data_service.create_annotated_dataset(ObjectId(storage_id), current_user.id, annotated_dataset_data.model_dump())
        return annotated_dataset
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create annotated dataset: {str(e)}"
        )

@router.get("/{storage_id}/annotated-datasets", response_model=List[AnnotatedDataset])
async def get_annotated_datasets(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all annotated datasets from the specified cloud storage."""
    try:
        annotated_datasets = await user_data_service.get_annotated_datasets(ObjectId(storage_id), current_user.id)
        return annotated_datasets
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get annotated datasets: {str(e)}"
        )

@router.get("/{storage_id}/annotated-datasets/by-dataset/{dataset_id}", response_model=List[AnnotatedDataset])
async def get_annotated_datasets_by_dataset(
    storage_id: str,
    dataset_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all annotated datasets for a specific dataset."""
    try:
        annotated_datasets = await user_data_service.get_annotated_datasets_by_dataset(ObjectId(storage_id), ObjectId(dataset_id), current_user.id)
        return annotated_datasets
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get annotated datasets: {str(e)}"
        )

@router.put("/{storage_id}/annotated-datasets/{annotated_dataset_id}", response_model=AnnotatedDataset)
async def update_annotated_dataset(
    storage_id: str,
    annotated_dataset_id: str,
    annotated_dataset_data: AnnotatedDatasetUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update an annotated dataset in the specified cloud storage."""
    try:
        annotated_dataset = await user_data_service.update_annotated_dataset(ObjectId(storage_id), ObjectId(annotated_dataset_id), current_user.id, annotated_dataset_data.model_dump())
        return annotated_dataset
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update annotated dataset: {str(e)}"
        )

@router.delete("/{storage_id}/annotated-datasets/{annotated_dataset_id}")
async def delete_annotated_dataset(
    storage_id: str,
    annotated_dataset_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete an annotated dataset from the specified cloud storage."""
    try:
        await user_data_service.delete_annotated_dataset(ObjectId(storage_id), ObjectId(annotated_dataset_id), current_user.id)
        return {"message": "Annotated dataset deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete annotated dataset: {str(e)}"
        )

# Individual AnnotatedText CRUD operations
@router.post("/{storage_id}/annotated-texts", response_model=AnnotatedText)
async def create_annotated_text(
    storage_id: str,
    annotated_text_data: AnnotatedTextCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new annotated text in the specified cloud storage."""
    try:
        annotated_text = await user_data_service.create_annotated_text(ObjectId(storage_id), current_user.id, annotated_text_data.model_dump())
        return annotated_text
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create annotated text: {str(e)}"
        )

@router.get("/{storage_id}/annotated-texts", response_model=List[AnnotatedText])
async def get_annotated_texts(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all annotated texts from the specified cloud storage."""
    try:
        annotated_texts = await user_data_service.get_annotated_texts(ObjectId(storage_id), current_user.id)
        return annotated_texts
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get annotated texts: {str(e)}"
        )

@router.get("/{storage_id}/annotated-texts/by-dataset/{annotated_dataset_id}", response_model=List[AnnotatedText])
async def get_annotated_texts_by_dataset(
    storage_id: str,
    annotated_dataset_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all annotated texts for a specific annotated dataset."""
    try:
        annotated_texts = await user_data_service.get_annotated_texts_by_dataset(ObjectId(storage_id), ObjectId(annotated_dataset_id), current_user.id)
        return annotated_texts
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get annotated texts: {str(e)}"
        )

@router.put("/{storage_id}/annotated-texts/{annotated_text_id}", response_model=AnnotatedText)
async def update_annotated_text(
    storage_id: str,
    annotated_text_id: str,
    annotated_text_data: AnnotatedTextUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update an annotated text in the specified cloud storage."""
    try:
        annotated_text = await user_data_service.update_annotated_text(ObjectId(storage_id), ObjectId(annotated_text_id), current_user.id, annotated_text_data.model_dump())
        return annotated_text
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update annotated text: {str(e)}"
        )

@router.delete("/{storage_id}/annotated-texts/{annotated_text_id}")
async def delete_annotated_text(
    storage_id: str,
    annotated_text_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete an annotated text from the specified cloud storage."""
    try:
        await user_data_service.delete_annotated_text(ObjectId(storage_id), ObjectId(annotated_text_id), current_user.id)
        return {"message": "Annotated text deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete annotated text: {str(e)}"
        )

# Settings API endpoints
# ApiKey endpoints
@router.post("/{storage_id}/api-keys", response_model=ApiKey)
async def create_api_key(
    storage_id: str,
    api_key_data: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new API key in the specified cloud storage."""
    try:
        api_key = await user_data_service.create_api_key(ObjectId(storage_id), current_user.id, api_key_data.model_dump())
        return api_key
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create API key: {str(e)}"
        )

@router.get("/{storage_id}/api-keys", response_model=List[ApiKey])
async def get_api_keys(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all API keys from the specified cloud storage."""
    try:
        api_keys = await user_data_service.get_api_keys(ObjectId(storage_id), current_user.id)
        return api_keys
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get API keys: {str(e)}"
        )

@router.put("/{storage_id}/api-keys/{api_key_id}", response_model=ApiKey)
async def update_api_key(
    storage_id: str,
    api_key_id: str,
    api_key_data: ApiKeyUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update an API key in the specified cloud storage."""
    try:
        api_key = await user_data_service.update_api_key(ObjectId(storage_id), ObjectId(api_key_id), current_user.id, api_key_data.model_dump())
        return api_key
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update API key: {str(e)}"
        )

@router.delete("/{storage_id}/api-keys/{api_key_id}")
async def delete_api_key(
    storage_id: str,
    api_key_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete an API key from the specified cloud storage."""
    try:
        await user_data_service.delete_api_key(ObjectId(storage_id), ObjectId(api_key_id), current_user.id)
        return {"message": "API key deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete API key: {str(e)}"
        )

# Model endpoints
@router.post("/{storage_id}/models", response_model=Model)
async def create_model(
    storage_id: str,
    model_data: ModelCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new model in the specified cloud storage."""
    try:
        model = await user_data_service.create_model(ObjectId(storage_id), current_user.id, model_data.model_dump())
        return model
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create model: {str(e)}"
        )

@router.get("/{storage_id}/models", response_model=List[Model])
async def get_models(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all models from the specified cloud storage."""
    try:
        models = await user_data_service.get_models(ObjectId(storage_id), current_user.id)
        return models
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get models: {str(e)}"
        )

@router.put("/{storage_id}/models/{model_id}", response_model=Model)
async def update_model(
    storage_id: str,
    model_id: str,
    model_data: ModelUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a model in the specified cloud storage."""
    try:
        model = await user_data_service.update_model(ObjectId(storage_id), ObjectId(model_id), current_user.id, model_data.model_dump())
        return model
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update model: {str(e)}"
        )

@router.delete("/{storage_id}/models/{model_id}")
async def delete_model(
    storage_id: str,
    model_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a model from the specified cloud storage."""
    try:
        await user_data_service.delete_model(ObjectId(storage_id), ObjectId(model_id), current_user.id)
        return {"message": "Model deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete model: {str(e)}"
        )

# LLMProvider endpoints
@router.post("/{storage_id}/llm-providers", response_model=LLMProvider)
async def create_llm_provider(
    storage_id: str,
    provider_data: LLMProviderCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new LLM provider in the specified cloud storage."""
    try:
        provider = await user_data_service.create_llm_provider(ObjectId(storage_id), current_user.id, provider_data.model_dump())
        return provider
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create LLM provider: {str(e)}"
        )

@router.get("/{storage_id}/llm-providers", response_model=List[LLMProvider])
async def get_llm_providers(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all LLM providers from the specified cloud storage."""
    try:
        providers = await user_data_service.get_llm_providers(ObjectId(storage_id), current_user.id)
        return providers
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get LLM providers: {str(e)}"
        )

@router.put("/{storage_id}/llm-providers/{provider_id}", response_model=LLMProvider)
async def update_llm_provider(
    storage_id: str,
    provider_id: str,
    provider_data: LLMProviderUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update an LLM provider in the specified cloud storage."""
    try:
        provider = await user_data_service.update_llm_provider(ObjectId(storage_id), ObjectId(provider_id), current_user.id, provider_data.model_dump())
        return provider
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update LLM provider: {str(e)}"
        )

@router.delete("/{storage_id}/llm-providers/{provider_id}")
async def delete_llm_provider(
    storage_id: str,
    provider_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete an LLM provider from the specified cloud storage."""
    try:
        await user_data_service.delete_llm_provider(ObjectId(storage_id), ObjectId(provider_id), current_user.id)
        return {"message": "LLM provider deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete LLM provider: {str(e)}"
        )

# LLMUrl endpoints
@router.post("/{storage_id}/llm-urls", response_model=LLMUrl)
async def create_llm_url(
    storage_id: str,
    url_data: LLMUrlCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new LLM URL in the specified cloud storage."""
    try:
        url = await user_data_service.create_llm_url(ObjectId(storage_id), current_user.id, url_data.model_dump())
        return url
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create LLM URL: {str(e)}"
        )

@router.get("/{storage_id}/llm-urls", response_model=List[LLMUrl])
async def get_llm_urls(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all LLM URLs from the specified cloud storage."""
    try:
        urls = await user_data_service.get_llm_urls(ObjectId(storage_id), current_user.id)
        return urls
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get LLM URLs: {str(e)}"
        )

@router.put("/{storage_id}/llm-urls/{url_id}", response_model=LLMUrl)
async def update_llm_url(
    storage_id: str,
    url_id: str,
    url_data: LLMUrlUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update an LLM URL in the specified cloud storage."""
    try:
        url = await user_data_service.update_llm_url(ObjectId(storage_id), ObjectId(url_id), current_user.id, url_data.model_dump())
        return url
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update LLM URL: {str(e)}"
        )

@router.delete("/{storage_id}/llm-urls/{url_id}")
async def delete_llm_url(
    storage_id: str,
    url_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete an LLM URL from the specified cloud storage."""
    try:
        await user_data_service.delete_llm_url(ObjectId(storage_id), ObjectId(url_id), current_user.id)
        return {"message": "LLM URL deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete LLM URL: {str(e)}"
        )

# BatchSize endpoints
@router.post("/{storage_id}/batch-sizes", response_model=BatchSize)
async def create_batch_size(
    storage_id: str,
    batch_size_data: BatchSizeCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create a new batch size in the specified cloud storage."""
    try:
        batch_size = await user_data_service.create_batch_size(ObjectId(storage_id), current_user.id, batch_size_data.model_dump())
        return batch_size
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create batch size: {str(e)}"
        )

@router.get("/{storage_id}/batch-sizes", response_model=List[BatchSize])
async def get_batch_sizes(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all batch sizes from the specified cloud storage."""
    try:
        batch_sizes = await user_data_service.get_batch_sizes(ObjectId(storage_id), current_user.id)
        return batch_sizes
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get batch sizes: {str(e)}"
        )

@router.put("/{storage_id}/batch-sizes/{batch_size_id}", response_model=BatchSize)
async def update_batch_size(
    storage_id: str,
    batch_size_id: str,
    batch_size_data: BatchSizeUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update a batch size in the specified cloud storage."""
    try:
        batch_size = await user_data_service.update_batch_size(ObjectId(storage_id), ObjectId(batch_size_id), current_user.id, batch_size_data.model_dump())
        return batch_size
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update batch size: {str(e)}"
        )

@router.delete("/{storage_id}/batch-sizes/{batch_size_id}")
async def delete_batch_size(
    storage_id: str,
    batch_size_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete a batch size from the specified cloud storage."""
    try:
        await user_data_service.delete_batch_size(ObjectId(storage_id), ObjectId(batch_size_id), current_user.id)
        return {"message": "Batch size deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete batch size: {str(e)}"
        )

# MaxTokens endpoints
@router.post("/{storage_id}/max-tokens", response_model=MaxTokens)
async def create_max_tokens(
    storage_id: str,
    max_tokens_data: MaxTokensCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create new max tokens in the specified cloud storage."""
    try:
        max_tokens = await user_data_service.create_max_tokens(ObjectId(storage_id), current_user.id, max_tokens_data.model_dump())
        return max_tokens
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create max tokens: {str(e)}"
        )

@router.get("/{storage_id}/max-tokens", response_model=List[MaxTokens])
async def get_max_tokens(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all max tokens from the specified cloud storage."""
    try:
        max_tokens = await user_data_service.get_max_tokens(ObjectId(storage_id), current_user.id)
        return max_tokens
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get max tokens: {str(e)}"
        )

@router.put("/{storage_id}/max-tokens/{max_tokens_id}", response_model=MaxTokens)
async def update_max_tokens(
    storage_id: str,
    max_tokens_id: str,
    max_tokens_data: MaxTokensUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update max tokens in the specified cloud storage."""
    try:
        max_tokens = await user_data_service.update_max_tokens(ObjectId(storage_id), ObjectId(max_tokens_id), current_user.id, max_tokens_data.model_dump())
        return max_tokens
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update max tokens: {str(e)}"
        )

@router.delete("/{storage_id}/max-tokens/{max_tokens_id}")
async def delete_max_tokens(
    storage_id: str,
    max_tokens_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete max tokens from the specified cloud storage."""
    try:
        await user_data_service.delete_max_tokens(ObjectId(storage_id), ObjectId(max_tokens_id), current_user.id)
        return {"message": "Max tokens deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete max tokens: {str(e)}"
        )

# UserSettings endpoints
@router.post("/{storage_id}/user-settings", response_model=UserSettings)
async def create_user_settings(
    storage_id: str,
    settings_data: UserSettingsCreate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Create new user settings in the specified cloud storage."""
    try:
        settings = await user_data_service.create_user_settings(ObjectId(storage_id), current_user.id, settings_data.model_dump())
        return settings
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user settings: {str(e)}"
        )

@router.get("/{storage_id}/user-settings", response_model=List[UserSettings])
async def get_user_settings(
    storage_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Get all user settings from the specified cloud storage."""
    try:
        settings = await user_data_service.get_user_settings(ObjectId(storage_id), current_user.id)
        return settings
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get user settings: {str(e)}"
        )

@router.put("/{storage_id}/user-settings/{settings_id}", response_model=UserSettings)
async def update_user_settings(
    storage_id: str,
    settings_id: str,
    settings_data: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Update user settings in the specified cloud storage."""
    try:
        settings = await user_data_service.update_user_settings(ObjectId(storage_id), ObjectId(settings_id), current_user.id, settings_data.model_dump())
        return settings
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user settings: {str(e)}"
        )

@router.delete("/{storage_id}/user-settings/{settings_id}")
async def delete_user_settings(
    storage_id: str,
    settings_id: str,
    current_user: User = Depends(get_current_user),
    user_data_service: UserDataService = Depends(get_user_data_service)
):
    """Delete user settings from the specified cloud storage."""
    try:
        await user_data_service.delete_user_settings(ObjectId(storage_id), ObjectId(settings_id), current_user.id)
        return {"message": "User settings deleted successfully"}
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user settings: {str(e)}"
        )
