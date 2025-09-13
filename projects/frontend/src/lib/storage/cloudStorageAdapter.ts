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
        return [];
      },
      add: async (dataPoint: DataPointCreate): Promise<string> => {
        return 'mock-data-point-id';
      },
      put: async (dataPoint: DataPoint): Promise<string> => {
        return dataPoint.id;
      },
      get: async (id: string): Promise<DataPoint | undefined> => {
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        return;
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<DataPoint[]> => {
                return [];
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<DataPoint[]> => {
                return [];
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<DataPoint[]> => {
              return [];
            }
          };
        }
      }
    };
  }

  get SegmentDataPoints() {
    return {
      toArray: async (): Promise<SegmentDataPoint[]> => {
        return [];
      },
      add: async (segmentDataPoint: SegmentDataPointCreate): Promise<string> => {
        return 'mock-segment-data-point-id';
      },
      put: async (segmentDataPoint: SegmentDataPoint): Promise<string> => {
        return segmentDataPoint.id;
      },
      get: async (id: string): Promise<SegmentDataPoint | undefined> => {
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        return;
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<SegmentDataPoint[]> => {
                return [];
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<SegmentDataPoint[]> => {
                return [];
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<SegmentDataPoint[]> => {
              return [];
            }
          };
        }
      }
    };
  }

  get profilePoints() {
    return {
      toArray: async (): Promise<ProfilePoint[]> => {
        // Return empty array for now - cloud storage profile points not yet implemented
        return [];
      },
      add: async (profilePoint: ProfilePointCreate): Promise<string> => {
        // Return a mock ID for now
        return 'mock-profile-point-id';
      },
      put: async (profilePoint: ProfilePoint): Promise<string> => {
        // Return the same ID for now
        return profilePoint.id;
      },
      get: async (id: string): Promise<ProfilePoint | undefined> => {
        // Return undefined for now
        return undefined;
      },
      delete: async (id: string): Promise<void> => {
        // No-op for now
        return;
      },
      where: (field: string) => ({
        equals: (value: any) => ({
          toArray: async (): Promise<ProfilePoint[]> => {
            // Return empty array for now
            return [];
          }
        })
      }),
      update: async (id: string, changes: Partial<ProfilePoint>): Promise<void> => {
        // No-op for now
        return;
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
