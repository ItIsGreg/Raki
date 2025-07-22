import { 
  CloudDataService, 
  CloudProfile, 
  CloudProfileCreate, 
  CloudProfilePoint, 
  CloudProfilePointCreate,
  CloudDataset,
  CloudDatasetCreate 
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
} from '@/lib/db/crud';
import { 
  Profile, 
  ProfileCreate, 
  ProfilePoint, 
  ProfilePointCreate, 
  Dataset, 
  DatasetCreate 
} from '@/lib/db/db';
import { TaskMode } from '@/app/constants';

// Type conversion helpers
function cloudProfileToLocal(cloudProfile: CloudProfile): Profile {
  return {
    id: cloudProfile.id,
    name: cloudProfile.name,
    description: cloudProfile.description || '',
    mode: cloudProfile.mode as TaskMode,
    example: cloudProfile.example,
  };
}

function localProfileToCloud(localProfile: ProfileCreate): CloudProfileCreate {
  return {
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
  };
}

function localDatasetToCloud(localDataset: DatasetCreate): CloudDatasetCreate {
  return {
    name: localDataset.name,
    description: localDataset.description,
    mode: localDataset.mode,
  };
}

// Hybrid Data Service
export class HybridDataService {
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Profile operations
  static async createProfile(profile: ProfileCreate): Promise<Profile> {
    if (this.isAuthenticated()) {
      const cloudProfile = await CloudDataService.createProfile(localProfileToCloud(profile));
      return cloudProfileToLocal(cloudProfile);
    } else {
      return await createLocalProfile(profile);
    }
  }

  static async getProfiles(mode?: TaskMode): Promise<Profile[]> {
    if (this.isAuthenticated()) {
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
    if (this.isAuthenticated()) {
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
    if (this.isAuthenticated()) {
      try {
        const cloudProfile = await CloudDataService.updateProfile(profileId, localProfileToCloud(profile));
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
    if (this.isAuthenticated()) {
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
    if (this.isAuthenticated()) {
      const cloudPoint = await CloudDataService.createProfilePoint(localProfilePointToCloud(point));
      return cloudProfilePointToLocal(cloudPoint);
    } else {
      return await createLocalProfilePoint(point);
    }
  }

  static async getProfilePoints(profileId: string): Promise<ProfilePoint[]> {
    if (this.isAuthenticated()) {
      const cloudPoints = await CloudDataService.getProfilePoints(profileId);
      return cloudPoints.map(cloudProfilePointToLocal);
    } else {
      return await readLocalProfilePoints(profileId);
    }
  }

  // Dataset operations
  static async createDataset(dataset: DatasetCreate): Promise<Dataset> {
    if (this.isAuthenticated()) {
      const cloudDataset = await CloudDataService.createDataset(localDatasetToCloud(dataset));
      return cloudDatasetToLocal(cloudDataset);
    } else {
      return await createLocalDataset(dataset);
    }
  }

  static async getDatasets(mode?: TaskMode): Promise<Dataset[]> {
    if (this.isAuthenticated()) {
      const cloudDatasets = await CloudDataService.getDatasets();
      const localDatasets = cloudDatasets.map(cloudDatasetToLocal);
      return mode ? localDatasets.filter(d => d.mode === mode) : localDatasets;
    } else {
      const allDatasets = await readLocalDatasets();
      return mode ? allDatasets.filter(d => d.mode === mode) : allDatasets;
    }
  }

  static async getDataset(datasetId: string): Promise<Dataset | undefined> {
    if (this.isAuthenticated()) {
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
    if (this.isAuthenticated()) {
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

  // Migration helpers
  static async migrateLocalDataToCloud(): Promise<void> {
    if (!this.isAuthenticated()) {
      throw new Error('Must be authenticated to migrate data to cloud');
    }

    try {
      // Migrate profiles
      const localProfiles = await readProfilesByMode('datapoint_extraction');
      const segmentationProfiles = await readProfilesByMode('text_segmentation');
      const allLocalProfiles = [...localProfiles, ...segmentationProfiles];

      for (const profile of allLocalProfiles) {
        const cloudProfile = await CloudDataService.createProfile(localProfileToCloud(profile));
        
        // Migrate profile points
        const localPoints = await readLocalProfilePoints(profile.id);
        for (const point of localPoints) {
          await CloudDataService.createProfilePoint({
            ...localProfilePointToCloud(point),
            profile_id: cloudProfile.id, // Use the new cloud profile ID
          });
        }
      }

      // Migrate datasets
      const localDatasets = await readLocalDatasets();
      for (const dataset of localDatasets) {
        await CloudDataService.createDataset(localDatasetToCloud(dataset));
        // TODO: Migrate texts, annotated datasets, etc.
      }

      console.log('Data migration to cloud completed successfully');
    } catch (error) {
      console.error('Error migrating data to cloud:', error);
      throw error;
    }
  }
} 