from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from app.models.user_data_models import UserStorageCreate, UserStorageUpdate, UserStorageResponse, StorageDataExport, MigrateLocalToCloudRequest
from app.models.user_data_models import Profile, ProfileCreate, ProfileUpdate, Dataset, DatasetCreate, DatasetUpdate
from app.models.user_data_models import DataPoint, DataPointCreate, DataPointUpdate, SegmentDataPoint, SegmentDataPointCreate, SegmentDataPointUpdate
from app.models.user_data_models import ProfilePoint, ProfilePointCreate, ProfilePointUpdate, SegmentationProfilePoint, SegmentationProfilePointCreate, SegmentationProfilePointUpdate
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
