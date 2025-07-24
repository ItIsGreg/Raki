import { 
  CloudDataService, 
  CloudProfile, 
  CloudProfileCreate, 
  CloudProfilePoint, 
  CloudProfilePointCreate,
  CloudDataset,
  CloudDatasetCreate,
  CloudText,
  CloudTextCreate,
  CloudAnnotatedDataset,
  CloudAnnotatedDatasetCreate,
  CloudUserSettings,
  CloudUserSettingsCreate,
  CloudUserLLMConfig,
  CloudUserLLMConfigCreate
} from './cloudDataService';
import {
  createProfile as createLocalProfile,
  readProfile as readLocalProfile,
  readProfilesByMode,
  updateProfile as updateLocalProfile,
  deleteProfile as deleteLocalProfile,
  createProfilePoint as createLocalProfilePoint,
  readProfilePointsByProfile as readLocalProfilePoints,
  createDataset as createLocalDataset,
  readAllDatasets as readLocalDatasets,
  readDataset as readLocalDataset,
  deleteDataset as deleteLocalDataset,
  createText as createLocalText,
  readTextsByDataset as readLocalTextsByDataset,
  createAnnotatedDataset as createLocalAnnotatedDataset,
  readAnnotatedDatasetsByMode as readLocalAnnotatedDatasetsByMode,
  getUserSettings as getLocalUserSettings,
  updateUserSettings as updateLocalUserSettings,
} from '@/lib/db/crud';
import { 
  Profile, 
  ProfileCreate, 
  ProfilePoint, 
  ProfilePointCreate, 
  Dataset, 
  DatasetCreate,
  Text,
  TextCreate,
  AnnotatedDataset,
  AnnotatedDatasetCreate,
  UserSettings
} from '@/lib/db/db';
import { TaskMode } from '@/app/constants';

// Workspace-aware data service
export interface WorkspaceInfo {
  id: string;
  storage_type: 'local' | 'cloud';
}

// Type conversion helpers
function cloudProfileToLocal(cloudProfile: CloudProfile): Profile {
  return {
    id: cloudProfile.id,
    name: cloudProfile.name,
    description: cloudProfile.description || '',
    mode: cloudProfile.mode as TaskMode,
    workspaceId: cloudProfile.user_id, // Use user_id as workspace identifier for cloud profiles
    example: cloudProfile.example,
  };
}

function localProfileToCloud(localProfile: ProfileCreate, workspaceId: string): CloudProfileCreate {
  return {
    workspace_id: workspaceId,
    name: localProfile.name,
    description: localProfile.description,
    mode: localProfile.mode,
    example: localProfile.example,
  };
}

function cloudProfilePointToLocal(cloudPoint: CloudProfilePoint): ProfilePoint {
  return {
    id: cloudPoint.id,
    profileId: cloudPoint.profile_id,
    name: cloudPoint.name,
    explanation: cloudPoint.explanation || '',
    synonyms: cloudPoint.synonyms,
    datatype: cloudPoint.datatype,
    valueset: cloudPoint.valueset,
    unit: cloudPoint.unit,
    order: cloudPoint.order,
    previousPointId: cloudPoint.previous_point_id || null,
    nextPointId: cloudPoint.next_point_id || null,
  };
}

function localProfilePointToCloud(localPoint: ProfilePointCreate): CloudProfilePointCreate {
  return {
    profile_id: localPoint.profileId,
    name: localPoint.name,
    explanation: localPoint.explanation,
    synonyms: localPoint.synonyms,
    datatype: localPoint.datatype,
    valueset: localPoint.valueset,
    unit: localPoint.unit,
    order: localPoint.order || 0,
    previous_point_id: localPoint.previousPointId || undefined,
    next_point_id: localPoint.nextPointId || undefined,
  };
}

function cloudDatasetToLocal(cloudDataset: CloudDataset): Dataset {
  return {
    id: cloudDataset.id,
    name: cloudDataset.name,
    description: cloudDataset.description || '',
    mode: cloudDataset.mode as TaskMode,
    workspaceId: cloudDataset.user_id, // Use user_id as workspace identifier for cloud datasets
  };
}

function localDatasetToCloud(localDataset: DatasetCreate, workspaceId: string): CloudDatasetCreate {
  return {
    workspace_id: workspaceId,
    name: localDataset.name,
    description: localDataset.description,
    mode: localDataset.mode,
  };
}

function cloudTextToLocal(cloudText: CloudText): Text {
  return {
    id: cloudText.id,
    datasetId: cloudText.dataset_id,
    filename: cloudText.filename,
    text: cloudText.text,
  };
}

function localTextToCloud(localText: TextCreate): CloudTextCreate {
  return {
    dataset_id: localText.datasetId,
    filename: localText.filename,
    text: localText.text,
  };
}

function cloudAnnotatedDatasetToLocal(cloudAnnotatedDataset: CloudAnnotatedDataset): AnnotatedDataset {
  return {
    id: cloudAnnotatedDataset.id,
    datasetId: cloudAnnotatedDataset.dataset_id,
    profileId: cloudAnnotatedDataset.profile_id,
    name: cloudAnnotatedDataset.name,
    description: cloudAnnotatedDataset.description || '',
    mode: cloudAnnotatedDataset.mode as TaskMode,
    workspaceId: cloudAnnotatedDataset.user_id, // Use user_id as workspace identifier for cloud annotated datasets
  };
}

function localAnnotatedDatasetToCloud(localAnnotatedDataset: AnnotatedDatasetCreate, workspaceId: string): CloudAnnotatedDatasetCreate {
  return {
    workspace_id: workspaceId,
    dataset_id: localAnnotatedDataset.datasetId,
    profile_id: localAnnotatedDataset.profileId,
    name: localAnnotatedDataset.name,
    description: localAnnotatedDataset.description,
    mode: localAnnotatedDataset.mode,
  };
}

function cloudUserSettingsToLocal(cloudSettings: CloudUserSettings): UserSettings {
  return {
    id: cloudSettings.id,
    tutorialCompleted: cloudSettings.tutorial_completed,
  };
}

function localUserSettingsToCloud(localSettings: Partial<UserSettings>): CloudUserSettingsCreate {
  return {
    tutorial_completed: localSettings.tutorialCompleted,
  };
}

// Hybrid Data Service with Workspace Support
export class HybridDataService {
  private static activeWorkspace: WorkspaceInfo | null = null;
  
  // Set the active workspace for routing decisions
  static setActiveWorkspace(workspace: WorkspaceInfo | null): void {
    this.activeWorkspace = workspace;
  }

  // Get the current storage mode
  private static getStorageType(): 'local' | 'cloud' {
    if (!this.activeWorkspace) {
      // Fallback to the old behavior if no workspace is set
      return this.isAuthenticated() ? 'cloud' : 'local';
    }
    return this.activeWorkspace.storage_type;
  }

  private static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private static validateCloudOperation(): void {
    if (this.getStorageType() === 'cloud' && !this.isAuthenticated()) {
      throw new Error('Cannot perform cloud operations without authentication');
    }
  }

  // Profile operations
  static async createProfile(profile: ProfileCreate): Promise<Profile> {
    this.validateCloudOperation();
    
    if (this.getStorageType() === 'cloud') {
      if (!this.activeWorkspace) {
        throw new Error('No active workspace for cloud operation');
      }
      const cloudProfile = await CloudDataService.createProfile(
        localProfileToCloud(profile, this.activeWorkspace.id)
      );
      return cloudProfileToLocal(cloudProfile);
    } else {
      // For local storage, ensure workspaceId is set to the active workspace
      if (!this.activeWorkspace) {
        throw new Error('No active workspace for local operation');
      }
      const profileWithWorkspace = {
        ...profile,
        workspaceId: this.activeWorkspace.id
      };
      return await createLocalProfile(profileWithWorkspace);
    }
  }

  static async getProfiles(mode?: TaskMode): Promise<Profile[]> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      const cloudProfiles = await CloudDataService.getProfiles();
      const localProfiles = cloudProfiles.map(cloudProfileToLocal);
      return mode ? localProfiles.filter(p => p.mode === mode) : localProfiles;
    } else {
      // For local storage, get all profiles from both modes if no mode specified
      if (mode) {
        return await readProfilesByMode(mode);
      } else {
        const dataPointProfiles = await readProfilesByMode('datapoint_extraction');
        const segmentationProfiles = await readProfilesByMode('text_segmentation');
        return [...dataPointProfiles, ...segmentationProfiles];
      }
    }
  }

  static async getProfile(profileId: string): Promise<Profile | undefined> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      try {
        const cloudProfile = await CloudDataService.getProfile(profileId);
        return cloudProfileToLocal(cloudProfile);
      } catch (error) {
        return undefined;
      }
    } else {
      return await readLocalProfile(profileId);
    }
  }

  static async updateProfile(profileId: string, profile: ProfileCreate): Promise<Profile | undefined> {
    this.validateCloudOperation();
    
    if (this.getStorageType() === 'cloud') {
      if (!this.activeWorkspace) {
        throw new Error('No active workspace for cloud operation');
      }
      try {
        const cloudProfile = await CloudDataService.updateProfile(
          profileId, 
          localProfileToCloud(profile, this.activeWorkspace.id)
        );
        return cloudProfileToLocal(cloudProfile);
      } catch (error) {
        return undefined;
      }
    } else {
      const fullProfile: Profile = { ...profile, id: profileId };
      await updateLocalProfile(fullProfile);
      return await readLocalProfile(profileId);
    }
  }

  static async deleteProfile(profileId: string): Promise<boolean> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      try {
        await CloudDataService.deleteProfile(profileId);
        return true;
      } catch (error) {
        return false;
      }
    } else {
      try {
        await deleteLocalProfile(profileId);
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  // Profile Point operations
  static async createProfilePoint(point: ProfilePointCreate): Promise<ProfilePoint> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      if (!this.activeWorkspace) {
        throw new Error('No active workspace for cloud operation');
      }
      const cloudPoint = await CloudDataService.createProfilePoint(localProfilePointToCloud(point));
      return cloudProfilePointToLocal(cloudPoint);
    } else {
      return await createLocalProfilePoint(point);
    }
  }

  static async getProfilePoints(profileId: string): Promise<ProfilePoint[]> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      const cloudPoints = await CloudDataService.getProfilePoints(profileId);
      return cloudPoints.map(cloudProfilePointToLocal);
    } else {
      return await readLocalProfilePoints(profileId);
    }
  }

  // Dataset operations
  static async createDataset(dataset: DatasetCreate): Promise<Dataset> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      if (!this.activeWorkspace) {
        throw new Error('No active workspace for cloud operation');
      }
      const cloudDataset = await CloudDataService.createDataset(localDatasetToCloud(dataset, this.activeWorkspace.id));
      return cloudDatasetToLocal(cloudDataset);
    } else {
      // For local storage, ensure workspaceId is set to the active workspace
      if (!this.activeWorkspace) {
        throw new Error('No active workspace for local operation');
      }
      const datasetWithWorkspace = {
        ...dataset,
        workspaceId: this.activeWorkspace.id
      };
      return await createLocalDataset(datasetWithWorkspace);
    }
  }

  static async getDatasets(mode?: TaskMode): Promise<Dataset[]> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      const cloudDatasets = await CloudDataService.getDatasets();
      const localDatasets = cloudDatasets.map(cloudDatasetToLocal);
      return mode ? localDatasets.filter(d => d.mode === mode) : localDatasets;
    } else {
      const allDatasets = await readLocalDatasets();
      return mode ? allDatasets.filter(d => d.mode === mode) : allDatasets;
    }
  }

  static async getDataset(datasetId: string): Promise<Dataset | undefined> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      try {
        const cloudDataset = await CloudDataService.getDataset(datasetId);
        return cloudDatasetToLocal(cloudDataset);
      } catch (error) {
        return undefined;
      }
    } else {
      return await readLocalDataset(datasetId);
    }
  }

  static async deleteDataset(datasetId: string): Promise<boolean> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      // Note: Need to implement delete dataset endpoint in backend
      return false; // Placeholder
    } else {
      try {
        await deleteLocalDataset(datasetId);
        return true;
      } catch (error) {
        return false;
      }
    }
  }

  // Text operations
  static async createText(text: TextCreate): Promise<Text> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      if (!this.activeWorkspace) {
        throw new Error('No active workspace for cloud operation');
      }
      const cloudText = await CloudDataService.createText(localTextToCloud(text));
      return cloudTextToLocal(cloudText);
    } else {
      return await createLocalText(text);
    }
  }

  static async getDatasetTexts(datasetId: string): Promise<Text[]> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      const cloudTexts = await CloudDataService.getDatasetTexts(datasetId);
      return cloudTexts.map(cloudTextToLocal);
    } else {
      return await readLocalTextsByDataset(datasetId);
    }
  }

  // Annotated Dataset operations
  static async createAnnotatedDataset(annotatedDataset: AnnotatedDatasetCreate): Promise<AnnotatedDataset> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      if (!this.activeWorkspace) {
        throw new Error('No active workspace for cloud operation');
      }
      const cloudAnnotatedDataset = await CloudDataService.createAnnotatedDataset(localAnnotatedDatasetToCloud(annotatedDataset, this.activeWorkspace.id));
      return cloudAnnotatedDatasetToLocal(cloudAnnotatedDataset);
    } else {
      // For local storage, ensure workspaceId is set to the active workspace
      if (!this.activeWorkspace) {
        throw new Error('No active workspace for local operation');
      }
      const annotatedDatasetWithWorkspace = {
        ...annotatedDataset,
        workspaceId: this.activeWorkspace.id
      };
      return await createLocalAnnotatedDataset(annotatedDatasetWithWorkspace);
    }
  }

  static async getAnnotatedDatasets(mode?: TaskMode): Promise<AnnotatedDataset[]> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      const cloudAnnotatedDatasets = await CloudDataService.getAnnotatedDatasets();
      const localAnnotatedDatasets = cloudAnnotatedDatasets.map(cloudAnnotatedDatasetToLocal);
      return mode ? localAnnotatedDatasets.filter(d => d.mode === mode) : localAnnotatedDatasets;
    } else {
      if (mode) {
        return await readLocalAnnotatedDatasetsByMode(mode);
      } else {
        const dataPointAnnotatedDatasets = await readLocalAnnotatedDatasetsByMode('datapoint_extraction');
        const segmentationAnnotatedDatasets = await readLocalAnnotatedDatasetsByMode('text_segmentation');
        return [...dataPointAnnotatedDatasets, ...segmentationAnnotatedDatasets];
      }
    }
  }

  // User Settings operations
  static async getUserSettings(): Promise<UserSettings | null> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      try {
        const cloudSettings = await CloudDataService.getUserSettings();
        return cloudUserSettingsToLocal(cloudSettings);
      } catch (error) {
        return null;
      }
    } else {
      return await getLocalUserSettings();
    }
  }

  static async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings | null> {
    if (this.getStorageType() === 'cloud') {
      this.validateCloudOperation();
      try {
        const cloudSettings = await CloudDataService.updateUserSettings(localUserSettingsToCloud(settings));
        return cloudUserSettingsToLocal(cloudSettings);
      } catch (error) {
        return null;
      }
    } else {
      return await updateLocalUserSettings(settings);
    }
  }

  // Migration helpers
  static async migrateLocalDataToCloud(): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Must be authenticated to migrate data to cloud');
    }

    try {
      console.log('Starting data migration to cloud...');

      // Step 1: Migrate profiles and profile points
      console.log('Migrating profiles...');
      const localProfiles = await readProfilesByMode('datapoint_extraction');
      const segmentationProfiles = await readProfilesByMode('text_segmentation');
      const allLocalProfiles = [...localProfiles, ...segmentationProfiles];

      const profileIdMapping: Record<string, string> = {};

      for (const profile of allLocalProfiles) {
        const cloudProfile = await CloudDataService.createProfile(localProfileToCloud(profile, this.activeWorkspace?.id || ''));
        profileIdMapping[profile.id] = cloudProfile.id;
        
        // Migrate profile points
        const localPoints = await readLocalProfilePoints(profile.id);
        for (const point of localPoints) {
          await CloudDataService.createProfilePoint({
            ...localProfilePointToCloud(point),
            profile_id: cloudProfile.id, // Use the new cloud profile ID
          });
        }
      }

      // Step 2: Migrate datasets and texts
      console.log('Migrating datasets...');
      const localDatasets = await readLocalDatasets();
      const datasetIdMapping: Record<string, string> = {};

      for (const dataset of localDatasets) {
        const cloudDataset = await CloudDataService.createDataset(localDatasetToCloud(dataset, this.activeWorkspace?.id || ''));
        datasetIdMapping[dataset.id] = cloudDataset.id;

        // Migrate texts within this dataset
        const localTexts = await readLocalTextsByDataset(dataset.id);
        for (const text of localTexts) {
          await CloudDataService.createText({
            ...localTextToCloud(text),
            dataset_id: cloudDataset.id, // Use the new cloud dataset ID
          });
        }
      }

      // Step 3: Migrate annotated datasets
      console.log('Migrating annotated datasets...');
      const localDataPointAnnotatedDatasets = await readLocalAnnotatedDatasetsByMode('datapoint_extraction');
      const localSegmentationAnnotatedDatasets = await readLocalAnnotatedDatasetsByMode('text_segmentation');
      const allLocalAnnotatedDatasets = [...localDataPointAnnotatedDatasets, ...localSegmentationAnnotatedDatasets];

      for (const annotatedDataset of allLocalAnnotatedDatasets) {
        // Map local IDs to cloud IDs
        const cloudDatasetId = datasetIdMapping[annotatedDataset.datasetId];
        const cloudProfileId = profileIdMapping[annotatedDataset.profileId];

        if (cloudDatasetId && cloudProfileId) {
          await CloudDataService.createAnnotatedDataset({
            ...localAnnotatedDatasetToCloud(annotatedDataset, this.activeWorkspace?.id || ''),
            dataset_id: cloudDatasetId,
            profile_id: cloudProfileId,
          });
        } else {
          console.warn(`Skipping annotated dataset ${annotatedDataset.id} - missing dataset or profile mapping`);
        }
      }

      // Step 4: Migrate user settings
      console.log('Migrating user settings...');
      const localSettings = await getLocalUserSettings();
      if (localSettings) {
        await CloudDataService.updateUserSettings(localUserSettingsToCloud(localSettings));
      }

      // Step 5: Migrate LLM configurations (API keys, models, etc.)
      console.log('Migrating LLM configuration...');
      try {
        // Note: This would require reading from the various LLM config tables
        // For now, we'll skip this as it's complex and may not be critical
        console.log('LLM config migration skipped - requires more complex logic');
      } catch (error) {
        console.warn('Failed to migrate LLM config:', error);
      }

      console.log('Data migration to cloud completed successfully');
    } catch (error) {
      console.error('Error migrating data to cloud:', error);
      throw error;
    }
  }
} 