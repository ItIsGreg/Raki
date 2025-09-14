import { cloudStorageManager } from './cloudStorageManager';
import { 
  Profile, ProfileCreate,
  Dataset, DatasetCreate,
  Text, TextCreate,
  AnnotatedDataset, AnnotatedDatasetCreate,
  AnnotatedText, AnnotatedTextCreate,
  DataPoint, DataPointCreate,
  SegmentDataPoint, SegmentDataPointCreate,
  ProfilePoint, ProfilePointCreate,
  SegmentationProfilePoint, SegmentationProfilePointCreate,
  ApiKey, Model, LLMProvider, LLMUrl, BatchSize, MaxTokens, UserSettings
} from '@/lib/db/db';

export class CloudStorageAdapter {
  private storageId: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5000; // 5 seconds
  private version = 0; // Version number for cache invalidation

  constructor(storageId: string) {
    this.storageId = storageId;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  public clearCache(): void {
    this.cache.clear();
  }

  public getVersion(): number {
    return this.version;
  }

  private incrementVersion(): void {
    this.version++;
  }

  // Profile operations
  get Profiles() {
    return {
      toArray: async (): Promise<Profile[]> => {
        const cacheKey = `profiles_${this.storageId}`;
        const cached = this.getCachedData<Profile[]>(cacheKey);
        if (cached) {
          return cached;
        }
        
        try {
          const profiles = await cloudStorageManager.getProfiles(this.storageId);
          // Transform backend response to match frontend format
          const transformedProfiles = profiles.map(profile => {
            const profileWithId = profile as any; // Type assertion for MongoDB _id field
            return {
              ...profile,
              id: profileWithId._id || profile.id, // Use _id as id for MongoDB compatibility
              _id: undefined // Remove _id to avoid confusion
            };
          });
          this.setCachedData(cacheKey, transformedProfiles);
          return transformedProfiles;
        } catch (error) {
          console.warn('Failed to fetch profiles from cloud storage:', error);
          return [];
        }
      },
      add: async (profile: ProfileCreate): Promise<string> => {
        try {
          const result = await cloudStorageManager.createProfile(this.storageId, profile);
          this.incrementVersion(); // Increment version to trigger useLiveQuery refresh
          // Transform the result to ensure it has the correct id field
          const resultWithId = result as any;
          return resultWithId._id || result.id;
        } catch (error) {
          console.warn('Failed to create profile in cloud storage:', error);
          return 'mock-profile-id';
        }
      },
      put: async (profile: Profile): Promise<string> => {
        try {
          const result = await cloudStorageManager.updateProfile(this.storageId, profile.id, profile);
          this.incrementVersion(); // Increment version to trigger useLiveQuery refresh
          return result.id;
        } catch (error) {
          console.warn('Failed to update profile in cloud storage:', error);
          return profile.id;
        }
      },
      get: async (id: string): Promise<Profile | undefined> => {
        try {
          const profiles = await cloudStorageManager.getProfiles(this.storageId);
          const profile = profiles.find(p => {
            const profileWithId = p as any;
            return (profileWithId._id || p.id) === id;
          });
          
          if (profile) {
            // Transform the profile to match frontend format
            const profileWithId = profile as any;
            return {
              ...profile,
              id: profileWithId._id || profile.id
            } as Profile;
          }
          
          return undefined;
        } catch (error) {
          console.warn('Failed to get profile from cloud storage:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          await cloudStorageManager.deleteProfile(this.storageId, id);
          this.incrementVersion(); // Increment version to trigger useLiveQuery refresh
        } catch (error) {
          console.warn('Failed to delete profile from cloud storage:', error);
        }
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<Profile[]> => {
                const cacheKey = `profiles_${this.storageId}`;
                const cached = this.getCachedData<Profile[]>(cacheKey);
                if (cached) {
                  return cached.filter(p => (p as any)[fieldOrQuery] === value);
                }
                
                try {
                  const profiles = await cloudStorageManager.getProfiles(this.storageId);
                  const transformedProfiles = profiles.map(profile => {
                    const profileWithId = profile as any;
                    return {
                      ...profile,
                      id: profileWithId._id || profile.id,
                      _id: undefined
                    };
                  });
                  this.setCachedData(cacheKey, transformedProfiles);
                  return transformedProfiles.filter(p => (p as any)[fieldOrQuery] === value);
                } catch (error) {
                  console.warn('Failed to fetch profiles with filter from cloud storage:', error);
                  return [];
                }
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<Profile[]> => {
              const cacheKey = `profiles_${this.storageId}`;
              const cached = this.getCachedData<Profile[]>(cacheKey);
              if (cached) {
                return cached.filter(p => {
                  const query = fieldOrQuery as any;
                  return Object.keys(query).every(key => (p as any)[key] === query[key]);
                });
              }
              
              try {
                const profiles = await cloudStorageManager.getProfiles(this.storageId);
                const transformedProfiles = profiles.map(profile => {
                  const profileWithId = profile as any;
                  return {
                    ...profile,
                    id: profileWithId._id || profile.id,
                    _id: undefined
                  };
                });
                this.setCachedData(cacheKey, transformedProfiles);
                return transformedProfiles.filter(p => {
                  const query = fieldOrQuery as any;
                  return Object.keys(query).every(key => (p as any)[key] === query[key]);
                });
              } catch (error) {
                console.warn('Failed to fetch profiles with filter from cloud storage:', error);
                return [];
              }
            }
          };
        }
      }
    };
  }

  // Dataset operations
  get Datasets() {
    return {
      toArray: async (): Promise<Dataset[]> => {
        const cacheKey = `datasets_${this.storageId}`;
        const cached = this.getCachedData<Dataset[]>(cacheKey);
        if (cached) {
          return cached;
        }
        
        try {
          const datasets = await cloudStorageManager.getDatasets(this.storageId);
          
          // Transform backend response to match frontend format
          const transformedDatasets = datasets.map(dataset => {
            const datasetWithId = dataset as any; // Type assertion for MongoDB _id field
            return {
              ...dataset,
              id: datasetWithId._id || dataset.id, // Use _id as id for MongoDB compatibility
              _id: undefined // Remove _id to avoid confusion
            };
          });
          
          this.setCachedData(cacheKey, transformedDatasets);
          return transformedDatasets;
        } catch (error) {
          console.warn('Failed to fetch datasets from cloud storage:', error);
          return [];
        }
      },
      add: async (dataset: DatasetCreate): Promise<string> => {
        try {
          const result = await cloudStorageManager.createDataset(this.storageId, dataset);
          return result.id;
        } catch (error) {
          console.warn('Failed to create dataset in cloud storage:', error);
          return 'mock-dataset-id';
        }
      },
      put: async (dataset: Dataset): Promise<string> => {
        try {
          const result = await cloudStorageManager.updateDataset(this.storageId, dataset.id, dataset);
          return result.id;
        } catch (error) {
          console.warn('Failed to update dataset in cloud storage:', error);
          return dataset.id;
        }
      },
      get: async (id: string): Promise<Dataset | undefined> => {
        try {
          const datasets = await cloudStorageManager.getDatasets(this.storageId);
          return datasets.find(d => d.id === id);
        } catch (error) {
          console.warn('Failed to get dataset from cloud storage:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          await cloudStorageManager.deleteDataset(this.storageId, id);
        } catch (error) {
          console.warn('Failed to delete dataset from cloud storage:', error);
        }
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<Dataset[]> => {
                const cacheKey = `datasets_${this.storageId}`;
                const cached = this.getCachedData<Dataset[]>(cacheKey);
                if (cached) {
                  return cached.filter(d => (d as any)[fieldOrQuery] === value);
                }
                
                try {
                  const datasets = await cloudStorageManager.getDatasets(this.storageId);
                  const transformedDatasets = datasets.map(dataset => {
                    const datasetWithId = dataset as any;
                    return {
                      ...dataset,
                      id: datasetWithId._id || dataset.id,
                      _id: undefined
                    };
                  });
                  this.setCachedData(cacheKey, transformedDatasets);
                  return transformedDatasets.filter(d => (d as any)[fieldOrQuery] === value);
                } catch (error) {
                  console.warn('Failed to fetch datasets with filter from cloud storage:', error);
                  return [];
                }
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<Dataset[]> => {
              const cacheKey = `datasets_${this.storageId}`;
              const cached = this.getCachedData<Dataset[]>(cacheKey);
              if (cached) {
                return cached.filter(d => {
                  const query = fieldOrQuery as any;
                  return Object.keys(query).every(key => (d as any)[key] === query[key]);
                });
              }
              
              try {
                const datasets = await cloudStorageManager.getDatasets(this.storageId);
                const transformedDatasets = datasets.map(dataset => {
                  const datasetWithId = dataset as any;
                  return {
                    ...dataset,
                    id: datasetWithId._id || dataset.id,
                    _id: undefined
                  };
                });
                this.setCachedData(cacheKey, transformedDatasets);
                return transformedDatasets.filter(d => {
                  const query = fieldOrQuery as any;
                  return Object.keys(query).every(key => (d as any)[key] === query[key]);
                });
              } catch (error) {
                console.warn('Failed to fetch datasets with filter from cloud storage:', error);
                return [];
              }
            }
          };
        }
      }
    };
  }

  // For now, we'll implement a basic structure
  // In a real implementation, you'd need to add all the other tables
  // and implement the full Dexie-like interface for each

  get Texts() {
    return {
      toArray: async (): Promise<Text[]> => {
        // Return empty array for now - cloud storage texts not yet implemented
        return [];
      },
      add: async (text: TextCreate): Promise<string> => {
        // Return a mock ID for now
        return 'mock-text-id';
      },
      put: async (text: Text): Promise<string> => {
        // Return the same ID for now
        return text.id;
      },
      get: async (id: string): Promise<Text | undefined> => {
        // Return undefined for now
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        // No-op for now
        return;
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<Text[]> => {
                // Return empty array for now
                return [];
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<Text[]> => {
                // Return empty array for now
                return [];
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<Text[]> => {
              // Return empty array for now
              return [];
            }
          };
        }
      }
    };
  }

  get AnnotatedDatasets() {
    return {
      toArray: async (): Promise<AnnotatedDataset[]> => {
        return [];
      },
      add: async (annotatedDataset: AnnotatedDatasetCreate): Promise<string> => {
        return 'mock-annotated-dataset-id';
      },
      put: async (annotatedDataset: AnnotatedDataset): Promise<string> => {
        return annotatedDataset.id;
      },
      get: async (id: string): Promise<AnnotatedDataset | undefined> => {
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        return;
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<AnnotatedDataset[]> => {
                return [];
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<AnnotatedDataset[]> => {
                return [];
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<AnnotatedDataset[]> => {
              return [];
            }
          };
        }
      }
    };
  }

  get AnnotatedTexts() {
    return {
      toArray: async (): Promise<AnnotatedText[]> => {
        return [];
      },
      add: async (annotatedText: AnnotatedTextCreate): Promise<string> => {
        return 'mock-annotated-text-id';
      },
      put: async (annotatedText: AnnotatedText): Promise<string> => {
        return annotatedText.id;
      },
      get: async (id: string): Promise<AnnotatedText | undefined> => {
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        return;
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<AnnotatedText[]> => {
                return [];
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<AnnotatedText[]> => {
                return [];
              }
            })
          };
        } else {
          // Handle object query like { field: value }
          return {
            toArray: async (): Promise<AnnotatedText[]> => {
              return [];
            }
          };
        }
      }
    };
  }

  get DataPoints() {
    return {
      toArray: async (): Promise<DataPoint[]> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/data-points`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch data points');
          const data = await response.json();
          return data.map((dp: any) => ({
            id: dp.id,
            annotatedTextId: dp.annotated_text_id,
            name: dp.name,
            value: dp.value,
            match: dp.match,
            profilePointId: dp.profile_point_id,
            verified: dp.verified
          }));
        } catch (error) {
          console.error('Error fetching data points:', error);
          return [];
        }
      },
      add: async (dataPoint: DataPointCreate): Promise<string> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/data-points`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              annotated_text_id: dataPoint.annotatedTextId,
              name: dataPoint.name,
              value: dataPoint.value,
              match: dataPoint.match,
              profile_point_id: dataPoint.profilePointId,
              verified: dataPoint.verified
            })
          });
          if (!response.ok) throw new Error('Failed to create data point');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating data point:', error);
          throw error;
        }
      },
      put: async (dataPoint: DataPoint): Promise<string> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/data-points/${dataPoint.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              name: dataPoint.name,
              value: dataPoint.value,
              match: dataPoint.match,
              profile_point_id: dataPoint.profilePointId,
              verified: dataPoint.verified
            })
          });
          if (!response.ok) throw new Error('Failed to update data point');
          return dataPoint.id;
        } catch (error) {
          console.error('Error updating data point:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<DataPoint | undefined> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/data-points`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch data points');
          const data = await response.json();
          const dataPoint = data.find((dp: any) => dp.id === id);
          if (!dataPoint) return undefined;
          return {
            id: dataPoint.id,
            annotatedTextId: dataPoint.annotated_text_id,
            name: dataPoint.name,
            value: dataPoint.value,
            match: dataPoint.match,
            profilePointId: dataPoint.profile_point_id,
            verified: dataPoint.verified
          };
        } catch (error) {
          console.error('Error fetching data point:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/data-points/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to delete data point');
        } catch (error) {
          console.error('Error deleting data point:', error);
          throw error;
        }
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<DataPoint[]> => {
                try {
                  const response = await fetch(`/api/user-data/${this.storageId}/data-points`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch data points');
                  const data = await response.json();
                  return data
                    .filter((dp: any) => dp[fieldOrQuery] === value)
                    .map((dp: any) => ({
                      id: dp.id,
                      annotatedTextId: dp.annotated_text_id,
                      name: dp.name,
                      value: dp.value,
                      match: dp.match,
                      profilePointId: dp.profile_point_id,
                      verified: dp.verified
                    }));
                } catch (error) {
                  console.error('Error filtering data points:', error);
                  return [];
                }
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<DataPoint[]> => {
                try {
                  const response = await fetch(`/api/user-data/${this.storageId}/data-points`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch data points');
                  const data = await response.json();
                  return data
                    .filter((dp: any) => values.includes(dp[fieldOrQuery]))
                    .map((dp: any) => ({
                      id: dp.id,
                      annotatedTextId: dp.annotated_text_id,
                      name: dp.name,
                      value: dp.value,
                      match: dp.match,
                      profilePointId: dp.profile_point_id,
                      verified: dp.verified
                    }));
                } catch (error) {
                  console.error('Error filtering data points:', error);
                  return [];
                }
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<DataPoint[]> => {
              try {
                const response = await fetch(`/api/user-data/${this.storageId}/data-points`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                if (!response.ok) throw new Error('Failed to fetch data points');
                const data = await response.json();
                return data.map((dp: any) => ({
                  id: dp.id,
                  annotatedTextId: dp.annotated_text_id,
                  name: dp.name,
                  value: dp.value,
                  match: dp.match,
                  profilePointId: dp.profile_point_id,
                  verified: dp.verified
                }));
              } catch (error) {
                console.error('Error fetching data points:', error);
                return [];
              }
            }
          };
        }
      }
    };
  }

  get SegmentDataPoints() {
    return {
      toArray: async (): Promise<SegmentDataPoint[]> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/segment-data-points`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch segment data points');
          const data = await response.json();
          return data.map((sdp: any) => ({
            id: sdp.id,
            annotatedTextId: sdp.annotated_text_id,
            name: sdp.name,
            beginMatch: sdp.begin_match,
            endMatch: sdp.end_match,
            profilePointId: sdp.profile_point_id,
            verified: sdp.verified
          }));
        } catch (error) {
          console.error('Error fetching segment data points:', error);
          return [];
        }
      },
      add: async (segmentDataPoint: SegmentDataPointCreate): Promise<string> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/segment-data-points`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              annotated_text_id: segmentDataPoint.annotatedTextId,
              name: segmentDataPoint.name,
              begin_match: segmentDataPoint.beginMatch,
              end_match: segmentDataPoint.endMatch,
              profile_point_id: segmentDataPoint.profilePointId,
              verified: segmentDataPoint.verified
            })
          });
          if (!response.ok) throw new Error('Failed to create segment data point');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating segment data point:', error);
          throw error;
        }
      },
      put: async (segmentDataPoint: SegmentDataPoint): Promise<string> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/segment-data-points/${segmentDataPoint.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              name: segmentDataPoint.name,
              begin_match: segmentDataPoint.beginMatch,
              end_match: segmentDataPoint.endMatch,
              profile_point_id: segmentDataPoint.profilePointId,
              verified: segmentDataPoint.verified
            })
          });
          if (!response.ok) throw new Error('Failed to update segment data point');
          return segmentDataPoint.id;
        } catch (error) {
          console.error('Error updating segment data point:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<SegmentDataPoint | undefined> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/segment-data-points`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch segment data points');
          const data = await response.json();
          const segmentDataPoint = data.find((sdp: any) => sdp.id === id);
          if (!segmentDataPoint) return undefined;
          return {
            id: segmentDataPoint.id,
            annotatedTextId: segmentDataPoint.annotated_text_id,
            name: segmentDataPoint.name,
            beginMatch: segmentDataPoint.begin_match,
            endMatch: segmentDataPoint.end_match,
            profilePointId: segmentDataPoint.profile_point_id,
            verified: segmentDataPoint.verified
          };
        } catch (error) {
          console.error('Error fetching segment data point:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/segment-data-points/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to delete segment data point');
        } catch (error) {
          console.error('Error deleting segment data point:', error);
          throw error;
        }
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<SegmentDataPoint[]> => {
                try {
                  const response = await fetch(`/api/user-data/${this.storageId}/segment-data-points`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch segment data points');
                  const data = await response.json();
                  return data
                    .filter((sdp: any) => sdp[fieldOrQuery] === value)
                    .map((sdp: any) => ({
                      id: sdp.id,
                      annotatedTextId: sdp.annotated_text_id,
                      name: sdp.name,
                      beginMatch: sdp.begin_match,
                      endMatch: sdp.end_match,
                      profilePointId: sdp.profile_point_id,
                      verified: sdp.verified
                    }));
                } catch (error) {
                  console.error('Error filtering segment data points:', error);
                  return [];
                }
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<SegmentDataPoint[]> => {
                try {
                  const response = await fetch(`/api/user-data/${this.storageId}/segment-data-points`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch segment data points');
                  const data = await response.json();
                  return data
                    .filter((sdp: any) => values.includes(sdp[fieldOrQuery]))
                    .map((sdp: any) => ({
                      id: sdp.id,
                      annotatedTextId: sdp.annotated_text_id,
                      name: sdp.name,
                      beginMatch: sdp.begin_match,
                      endMatch: sdp.end_match,
                      profilePointId: sdp.profile_point_id,
                      verified: sdp.verified
                    }));
                } catch (error) {
                  console.error('Error filtering segment data points:', error);
                  return [];
                }
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<SegmentDataPoint[]> => {
              try {
                const response = await fetch(`/api/user-data/${this.storageId}/segment-data-points`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                  }
                });
                if (!response.ok) throw new Error('Failed to fetch segment data points');
                const data = await response.json();
                return data.map((sdp: any) => ({
                  id: sdp.id,
                  annotatedTextId: sdp.annotated_text_id,
                  name: sdp.name,
                  beginMatch: sdp.begin_match,
                  endMatch: sdp.end_match,
                  profilePointId: sdp.profile_point_id,
                  verified: sdp.verified
                }));
              } catch (error) {
                console.error('Error fetching segment data points:', error);
                return [];
              }
            }
          };
        }
      }
    };
  }

  get profilePoints() {
    return {
      toArray: async (): Promise<ProfilePoint[]> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/profile-points`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch profile points');
          const data = await response.json();
          return data.map((pp: any) => ({
            id: pp.id,
            name: pp.name,
            explanation: pp.explanation,
            synonyms: pp.synonyms,
            datatype: pp.datatype,
            valueset: pp.valueset,
            unit: pp.unit,
            profileId: pp.profile_id,
            order: pp.order,
            previousPointId: pp.previous_point_id,
            nextPointId: pp.next_point_id
          }));
        } catch (error) {
          console.error('Error fetching profile points:', error);
          return [];
        }
      },
      add: async (profilePoint: ProfilePointCreate): Promise<string> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/profile-points`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              name: profilePoint.name,
              explanation: profilePoint.explanation,
              synonyms: profilePoint.synonyms,
              datatype: profilePoint.datatype,
              valueset: profilePoint.valueset,
              unit: profilePoint.unit,
              profile_id: profilePoint.profileId,
              order: profilePoint.order,
              previous_point_id: profilePoint.previousPointId,
              next_point_id: profilePoint.nextPointId
            })
          });
          if (!response.ok) throw new Error('Failed to create profile point');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating profile point:', error);
          throw error;
        }
      },
      put: async (profilePoint: ProfilePoint): Promise<string> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/profile-points/${profilePoint.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              name: profilePoint.name,
              explanation: profilePoint.explanation,
              synonyms: profilePoint.synonyms,
              datatype: profilePoint.datatype,
              valueset: profilePoint.valueset,
              unit: profilePoint.unit,
              profile_id: profilePoint.profileId,
              order: profilePoint.order,
              previous_point_id: profilePoint.previousPointId,
              next_point_id: profilePoint.nextPointId
            })
          });
          if (!response.ok) throw new Error('Failed to update profile point');
          return profilePoint.id;
        } catch (error) {
          console.error('Error updating profile point:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<ProfilePoint | undefined> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/profile-points`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to fetch profile points');
          const data = await response.json();
          const profilePoint = data.find((pp: any) => pp.id === id);
          if (!profilePoint) return undefined;
          return {
            id: profilePoint.id,
            name: profilePoint.name,
            explanation: profilePoint.explanation,
            synonyms: profilePoint.synonyms,
            datatype: profilePoint.datatype,
            valueset: profilePoint.valueset,
            unit: profilePoint.unit,
            profileId: profilePoint.profile_id,
            order: profilePoint.order,
            previousPointId: profilePoint.previous_point_id,
            nextPointId: profilePoint.next_point_id
          };
        } catch (error) {
          console.error('Error fetching profile point:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/profile-points/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if (!response.ok) throw new Error('Failed to delete profile point');
        } catch (error) {
          console.error('Error deleting profile point:', error);
          throw error;
        }
      },
      where: (field: string) => ({
        equals: (value: any) => ({
          toArray: async (): Promise<ProfilePoint[]> => {
            try {
              const response = await fetch(`/api/user-data/${this.storageId}/profile-points`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              if (!response.ok) throw new Error('Failed to fetch profile points');
              const data = await response.json();
              return data
                .filter((pp: any) => pp[field] === value)
                .map((pp: any) => ({
                  id: pp.id,
                  name: pp.name,
                  explanation: pp.explanation,
                  synonyms: pp.synonyms,
                  datatype: pp.datatype,
                  valueset: pp.valueset,
                  unit: pp.unit,
                  profileId: pp.profile_id,
                  order: pp.order,
                  previousPointId: pp.previous_point_id,
                  nextPointId: pp.next_point_id
                }));
            } catch (error) {
              console.error('Error filtering profile points:', error);
              return [];
            }
          }
        })
      }),
      update: async (id: string, changes: Partial<ProfilePoint>): Promise<void> => {
        try {
          const response = await fetch(`/api/user-data/${this.storageId}/profile-points/${id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              name: changes.name,
              explanation: changes.explanation,
              synonyms: changes.synonyms,
              datatype: changes.datatype,
              valueset: changes.valueset,
              unit: changes.unit,
              profile_id: changes.profileId,
              order: changes.order,
              previous_point_id: changes.previousPointId,
              next_point_id: changes.nextPointId
            })
          });
          if (!response.ok) throw new Error('Failed to update profile point');
        } catch (error) {
          console.error('Error updating profile point:', error);
          throw error;
        }
      }
    };
  }

  get segmentationProfilePoints() {
    return {
      toArray: async (): Promise<SegmentationProfilePoint[]> => {
        return [];
      },
      add: async (segmentationProfilePoint: SegmentationProfilePointCreate): Promise<string> => {
        return 'mock-segmentation-profile-point-id';
      },
      put: async (segmentationProfilePoint: SegmentationProfilePoint): Promise<string> => {
        return segmentationProfilePoint.id;
      },
      get: async (id: string): Promise<SegmentationProfilePoint | undefined> => {
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        return;
      },
      where: (field: string) => ({
        equals: (value: any) => ({
          toArray: async (): Promise<SegmentationProfilePoint[]> => {
            return [];
          }
        })
      }),
      update: async (id: string, changes: Partial<SegmentationProfilePoint>): Promise<void> => {
        return;
      }
    };
  }

  get ApiKeys() {
    return {
      toArray: async (): Promise<ApiKey[]> => {
        return [];
      },
      add: async (apiKey: ApiKey): Promise<string> => {
        return 'mock-api-key-id';
      },
      put: async (apiKey: ApiKey): Promise<string> => {
        return apiKey.id;
      },
      get: async (id: string): Promise<ApiKey | undefined> => {
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        return;
      }
    };
  }

  get models() {
    return {
      toArray: async (): Promise<Model[]> => {
        return [];
      },
      add: async (model: Model): Promise<string> => {
        return 'mock-model-id';
      },
      put: async (model: Model): Promise<string> => {
        return model.id;
      },
      delete: async (id: string): Promise<void> => {
        return;
      }
    };
  }

  get llmProviders() {
    return {
      toArray: async (): Promise<LLMProvider[]> => {
        return [];
      },
      add: async (llmProvider: LLMProvider): Promise<string> => {
        return 'mock-llm-provider-id';
      },
      put: async (llmProvider: LLMProvider): Promise<string> => {
        return llmProvider.id;
      },
      delete: async (id: string): Promise<void> => {
        return;
      }
    };
  }

  get llmUrls() {
    return {
      toArray: async (): Promise<LLMUrl[]> => {
        return [];
      },
      add: async (llmUrl: LLMUrl): Promise<string> => {
        return 'mock-llm-url-id';
      },
      put: async (llmUrl: LLMUrl): Promise<string> => {
        return llmUrl.id;
      },
      get: async (id: string): Promise<LLMUrl | undefined> => {
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        return;
      }
    };
  }

  get batchSizes() {
    return {
      toArray: async (): Promise<BatchSize[]> => {
        return [];
      },
      add: async (batchSize: BatchSize): Promise<string> => {
        return 'mock-batch-size-id';
      },
      put: async (batchSize: BatchSize): Promise<string> => {
        return batchSize.id;
      },
      delete: async (id: string): Promise<void> => {
        return;
      }
    };
  }

  get maxTokens() {
    return {
      toArray: async (): Promise<MaxTokens[]> => {
        return [];
      },
      add: async (maxTokens: MaxTokens): Promise<string> => {
        return 'mock-max-tokens-id';
      },
      put: async (maxTokens: MaxTokens): Promise<string> => {
        return maxTokens.id;
      },
      get: async (id: string): Promise<MaxTokens | undefined> => {
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        return;
      }
    };
  }

  get userSettings() {
    return {
      toArray: async (): Promise<UserSettings[]> => {
        // Return empty array for now - cloud storage user settings not yet implemented
        return [];
      },
      add: async (userSettings: UserSettings): Promise<string> => {
        // Return a mock ID for now
        return 'mock-user-settings-id';
      },
      put: async (userSettings: UserSettings): Promise<string> => {
        // Return the same ID for now
        return userSettings.id;
      },
      update: async (id: string, changes: Partial<UserSettings>): Promise<void> => {
        // No-op for now
        return;
      },
      delete: async (id: string): Promise<void> => {
        // No-op for now
        return;
      }
    };
  }
}
