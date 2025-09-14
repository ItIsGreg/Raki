from typing import List, Optional, Dict, Any
from bson import ObjectId
from datetime import datetime
from app.models.user_data_models import (
    UserStorage, UserStorageCreate, UserStorageUpdate, UserStorageResponse,
    Profile, Dataset, Text, AnnotatedDataset, AnnotatedText, DataPoint, SegmentDataPoint,
    ProfilePoint, SegmentationProfilePoint, ApiKey, Model, LLMProvider, LLMUrl,
    BatchSize, MaxTokens, UserSettings, StorageDataExport
)
from app.models.user import User

class UserDataService:
    def __init__(self):
        pass
    
    async def create_user_storage(self, user_id: ObjectId, storage_name: str) -> UserStorage:
        """Create a new cloud storage for a user."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Check if storage name already exists for this user
        existing = await UserStorage.find_one(
            UserStorage.user_id == user_id,
            UserStorage.storage_name == storage_name
        )
        if existing:
            raise ValueError("Storage name already exists")
        
        user_storage = UserStorage(
            user_id=user_id,
            storage_name=storage_name
        )
        
        await user_storage.insert()
        return user_storage
    
    async def get_user_storages(self, user_id: ObjectId) -> List[UserStorage]:
        """Get all cloud storages for a user."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return await UserStorage.find(UserStorage.user_id == user_id).sort("created_at").to_list()
    
    async def get_user_storage_by_id(self, storage_id: ObjectId, user_id: ObjectId) -> Optional[UserStorage]:
        """Get a specific cloud storage by ID for a user."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return await UserStorage.find_one(UserStorage.id == storage_id, UserStorage.user_id == user_id)
    
    async def get_user_storage_by_name(self, storage_name: str, user_id: ObjectId) -> Optional[UserStorage]:
        """Get a specific cloud storage by name for a user."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        return await UserStorage.find_one(UserStorage.storage_name == storage_name, UserStorage.user_id == user_id)
    
    async def update_user_storage(self, storage_id: ObjectId, user_id: ObjectId, update_data: UserStorageUpdate) -> Optional[UserStorage]:
        """Update a cloud storage."""
        user_storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not user_storage:
            return None
        
        update_dict = update_data.model_dump(exclude_unset=True)
        if update_dict:
            update_dict["updated_at"] = datetime.utcnow()
            await user_storage.update({"$set": update_dict})
            # Refresh the document
            user_storage = await self.get_user_storage_by_id(storage_id, user_id)
        
        return user_storage
    
    async def delete_user_storage(self, storage_id: ObjectId, user_id: ObjectId) -> bool:
        """Delete a cloud storage and all its data."""
        user_storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not user_storage:
            return False
        
        # Delete all data associated with this storage
        await self._delete_storage_data(storage_id, user_id)
        
        # Delete the storage itself
        await user_storage.delete()
        return True
    
    async def _delete_storage_data(self, storage_id: ObjectId, user_id: ObjectId):
        """Delete all data associated with a storage."""
        # Delete all data from all collections
        await Profile.find(Profile.user_id == user_id, Profile.storage_id == storage_id).delete()
        await Dataset.find(Dataset.user_id == user_id, Dataset.storage_id == storage_id).delete()
        await Text.find(Text.user_id == user_id, Text.storage_id == storage_id).delete()
        await AnnotatedDataset.find(AnnotatedDataset.user_id == user_id, AnnotatedDataset.storage_id == storage_id).delete()
        await AnnotatedText.find(AnnotatedText.user_id == user_id, AnnotatedText.storage_id == storage_id).delete()
        await DataPoint.find(DataPoint.user_id == user_id, DataPoint.storage_id == storage_id).delete()
        await SegmentDataPoint.find(SegmentDataPoint.user_id == user_id, SegmentDataPoint.storage_id == storage_id).delete()
        await ProfilePoint.find(ProfilePoint.user_id == user_id, ProfilePoint.storage_id == storage_id).delete()
        await SegmentationProfilePoint.find(SegmentationProfilePoint.user_id == user_id, SegmentationProfilePoint.storage_id == storage_id).delete()
        await ApiKey.find(ApiKey.user_id == user_id, ApiKey.storage_id == storage_id).delete()
        await Model.find(Model.user_id == user_id, Model.storage_id == storage_id).delete()
        await LLMProvider.find(LLMProvider.user_id == user_id, LLMProvider.storage_id == storage_id).delete()
        await LLMUrl.find(LLMUrl.user_id == user_id, LLMUrl.storage_id == storage_id).delete()
        await BatchSize.find(BatchSize.user_id == user_id, BatchSize.storage_id == storage_id).delete()
        await MaxTokens.find(MaxTokens.user_id == user_id, MaxTokens.storage_id == storage_id).delete()
        await UserSettings.find(UserSettings.user_id == user_id, UserSettings.storage_id == storage_id).delete()
    
    async def migrate_local_to_cloud(self, user_id: ObjectId, storage_name: str, local_data: Dict[str, Any]) -> UserStorage:
        """Migrate local storage data to cloud storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Create the storage first
        user_storage = await self.create_user_storage(user_id, storage_name)
        
        # Import all the data
        await self._import_storage_data(user_storage.id, user_id, local_data)
        
        return user_storage
    
    async def _import_storage_data(self, storage_id: ObjectId, user_id: ObjectId, data: Dict[str, Any]):
        """Import data into a storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Import profiles
        for profile_data in data.get('profiles', []):
            profile = Profile(
                user_id=user_id,
                storage_id=storage_id,
                name=profile_data['name'],
                description=profile_data['description'],
                mode=profile_data['mode'],
                example=profile_data.get('example')
            )
            await profile.insert()
        
        # Import datasets
        for dataset_data in data.get('datasets', []):
            dataset = Dataset(
                user_id=user_id,
                storage_id=storage_id,
                name=dataset_data['name'],
                description=dataset_data['description'],
                mode=dataset_data['mode']
            )
            await dataset.insert()
        
        # Import texts
        for text_data in data.get('texts', []):
            text = Text(
                user_id=user_id,
                storage_id=storage_id,
                dataset_id=ObjectId(text_data['datasetId']),
                filename=text_data['filename'],
                text=text_data['text']
            )
            await text.insert()
        
        # Import annotated datasets
        for annotated_dataset_data in data.get('annotated_datasets', []):
            annotated_dataset = AnnotatedDataset(
                user_id=user_id,
                storage_id=storage_id,
                name=annotated_dataset_data['name'],
                description=annotated_dataset_data['description'],
                dataset_id=ObjectId(annotated_dataset_data['datasetId']),
                profile_id=ObjectId(annotated_dataset_data['profileId']),
                mode=annotated_dataset_data['mode']
            )
            await annotated_dataset.insert()
        
        # Import annotated texts
        for annotated_text_data in data.get('annotated_texts', []):
            annotated_text = AnnotatedText(
                user_id=user_id,
                storage_id=storage_id,
                text_id=ObjectId(annotated_text_data['textId']),
                annotated_dataset_id=ObjectId(annotated_text_data['annotatedDatasetId']),
                verified=annotated_text_data.get('verified'),
                ai_faulty=annotated_text_data.get('aiFaulty')
            )
            await annotated_text.insert()
        
        # Import data points
        for data_point_data in data.get('data_points', []):
            data_point = DataPoint(
                user_id=user_id,
                storage_id=storage_id,
                annotated_text_id=ObjectId(data_point_data['annotatedTextId']),
                name=data_point_data['name'],
                value=data_point_data.get('value'),
                match=data_point_data.get('match'),
                profile_point_id=ObjectId(data_point_data['profilePointId']) if data_point_data.get('profilePointId') else None,
                verified=data_point_data.get('verified')
            )
            await data_point.insert()
        
        # Import segment data points
        for segment_data_point_data in data.get('segment_data_points', []):
            segment_data_point = SegmentDataPoint(
                user_id=user_id,
                storage_id=storage_id,
                annotated_text_id=ObjectId(segment_data_point_data['annotatedTextId']),
                name=segment_data_point_data['name'],
                begin_match=segment_data_point_data.get('beginMatch'),
                end_match=segment_data_point_data.get('endMatch'),
                profile_point_id=ObjectId(segment_data_point_data['profilePointId']) if segment_data_point_data.get('profilePointId') else None,
                verified=segment_data_point_data.get('verified')
            )
            await segment_data_point.insert()
        
        # Import profile points
        for profile_point_data in data.get('profile_points', []):
            profile_point = ProfilePoint(
                user_id=user_id,
                storage_id=storage_id,
                name=profile_point_data['name'],
                explanation=profile_point_data['explanation'],
                synonyms=profile_point_data.get('synonyms', []),
                datatype=profile_point_data['datatype'],
                valueset=profile_point_data.get('valueset'),
                unit=profile_point_data.get('unit'),
                profile_id=ObjectId(profile_point_data['profileId']),
                order=profile_point_data.get('order'),
                previous_point_id=ObjectId(profile_point_data['previousPointId']) if profile_point_data.get('previousPointId') else None,
                next_point_id=ObjectId(profile_point_data['nextPointId']) if profile_point_data.get('nextPointId') else None
            )
            await profile_point.insert()
        
        # Import segmentation profile points
        for segmentation_profile_point_data in data.get('segmentation_profile_points', []):
            segmentation_profile_point = SegmentationProfilePoint(
                user_id=user_id,
                storage_id=storage_id,
                name=segmentation_profile_point_data['name'],
                explanation=segmentation_profile_point_data['explanation'],
                synonyms=segmentation_profile_point_data.get('synonyms', []),
                profile_id=ObjectId(segmentation_profile_point_data['profileId']),
                order=segmentation_profile_point_data.get('order'),
                previous_point_id=ObjectId(segmentation_profile_point_data['previousPointId']) if segmentation_profile_point_data.get('previousPointId') else None,
                next_point_id=ObjectId(segmentation_profile_point_data['nextPointId']) if segmentation_profile_point_data.get('nextPointId') else None
            )
            await segmentation_profile_point.insert()
        
        # Import other data
        for api_key_data in data.get('api_keys', []):
            api_key = ApiKey(
                user_id=user_id,
                storage_id=storage_id,
                key=api_key_data['key']
            )
            await api_key.insert()
        
        for model_data in data.get('models', []):
            model = Model(
                user_id=user_id,
                storage_id=storage_id,
                name=model_data['name']
            )
            await model.insert()
        
        for llm_provider_data in data.get('llm_providers', []):
            llm_provider = LLMProvider(
                user_id=user_id,
                storage_id=storage_id,
                provider=llm_provider_data['provider']
            )
            await llm_provider.insert()
        
        for llm_url_data in data.get('llm_urls', []):
            llm_url = LLMUrl(
                user_id=user_id,
                storage_id=storage_id,
                url=llm_url_data['url']
            )
            await llm_url.insert()
        
        for batch_size_data in data.get('batch_sizes', []):
            batch_size = BatchSize(
                user_id=user_id,
                storage_id=storage_id,
                value=batch_size_data['value']
            )
            await batch_size.insert()
        
        for max_tokens_data in data.get('max_tokens', []):
            max_tokens = MaxTokens(
                user_id=user_id,
                storage_id=storage_id,
                value=max_tokens_data.get('value')
            )
            await max_tokens.insert()
        
        for user_settings_data in data.get('user_settings', []):
            user_settings = UserSettings(
                user_id=user_id,
                storage_id=storage_id,
                tutorial_completed=user_settings_data.get('tutorialCompleted', False)
            )
            await user_settings.insert()
    
    async def export_cloud_to_local_format(self, storage_id: ObjectId, user_id: ObjectId) -> Optional[StorageDataExport]:
        """Export cloud storage data in local database format."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        user_storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not user_storage:
            return None
        
        # Export all data from the storage
        profiles = await Profile.find(Profile.user_id == user_id, Profile.storage_id == storage_id).to_list()
        datasets = await Dataset.find(Dataset.user_id == user_id, Dataset.storage_id == storage_id).to_list()
        texts = await Text.find(Text.user_id == user_id, Text.storage_id == storage_id).to_list()
        annotated_datasets = await AnnotatedDataset.find(AnnotatedDataset.user_id == user_id, AnnotatedDataset.storage_id == storage_id).to_list()
        annotated_texts = await AnnotatedText.find(AnnotatedText.user_id == user_id, AnnotatedText.storage_id == storage_id).to_list()
        data_points = await DataPoint.find(DataPoint.user_id == user_id, DataPoint.storage_id == storage_id).to_list()
        segment_data_points = await SegmentDataPoint.find(SegmentDataPoint.user_id == user_id, SegmentDataPoint.storage_id == storage_id).to_list()
        profile_points = await ProfilePoint.find(ProfilePoint.user_id == user_id, ProfilePoint.storage_id == storage_id).to_list()
        segmentation_profile_points = await SegmentationProfilePoint.find(SegmentationProfilePoint.user_id == user_id, SegmentationProfilePoint.storage_id == storage_id).to_list()
        api_keys = await ApiKey.find(ApiKey.user_id == user_id, ApiKey.storage_id == storage_id).to_list()
        models = await Model.find(Model.user_id == user_id, Model.storage_id == storage_id).to_list()
        llm_providers = await LLMProvider.find(LLMProvider.user_id == user_id, LLMProvider.storage_id == storage_id).to_list()
        llm_urls = await LLMUrl.find(LLMUrl.user_id == user_id, LLMUrl.storage_id == storage_id).to_list()
        batch_sizes = await BatchSize.find(BatchSize.user_id == user_id, BatchSize.storage_id == storage_id).to_list()
        max_tokens = await MaxTokens.find(MaxTokens.user_id == user_id, MaxTokens.storage_id == storage_id).to_list()
        user_settings = await UserSettings.find(UserSettings.user_id == user_id, UserSettings.storage_id == storage_id).to_list()
        
        return StorageDataExport(
            profiles=[profile.model_dump() for profile in profiles],
            datasets=[dataset.model_dump() for dataset in datasets],
            texts=[text.model_dump() for text in texts],
            annotated_datasets=[annotated_dataset.model_dump() for annotated_dataset in annotated_datasets],
            annotated_texts=[annotated_text.model_dump() for annotated_text in annotated_texts],
            data_points=[data_point.model_dump() for data_point in data_points],
            segment_data_points=[segment_data_point.model_dump() for segment_data_point in segment_data_points],
            profile_points=[profile_point.model_dump() for profile_point in profile_points],
            segmentation_profile_points=[segmentation_profile_point.model_dump() for segmentation_profile_point in segmentation_profile_points],
            api_keys=[api_key.model_dump() for api_key in api_keys],
            models=[model.model_dump() for model in models],
            llm_providers=[llm_provider.model_dump() for llm_provider in llm_providers],
            llm_urls=[llm_url.model_dump() for llm_url in llm_urls],
            batch_sizes=[batch_size.model_dump() for batch_size in batch_sizes],
            max_tokens=[max_tokens.model_dump() for max_tokens in max_tokens],
            user_settings=[user_settings.model_dump() for user_settings in user_settings]
        )
    
    # Individual Profile CRUD operations
    async def create_profile(self, storage_id: ObjectId, user_id: ObjectId, profile_data: dict) -> Profile:
        """Create a new profile in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Create the profile
        profile = Profile(
            user_id=user_id,
            storage_id=storage_id,
            name=profile_data['name'],
            description=profile_data['description'],
            mode=profile_data['mode'],
            example=profile_data.get('example')
        )
        await profile.insert()
        return profile
    
    async def get_profiles(self, storage_id: ObjectId, user_id: ObjectId) -> List[Profile]:
        """Get all profiles from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get all profiles for this storage
        profiles = await Profile.find(Profile.user_id == user_id, Profile.storage_id == storage_id).to_list()
        return profiles
    
    async def update_profile(self, storage_id: ObjectId, profile_id: ObjectId, user_id: ObjectId, profile_data: dict) -> Profile:
        """Update a profile in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the profile
        profile = await Profile.find_one(Profile.id == profile_id, Profile.user_id == user_id, Profile.storage_id == storage_id)
        if not profile:
            raise ValueError("Profile not found or access denied")
        
        # Update the profile
        for field, value in profile_data.items():
            if hasattr(profile, field):
                setattr(profile, field, value)
        
        await profile.save()
        return profile
    
    async def delete_profile(self, storage_id: ObjectId, profile_id: ObjectId, user_id: ObjectId) -> None:
        """Delete a profile from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the profile
        profile = await Profile.find_one(Profile.id == profile_id, Profile.user_id == user_id, Profile.storage_id == storage_id)
        if not profile:
            raise ValueError("Profile not found or access denied")
        
        # Delete the profile
        await profile.delete()
    
    # Individual Dataset CRUD operations
    async def create_dataset(self, storage_id: ObjectId, user_id: ObjectId, dataset_data: dict) -> Dataset:
        """Create a new dataset in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Create the dataset
        dataset = Dataset(
            user_id=user_id,
            storage_id=storage_id,
            name=dataset_data['name'],
            description=dataset_data['description'],
            mode=dataset_data['mode']
        )
        await dataset.insert()
        return dataset
    
    async def get_datasets(self, storage_id: ObjectId, user_id: ObjectId) -> List[Dataset]:
        """Get all datasets from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get all datasets for this storage
        datasets = await Dataset.find(Dataset.user_id == user_id, Dataset.storage_id == storage_id).to_list()
        return datasets
    
    async def update_dataset(self, storage_id: ObjectId, dataset_id: ObjectId, user_id: ObjectId, dataset_data: dict) -> Dataset:
        """Update a dataset in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the dataset
        dataset = await Dataset.find_one(Dataset.id == dataset_id, Dataset.user_id == user_id, Dataset.storage_id == storage_id)
        if not dataset:
            raise ValueError("Dataset not found or access denied")
        
        # Update the dataset
        for field, value in dataset_data.items():
            if hasattr(dataset, field):
                setattr(dataset, field, value)
        
        await dataset.save()
        return dataset
    
    async def delete_dataset(self, storage_id: ObjectId, dataset_id: ObjectId, user_id: ObjectId) -> None:
        """Delete a dataset from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the dataset
        dataset = await Dataset.find_one(Dataset.id == dataset_id, Dataset.user_id == user_id, Dataset.storage_id == storage_id)
        if not dataset:
            raise ValueError("Dataset not found or access denied")
        
        # Delete the dataset
        await dataset.delete()
    
    # Individual DataPoint CRUD operations
    async def create_data_point(self, storage_id: ObjectId, user_id: ObjectId, data_point_data: dict) -> DataPoint:
        """Create a new data point in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Create the data point
        data_point = DataPoint(
            user_id=user_id,
            storage_id=storage_id,
            annotated_text_id=ObjectId(data_point_data['annotated_text_id']),
            name=data_point_data['name'],
            value=data_point_data.get('value'),
            match=data_point_data.get('match'),
            profile_point_id=ObjectId(data_point_data['profile_point_id']) if data_point_data.get('profile_point_id') else None,
            verified=data_point_data.get('verified')
        )
        await data_point.insert()
        return data_point
    
    async def get_data_points(self, storage_id: ObjectId, user_id: ObjectId) -> List[DataPoint]:
        """Get all data points from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get all data points for this storage
        data_points = await DataPoint.find(DataPoint.user_id == user_id, DataPoint.storage_id == storage_id).to_list()
        return data_points
    
    async def get_data_points_by_annotated_text(self, storage_id: ObjectId, annotated_text_id: ObjectId, user_id: ObjectId) -> List[DataPoint]:
        """Get all data points for a specific annotated text."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get data points for this annotated text
        data_points = await DataPoint.find(
            DataPoint.user_id == user_id, 
            DataPoint.storage_id == storage_id,
            DataPoint.annotated_text_id == annotated_text_id
        ).to_list()
        return data_points
    
    async def update_data_point(self, storage_id: ObjectId, data_point_id: ObjectId, user_id: ObjectId, data_point_data: dict) -> DataPoint:
        """Update a data point in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the data point
        data_point = await DataPoint.find_one(DataPoint.id == data_point_id, DataPoint.user_id == user_id, DataPoint.storage_id == storage_id)
        if not data_point:
            raise ValueError("Data point not found or access denied")
        
        # Update the data point
        for field, value in data_point_data.items():
            if hasattr(data_point, field):
                if field in ['annotated_text_id', 'profile_point_id'] and value:
                    setattr(data_point, field, ObjectId(value))
                else:
                    setattr(data_point, field, value)
        
        await data_point.save()
        return data_point
    
    async def delete_data_point(self, storage_id: ObjectId, data_point_id: ObjectId, user_id: ObjectId) -> None:
        """Delete a data point from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the data point
        data_point = await DataPoint.find_one(DataPoint.id == data_point_id, DataPoint.user_id == user_id, DataPoint.storage_id == storage_id)
        if not data_point:
            raise ValueError("Data point not found or access denied")
        
        # Delete the data point
        await data_point.delete()
    
    # Individual SegmentDataPoint CRUD operations
    async def create_segment_data_point(self, storage_id: ObjectId, user_id: ObjectId, segment_data_point_data: dict) -> SegmentDataPoint:
        """Create a new segment data point in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Create the segment data point
        segment_data_point = SegmentDataPoint(
            user_id=user_id,
            storage_id=storage_id,
            annotated_text_id=ObjectId(segment_data_point_data['annotated_text_id']),
            name=segment_data_point_data['name'],
            begin_match=segment_data_point_data.get('begin_match'),
            end_match=segment_data_point_data.get('end_match'),
            profile_point_id=ObjectId(segment_data_point_data['profile_point_id']) if segment_data_point_data.get('profile_point_id') else None,
            verified=segment_data_point_data.get('verified')
        )
        await segment_data_point.insert()
        return segment_data_point
    
    async def get_segment_data_points(self, storage_id: ObjectId, user_id: ObjectId) -> List[SegmentDataPoint]:
        """Get all segment data points from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get all segment data points for this storage
        segment_data_points = await SegmentDataPoint.find(SegmentDataPoint.user_id == user_id, SegmentDataPoint.storage_id == storage_id).to_list()
        return segment_data_points
    
    async def get_segment_data_points_by_annotated_text(self, storage_id: ObjectId, annotated_text_id: ObjectId, user_id: ObjectId) -> List[SegmentDataPoint]:
        """Get all segment data points for a specific annotated text."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get segment data points for this annotated text
        segment_data_points = await SegmentDataPoint.find(
            SegmentDataPoint.user_id == user_id, 
            SegmentDataPoint.storage_id == storage_id,
            SegmentDataPoint.annotated_text_id == annotated_text_id
        ).to_list()
        return segment_data_points
    
    async def update_segment_data_point(self, storage_id: ObjectId, segment_data_point_id: ObjectId, user_id: ObjectId, segment_data_point_data: dict) -> SegmentDataPoint:
        """Update a segment data point in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the segment data point
        segment_data_point = await SegmentDataPoint.find_one(SegmentDataPoint.id == segment_data_point_id, SegmentDataPoint.user_id == user_id, SegmentDataPoint.storage_id == storage_id)
        if not segment_data_point:
            raise ValueError("Segment data point not found or access denied")
        
        # Update the segment data point
        for field, value in segment_data_point_data.items():
            if hasattr(segment_data_point, field):
                if field in ['annotated_text_id', 'profile_point_id'] and value:
                    setattr(segment_data_point, field, ObjectId(value))
                else:
                    setattr(segment_data_point, field, value)
        
        await segment_data_point.save()
        return segment_data_point
    
    async def delete_segment_data_point(self, storage_id: ObjectId, segment_data_point_id: ObjectId, user_id: ObjectId) -> None:
        """Delete a segment data point from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the segment data point
        segment_data_point = await SegmentDataPoint.find_one(SegmentDataPoint.id == segment_data_point_id, SegmentDataPoint.user_id == user_id, SegmentDataPoint.storage_id == storage_id)
        if not segment_data_point:
            raise ValueError("Segment data point not found or access denied")
        
        # Delete the segment data point
        await segment_data_point.delete()
    
    # Individual ProfilePoint CRUD operations
    async def create_profile_point(self, storage_id: ObjectId, user_id: ObjectId, profile_point_data: dict) -> ProfilePoint:
        """Create a new profile point in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Create the profile point
        profile_point = ProfilePoint(
            user_id=user_id,
            storage_id=storage_id,
            name=profile_point_data['name'],
            explanation=profile_point_data['explanation'],
            synonyms=profile_point_data.get('synonyms', []),
            datatype=profile_point_data['datatype'],
            valueset=profile_point_data.get('valueset'),
            unit=profile_point_data.get('unit'),
            profile_id=ObjectId(profile_point_data['profile_id']),
            order=profile_point_data.get('order'),
            previous_point_id=ObjectId(profile_point_data['previous_point_id']) if profile_point_data.get('previous_point_id') else None,
            next_point_id=ObjectId(profile_point_data['next_point_id']) if profile_point_data.get('next_point_id') else None
        )
        await profile_point.insert()
        return profile_point
    
    async def get_profile_points(self, storage_id: ObjectId, user_id: ObjectId) -> List[ProfilePoint]:
        """Get all profile points from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get all profile points for this storage
        profile_points = await ProfilePoint.find(ProfilePoint.user_id == user_id, ProfilePoint.storage_id == storage_id).to_list()
        return profile_points
    
    async def get_profile_points_by_profile(self, storage_id: ObjectId, profile_id: ObjectId, user_id: ObjectId) -> List[ProfilePoint]:
        """Get all profile points for a specific profile."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get profile points for this profile
        profile_points = await ProfilePoint.find(
            ProfilePoint.user_id == user_id, 
            ProfilePoint.storage_id == storage_id,
            ProfilePoint.profile_id == profile_id
        ).to_list()
        return profile_points
    
    async def update_profile_point(self, storage_id: ObjectId, profile_point_id: ObjectId, user_id: ObjectId, profile_point_data: dict) -> ProfilePoint:
        """Update a profile point in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the profile point
        profile_point = await ProfilePoint.find_one(ProfilePoint.id == profile_point_id, ProfilePoint.user_id == user_id, ProfilePoint.storage_id == storage_id)
        if not profile_point:
            raise ValueError("Profile point not found or access denied")
        
        # Update the profile point
        for field, value in profile_point_data.items():
            if hasattr(profile_point, field):
                if field in ['profile_id', 'previous_point_id', 'next_point_id'] and value:
                    setattr(profile_point, field, ObjectId(value))
                else:
                    setattr(profile_point, field, value)
        
        await profile_point.save()
        return profile_point
    
    async def delete_profile_point(self, storage_id: ObjectId, profile_point_id: ObjectId, user_id: ObjectId) -> None:
        """Delete a profile point from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the profile point
        profile_point = await ProfilePoint.find_one(ProfilePoint.id == profile_point_id, ProfilePoint.user_id == user_id, ProfilePoint.storage_id == storage_id)
        if not profile_point:
            raise ValueError("Profile point not found or access denied")
        
        # Delete the profile point
        await profile_point.delete()
    
    # Individual SegmentationProfilePoint CRUD operations
    async def create_segmentation_profile_point(self, storage_id: ObjectId, user_id: ObjectId, segmentation_profile_point_data: dict) -> SegmentationProfilePoint:
        """Create a new segmentation profile point in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Create the segmentation profile point
        segmentation_profile_point = SegmentationProfilePoint(
            user_id=user_id,
            storage_id=storage_id,
            name=segmentation_profile_point_data['name'],
            explanation=segmentation_profile_point_data['explanation'],
            synonyms=segmentation_profile_point_data.get('synonyms', []),
            profile_id=ObjectId(segmentation_profile_point_data['profile_id']),
            order=segmentation_profile_point_data.get('order'),
            previous_point_id=ObjectId(segmentation_profile_point_data['previous_point_id']) if segmentation_profile_point_data.get('previous_point_id') else None,
            next_point_id=ObjectId(segmentation_profile_point_data['next_point_id']) if segmentation_profile_point_data.get('next_point_id') else None
        )
        await segmentation_profile_point.insert()
        return segmentation_profile_point
    
    async def get_segmentation_profile_points(self, storage_id: ObjectId, user_id: ObjectId) -> List[SegmentationProfilePoint]:
        """Get all segmentation profile points from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get all segmentation profile points for this storage
        segmentation_profile_points = await SegmentationProfilePoint.find(SegmentationProfilePoint.user_id == user_id, SegmentationProfilePoint.storage_id == storage_id).to_list()
        return segmentation_profile_points
    
    async def get_segmentation_profile_points_by_profile(self, storage_id: ObjectId, profile_id: ObjectId, user_id: ObjectId) -> List[SegmentationProfilePoint]:
        """Get all segmentation profile points for a specific profile."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get segmentation profile points for this profile
        segmentation_profile_points = await SegmentationProfilePoint.find(
            SegmentationProfilePoint.user_id == user_id, 
            SegmentationProfilePoint.storage_id == storage_id,
            SegmentationProfilePoint.profile_id == profile_id
        ).to_list()
        return segmentation_profile_points
    
    async def update_segmentation_profile_point(self, storage_id: ObjectId, segmentation_profile_point_id: ObjectId, user_id: ObjectId, segmentation_profile_point_data: dict) -> SegmentationProfilePoint:
        """Update a segmentation profile point in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the segmentation profile point
        segmentation_profile_point = await SegmentationProfilePoint.find_one(SegmentationProfilePoint.id == segmentation_profile_point_id, SegmentationProfilePoint.user_id == user_id, SegmentationProfilePoint.storage_id == storage_id)
        if not segmentation_profile_point:
            raise ValueError("Segmentation profile point not found or access denied")
        
        # Update the segmentation profile point
        for field, value in segmentation_profile_point_data.items():
            if hasattr(segmentation_profile_point, field):
                if field in ['profile_id', 'previous_point_id', 'next_point_id'] and value:
                    setattr(segmentation_profile_point, field, ObjectId(value))
                else:
                    setattr(segmentation_profile_point, field, value)
        
        await segmentation_profile_point.save()
        return segmentation_profile_point
    
    async def delete_segmentation_profile_point(self, storage_id: ObjectId, segmentation_profile_point_id: ObjectId, user_id: ObjectId) -> None:
        """Delete a segmentation profile point from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the segmentation profile point
        segmentation_profile_point = await SegmentationProfilePoint.find_one(SegmentationProfilePoint.id == segmentation_profile_point_id, SegmentationProfilePoint.user_id == user_id, SegmentationProfilePoint.storage_id == storage_id)
        if not segmentation_profile_point:
            raise ValueError("Segmentation profile point not found or access denied")
        
        # Delete the segmentation profile point
        await segmentation_profile_point.delete()
    
    # Individual Text CRUD operations
    async def create_text(self, storage_id: ObjectId, user_id: ObjectId, text_data: dict) -> Text:
        """Create a new text in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Create the text
        text = Text(
            user_id=user_id,
            storage_id=storage_id,
            dataset_id=ObjectId(text_data['dataset_id']),
            filename=text_data['filename'],
            text=text_data['text']
        )
        await text.insert()
        return text
    
    async def get_texts(self, storage_id: ObjectId, user_id: ObjectId) -> List[Text]:
        """Get all texts from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get all texts for this storage
        texts = await Text.find(Text.user_id == user_id, Text.storage_id == storage_id).to_list()
        return texts
    
    async def get_texts_by_dataset(self, storage_id: ObjectId, dataset_id: ObjectId, user_id: ObjectId) -> List[Text]:
        """Get all texts for a specific dataset."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get texts for this dataset
        texts = await Text.find(
            Text.user_id == user_id, 
            Text.storage_id == storage_id,
            Text.dataset_id == dataset_id
        ).to_list()
        return texts
    
    async def update_text(self, storage_id: ObjectId, text_id: ObjectId, user_id: ObjectId, text_data: dict) -> Text:
        """Update a text in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the text
        text = await Text.find_one(Text.id == text_id, Text.user_id == user_id, Text.storage_id == storage_id)
        if not text:
            raise ValueError("Text not found or access denied")
        
        # Update the text
        for field, value in text_data.items():
            if hasattr(text, field):
                if field == 'dataset_id' and value:
                    setattr(text, field, ObjectId(value))
                else:
                    setattr(text, field, value)
        
        await text.save()
        return text
    
    async def delete_text(self, storage_id: ObjectId, text_id: ObjectId, user_id: ObjectId) -> None:
        """Delete a text from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the text
        text = await Text.find_one(Text.id == text_id, Text.user_id == user_id, Text.storage_id == storage_id)
        if not text:
            raise ValueError("Text not found or access denied")
        
        # Delete the text
        await text.delete()
    
    # Individual AnnotatedDataset CRUD operations
    async def create_annotated_dataset(self, storage_id: ObjectId, user_id: ObjectId, annotated_dataset_data: dict) -> AnnotatedDataset:
        """Create a new annotated dataset in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Create the annotated dataset
        annotated_dataset = AnnotatedDataset(
            user_id=user_id,
            storage_id=storage_id,
            name=annotated_dataset_data['name'],
            description=annotated_dataset_data['description'],
            dataset_id=ObjectId(annotated_dataset_data['dataset_id']),
            profile_id=ObjectId(annotated_dataset_data['profile_id']),
            mode=annotated_dataset_data['mode']
        )
        await annotated_dataset.insert()
        return annotated_dataset
    
    async def get_annotated_datasets(self, storage_id: ObjectId, user_id: ObjectId) -> List[AnnotatedDataset]:
        """Get all annotated datasets from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get all annotated datasets for this storage
        annotated_datasets = await AnnotatedDataset.find(AnnotatedDataset.user_id == user_id, AnnotatedDataset.storage_id == storage_id).to_list()
        return annotated_datasets
    
    async def get_annotated_datasets_by_dataset(self, storage_id: ObjectId, dataset_id: ObjectId, user_id: ObjectId) -> List[AnnotatedDataset]:
        """Get all annotated datasets for a specific dataset."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get annotated datasets for this dataset
        annotated_datasets = await AnnotatedDataset.find(
            AnnotatedDataset.user_id == user_id, 
            AnnotatedDataset.storage_id == storage_id,
            AnnotatedDataset.dataset_id == dataset_id
        ).to_list()
        return annotated_datasets
    
    async def update_annotated_dataset(self, storage_id: ObjectId, annotated_dataset_id: ObjectId, user_id: ObjectId, annotated_dataset_data: dict) -> AnnotatedDataset:
        """Update an annotated dataset in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the annotated dataset
        annotated_dataset = await AnnotatedDataset.find_one(AnnotatedDataset.id == annotated_dataset_id, AnnotatedDataset.user_id == user_id, AnnotatedDataset.storage_id == storage_id)
        if not annotated_dataset:
            raise ValueError("Annotated dataset not found or access denied")
        
        # Update the annotated dataset
        for field, value in annotated_dataset_data.items():
            if hasattr(annotated_dataset, field):
                if field in ['dataset_id', 'profile_id'] and value:
                    setattr(annotated_dataset, field, ObjectId(value))
                else:
                    setattr(annotated_dataset, field, value)
        
        await annotated_dataset.save()
        return annotated_dataset
    
    async def delete_annotated_dataset(self, storage_id: ObjectId, annotated_dataset_id: ObjectId, user_id: ObjectId) -> None:
        """Delete an annotated dataset from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the annotated dataset
        annotated_dataset = await AnnotatedDataset.find_one(AnnotatedDataset.id == annotated_dataset_id, AnnotatedDataset.user_id == user_id, AnnotatedDataset.storage_id == storage_id)
        if not annotated_dataset:
            raise ValueError("Annotated dataset not found or access denied")
        
        # Delete the annotated dataset
        await annotated_dataset.delete()
    
    # Individual AnnotatedText CRUD operations
    async def create_annotated_text(self, storage_id: ObjectId, user_id: ObjectId, annotated_text_data: dict) -> AnnotatedText:
        """Create a new annotated text in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Create the annotated text
        annotated_text = AnnotatedText(
            user_id=user_id,
            storage_id=storage_id,
            text_id=ObjectId(annotated_text_data['text_id']),
            annotated_dataset_id=ObjectId(annotated_text_data['annotated_dataset_id']),
            verified=annotated_text_data.get('verified'),
            ai_faulty=annotated_text_data.get('ai_faulty')
        )
        await annotated_text.insert()
        return annotated_text
    
    async def get_annotated_texts(self, storage_id: ObjectId, user_id: ObjectId) -> List[AnnotatedText]:
        """Get all annotated texts from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get all annotated texts for this storage
        annotated_texts = await AnnotatedText.find(AnnotatedText.user_id == user_id, AnnotatedText.storage_id == storage_id).to_list()
        return annotated_texts
    
    async def get_annotated_texts_by_dataset(self, storage_id: ObjectId, annotated_dataset_id: ObjectId, user_id: ObjectId) -> List[AnnotatedText]:
        """Get all annotated texts for a specific annotated dataset."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Verify the storage belongs to the user
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        # Get annotated texts for this annotated dataset
        annotated_texts = await AnnotatedText.find(
            AnnotatedText.user_id == user_id, 
            AnnotatedText.storage_id == storage_id,
            AnnotatedText.annotated_dataset_id == annotated_dataset_id
        ).to_list()
        return annotated_texts
    
    async def update_annotated_text(self, storage_id: ObjectId, annotated_text_id: ObjectId, user_id: ObjectId, annotated_text_data: dict) -> AnnotatedText:
        """Update an annotated text in the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the annotated text
        annotated_text = await AnnotatedText.find_one(AnnotatedText.id == annotated_text_id, AnnotatedText.user_id == user_id, AnnotatedText.storage_id == storage_id)
        if not annotated_text:
            raise ValueError("Annotated text not found or access denied")
        
        # Update the annotated text
        for field, value in annotated_text_data.items():
            if hasattr(annotated_text, field):
                if field in ['text_id', 'annotated_dataset_id'] and value:
                    setattr(annotated_text, field, ObjectId(value))
                else:
                    setattr(annotated_text, field, value)
        
        await annotated_text.save()
        return annotated_text
    
    async def delete_annotated_text(self, storage_id: ObjectId, annotated_text_id: ObjectId, user_id: ObjectId) -> None:
        """Delete an annotated text from the specified storage."""
        # Ensure user_id is an ObjectId
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        # Find the annotated text
        annotated_text = await AnnotatedText.find_one(AnnotatedText.id == annotated_text_id, AnnotatedText.user_id == user_id, AnnotatedText.storage_id == storage_id)
        if not annotated_text:
            raise ValueError("Annotated text not found or access denied")
        
        # Delete the annotated text
        await annotated_text.delete()
    
    # Settings CRUD operations
    # ApiKey CRUD operations
    async def create_api_key(self, storage_id: ObjectId, user_id: ObjectId, api_key_data: dict) -> ApiKey:
        """Create a new API key in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        api_key = ApiKey(
            user_id=user_id,
            storage_id=storage_id,
            key=api_key_data['key']
        )
        await api_key.insert()
        return api_key
    
    async def get_api_keys(self, storage_id: ObjectId, user_id: ObjectId) -> List[ApiKey]:
        """Get all API keys from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        api_keys = await ApiKey.find(ApiKey.user_id == user_id, ApiKey.storage_id == storage_id).to_list()
        return api_keys
    
    async def update_api_key(self, storage_id: ObjectId, api_key_id: ObjectId, user_id: ObjectId, api_key_data: dict) -> ApiKey:
        """Update an API key in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        api_key = await ApiKey.find_one(ApiKey.id == api_key_id, ApiKey.user_id == user_id, ApiKey.storage_id == storage_id)
        if not api_key:
            raise ValueError("API key not found or access denied")
        
        for field, value in api_key_data.items():
            if hasattr(api_key, field):
                setattr(api_key, field, value)
        
        await api_key.save()
        return api_key
    
    async def delete_api_key(self, storage_id: ObjectId, api_key_id: ObjectId, user_id: ObjectId) -> None:
        """Delete an API key from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        api_key = await ApiKey.find_one(ApiKey.id == api_key_id, ApiKey.user_id == user_id, ApiKey.storage_id == storage_id)
        if not api_key:
            raise ValueError("API key not found or access denied")
        
        await api_key.delete()
    
    # Model CRUD operations
    async def create_model(self, storage_id: ObjectId, user_id: ObjectId, model_data: dict) -> Model:
        """Create a new model in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        model = Model(
            user_id=user_id,
            storage_id=storage_id,
            name=model_data['name']
        )
        await model.insert()
        return model
    
    async def get_models(self, storage_id: ObjectId, user_id: ObjectId) -> List[Model]:
        """Get all models from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        models = await Model.find(Model.user_id == user_id, Model.storage_id == storage_id).to_list()
        return models
    
    async def update_model(self, storage_id: ObjectId, model_id: ObjectId, user_id: ObjectId, model_data: dict) -> Model:
        """Update a model in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        model = await Model.find_one(Model.id == model_id, Model.user_id == user_id, Model.storage_id == storage_id)
        if not model:
            raise ValueError("Model not found or access denied")
        
        for field, value in model_data.items():
            if hasattr(model, field):
                setattr(model, field, value)
        
        await model.save()
        return model
    
    async def delete_model(self, storage_id: ObjectId, model_id: ObjectId, user_id: ObjectId) -> None:
        """Delete a model from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        model = await Model.find_one(Model.id == model_id, Model.user_id == user_id, Model.storage_id == storage_id)
        if not model:
            raise ValueError("Model not found or access denied")
        
        await model.delete()
    
    # LLMProvider CRUD operations
    async def create_llm_provider(self, storage_id: ObjectId, user_id: ObjectId, provider_data: dict) -> LLMProvider:
        """Create a new LLM provider in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        provider = LLMProvider(
            user_id=user_id,
            storage_id=storage_id,
            provider=provider_data['provider']
        )
        await provider.insert()
        return provider
    
    async def get_llm_providers(self, storage_id: ObjectId, user_id: ObjectId) -> List[LLMProvider]:
        """Get all LLM providers from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        providers = await LLMProvider.find(LLMProvider.user_id == user_id, LLMProvider.storage_id == storage_id).to_list()
        return providers
    
    async def update_llm_provider(self, storage_id: ObjectId, provider_id: ObjectId, user_id: ObjectId, provider_data: dict) -> LLMProvider:
        """Update an LLM provider in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        provider = await LLMProvider.find_one(LLMProvider.id == provider_id, LLMProvider.user_id == user_id, LLMProvider.storage_id == storage_id)
        if not provider:
            raise ValueError("LLM provider not found or access denied")
        
        for field, value in provider_data.items():
            if hasattr(provider, field):
                setattr(provider, field, value)
        
        await provider.save()
        return provider
    
    async def delete_llm_provider(self, storage_id: ObjectId, provider_id: ObjectId, user_id: ObjectId) -> None:
        """Delete an LLM provider from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        provider = await LLMProvider.find_one(LLMProvider.id == provider_id, LLMProvider.user_id == user_id, LLMProvider.storage_id == storage_id)
        if not provider:
            raise ValueError("LLM provider not found or access denied")
        
        await provider.delete()
    
    # LLMUrl CRUD operations
    async def create_llm_url(self, storage_id: ObjectId, user_id: ObjectId, url_data: dict) -> LLMUrl:
        """Create a new LLM URL in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        url = LLMUrl(
            user_id=user_id,
            storage_id=storage_id,
            url=url_data['url']
        )
        await url.insert()
        return url
    
    async def get_llm_urls(self, storage_id: ObjectId, user_id: ObjectId) -> List[LLMUrl]:
        """Get all LLM URLs from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        urls = await LLMUrl.find(LLMUrl.user_id == user_id, LLMUrl.storage_id == storage_id).to_list()
        return urls
    
    async def update_llm_url(self, storage_id: ObjectId, url_id: ObjectId, user_id: ObjectId, url_data: dict) -> LLMUrl:
        """Update an LLM URL in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        url = await LLMUrl.find_one(LLMUrl.id == url_id, LLMUrl.user_id == user_id, LLMUrl.storage_id == storage_id)
        if not url:
            raise ValueError("LLM URL not found or access denied")
        
        for field, value in url_data.items():
            if hasattr(url, field):
                setattr(url, field, value)
        
        await url.save()
        return url
    
    async def delete_llm_url(self, storage_id: ObjectId, url_id: ObjectId, user_id: ObjectId) -> None:
        """Delete an LLM URL from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        url = await LLMUrl.find_one(LLMUrl.id == url_id, LLMUrl.user_id == user_id, LLMUrl.storage_id == storage_id)
        if not url:
            raise ValueError("LLM URL not found or access denied")
        
        await url.delete()
    
    # BatchSize CRUD operations
    async def create_batch_size(self, storage_id: ObjectId, user_id: ObjectId, batch_size_data: dict) -> BatchSize:
        """Create a new batch size in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        batch_size = BatchSize(
            user_id=user_id,
            storage_id=storage_id,
            value=batch_size_data['value']
        )
        await batch_size.insert()
        return batch_size
    
    async def get_batch_sizes(self, storage_id: ObjectId, user_id: ObjectId) -> List[BatchSize]:
        """Get all batch sizes from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        batch_sizes = await BatchSize.find(BatchSize.user_id == user_id, BatchSize.storage_id == storage_id).to_list()
        return batch_sizes
    
    async def update_batch_size(self, storage_id: ObjectId, batch_size_id: ObjectId, user_id: ObjectId, batch_size_data: dict) -> BatchSize:
        """Update a batch size in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        batch_size = await BatchSize.find_one(BatchSize.id == batch_size_id, BatchSize.user_id == user_id, BatchSize.storage_id == storage_id)
        if not batch_size:
            raise ValueError("Batch size not found or access denied")
        
        for field, value in batch_size_data.items():
            if hasattr(batch_size, field):
                setattr(batch_size, field, value)
        
        await batch_size.save()
        return batch_size
    
    async def delete_batch_size(self, storage_id: ObjectId, batch_size_id: ObjectId, user_id: ObjectId) -> None:
        """Delete a batch size from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        batch_size = await BatchSize.find_one(BatchSize.id == batch_size_id, BatchSize.user_id == user_id, BatchSize.storage_id == storage_id)
        if not batch_size:
            raise ValueError("Batch size not found or access denied")
        
        await batch_size.delete()
    
    # MaxTokens CRUD operations
    async def create_max_tokens(self, storage_id: ObjectId, user_id: ObjectId, max_tokens_data: dict) -> MaxTokens:
        """Create a new max tokens in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        max_tokens = MaxTokens(
            user_id=user_id,
            storage_id=storage_id,
            value=max_tokens_data.get('value')
        )
        await max_tokens.insert()
        return max_tokens
    
    async def get_max_tokens(self, storage_id: ObjectId, user_id: ObjectId) -> List[MaxTokens]:
        """Get all max tokens from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        max_tokens = await MaxTokens.find(MaxTokens.user_id == user_id, MaxTokens.storage_id == storage_id).to_list()
        return max_tokens
    
    async def update_max_tokens(self, storage_id: ObjectId, max_tokens_id: ObjectId, user_id: ObjectId, max_tokens_data: dict) -> MaxTokens:
        """Update max tokens in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        max_tokens = await MaxTokens.find_one(MaxTokens.id == max_tokens_id, MaxTokens.user_id == user_id, MaxTokens.storage_id == storage_id)
        if not max_tokens:
            raise ValueError("Max tokens not found or access denied")
        
        for field, value in max_tokens_data.items():
            if hasattr(max_tokens, field):
                setattr(max_tokens, field, value)
        
        await max_tokens.save()
        return max_tokens
    
    async def delete_max_tokens(self, storage_id: ObjectId, max_tokens_id: ObjectId, user_id: ObjectId) -> None:
        """Delete max tokens from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        max_tokens = await MaxTokens.find_one(MaxTokens.id == max_tokens_id, MaxTokens.user_id == user_id, MaxTokens.storage_id == storage_id)
        if not max_tokens:
            raise ValueError("Max tokens not found or access denied")
        
        await max_tokens.delete()
    
    # UserSettings CRUD operations
    async def create_user_settings(self, storage_id: ObjectId, user_id: ObjectId, settings_data: dict) -> UserSettings:
        """Create new user settings in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        settings = UserSettings(
            user_id=user_id,
            storage_id=storage_id,
            tutorial_completed=settings_data.get('tutorial_completed', False)
        )
        await settings.insert()
        return settings
    
    async def get_user_settings(self, storage_id: ObjectId, user_id: ObjectId) -> List[UserSettings]:
        """Get all user settings from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        storage = await self.get_user_storage_by_id(storage_id, user_id)
        if not storage:
            raise ValueError("Storage not found or access denied")
        
        settings = await UserSettings.find(UserSettings.user_id == user_id, UserSettings.storage_id == storage_id).to_list()
        return settings
    
    async def update_user_settings(self, storage_id: ObjectId, settings_id: ObjectId, user_id: ObjectId, settings_data: dict) -> UserSettings:
        """Update user settings in the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        settings = await UserSettings.find_one(UserSettings.id == settings_id, UserSettings.user_id == user_id, UserSettings.storage_id == storage_id)
        if not settings:
            raise ValueError("User settings not found or access denied")
        
        for field, value in settings_data.items():
            if hasattr(settings, field):
                setattr(settings, field, value)
        
        await settings.save()
        return settings
    
    async def delete_user_settings(self, storage_id: ObjectId, settings_id: ObjectId, user_id: ObjectId) -> None:
        """Delete user settings from the specified storage."""
        if isinstance(user_id, str):
            user_id = ObjectId(user_id)
        
        settings = await UserSettings.find_one(UserSettings.id == settings_id, UserSettings.user_id == user_id, UserSettings.storage_id == storage_id)
        if not settings:
            raise ValueError("User settings not found or access denied")
        
        await settings.delete()