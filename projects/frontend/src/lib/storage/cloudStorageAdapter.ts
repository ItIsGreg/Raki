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
  private baseUrl: string;
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private cacheTimeout = 5000; // 5 seconds
  private version = 0; // Version number for cache invalidation

  constructor(storageId: string) {
    this.storageId = storageId;
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
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
          // Backend now returns camelCase field names that match frontend
          this.setCachedData(cacheKey, profiles);
          return profiles;
        } catch (error) {
          console.warn('Failed to fetch profiles from cloud storage:', error);
          return [];
        }
      },
      add: async (profile: ProfileCreate): Promise<string> => {
        try {
          const result = await cloudStorageManager.createProfile(this.storageId, profile);
          this.incrementVersion(); // Increment version to trigger useLiveQuery refresh
          // Backend now returns id directly
          return result.id;
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
          const profile = profiles.find(p => p.id === id);
          return profile;
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
                  // Backend now returns camelCase field names that match frontend
                  this.setCachedData(cacheKey, profiles);
                  return profiles.filter(p => (p as any)[fieldOrQuery] === value);
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
                // Backend now returns camelCase field names that match frontend
                this.setCachedData(cacheKey, profiles);
                return profiles.filter(p => {
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
          
          // Backend now returns camelCase field names that match frontend
          this.setCachedData(cacheKey, datasets);
          return datasets;
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
                  // Backend now returns camelCase field names that match frontend
                  this.setCachedData(cacheKey, datasets);
                  return datasets.filter(d => (d as any)[fieldOrQuery] === value);
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
                // Backend now returns camelCase field names that match frontend
                this.setCachedData(cacheKey, datasets);
                return datasets.filter(d => {
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
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/texts`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch texts');
          const data = await response.json();
          return data.map((text: any) => ({
            id: text.id,
            datasetId: text.datasetId,
            filename: text.filename,
            text: text.text
          }));
        } catch (error) {
          console.error('Error fetching texts:', error);
          return [];
        }
      },
      add: async (text: TextCreate): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/texts`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              datasetId: text.datasetId,
              filename: text.filename,
              text: text.text
            })
          });
          if (!response.ok) throw new Error('Failed to create text');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating text:', error);
          throw error;
        }
      },
      put: async (text: Text): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/texts/${text.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              filename: text.filename,
              text: text.text,
              datasetId: text.datasetId
            })
          });
          if (!response.ok) throw new Error('Failed to update text');
          return text.id;
        } catch (error) {
          console.error('Error updating text:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<Text | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/texts`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch texts');
          const data = await response.json();
          const text = data.find((t: any) => t.id === id);
          if (!text) return undefined;
          return {
            id: text.id,
            datasetId: text.datasetId,
            filename: text.filename,
            text: text.text
          };
        } catch (error) {
          console.error('Error fetching text:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/texts/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete text');
        } catch (error) {
          console.error('Error deleting text:', error);
          throw error;
        }
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<Text[]> => {
                try {
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/texts`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch texts');
                  const data = await response.json();
                  return data
                    .filter((text: any) => text[fieldOrQuery] === value)
                    .map((text: any) => ({
                      id: text.id,
                      datasetId: text.datasetId,
                      filename: text.filename,
                      text: text.text
                    }));
                } catch (error) {
                  console.error('Error filtering texts:', error);
                  return [];
                }
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<Text[]> => {
                try {
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/texts`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch texts');
                  const data = await response.json();
                  return data
                    .filter((text: any) => values.includes(text[fieldOrQuery]))
                    .map((text: any) => ({
                      id: text.id,
                      datasetId: text.datasetId,
                      filename: text.filename,
                      text: text.text
                    }));
                } catch (error) {
                  console.error('Error filtering texts:', error);
                  return [];
                }
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<Text[]> => {
              try {
                const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/texts`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  }
                });
                if (!response.ok) throw new Error('Failed to fetch texts');
                const data = await response.json();
                return data.map((text: any) => ({
                  id: text.id,
                  datasetId: text.datasetId,
                  filename: text.filename,
                  text: text.text
                }));
              } catch (error) {
                console.error('Error fetching texts:', error);
                return [];
              }
            }
          };
        }
      }
    };
  }

  get AnnotatedDatasets() {
    return {
      toArray: async (): Promise<AnnotatedDataset[]> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-datasets`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch annotated datasets');
          const data = await response.json();
          return data.map((ad: any) => ({
            id: ad.id,
            name: ad.name,
            description: ad.description,
            datasetId: ad.datasetId,
            profileId: ad.profileId,
            mode: ad.mode
          }));
        } catch (error) {
          console.error('Error fetching annotated datasets:', error);
          return [];
        }
      },
      add: async (annotatedDataset: AnnotatedDatasetCreate): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-datasets`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: annotatedDataset.name,
              description: annotatedDataset.description,
              datasetId: annotatedDataset.datasetId,
              profileId: annotatedDataset.profileId,
              mode: annotatedDataset.mode
            })
          });
          if (!response.ok) throw new Error('Failed to create annotated dataset');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating annotated dataset:', error);
          throw error;
        }
      },
      put: async (annotatedDataset: AnnotatedDataset): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-datasets/${annotatedDataset.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: annotatedDataset.name,
              description: annotatedDataset.description,
              datasetId: annotatedDataset.datasetId,
              profileId: annotatedDataset.profileId,
              mode: annotatedDataset.mode
            })
          });
          if (!response.ok) throw new Error('Failed to update annotated dataset');
          return annotatedDataset.id;
        } catch (error) {
          console.error('Error updating annotated dataset:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<AnnotatedDataset | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-datasets`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch annotated datasets');
          const data = await response.json();
          const annotatedDataset = data.find((ad: any) => ad.id === id);
          if (!annotatedDataset) return undefined;
          return {
            id: annotatedDataset.id,
            name: annotatedDataset.name,
            description: annotatedDataset.description,
            datasetId: annotatedDataset.datasetId,
            profileId: annotatedDataset.profileId,
            mode: annotatedDataset.mode
          };
        } catch (error) {
          console.error('Error fetching annotated dataset:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-datasets/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete annotated dataset');
        } catch (error) {
          console.error('Error deleting annotated dataset:', error);
          throw error;
        }
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<AnnotatedDataset[]> => {
                try {
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-datasets`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch annotated datasets');
                  const data = await response.json();
                  return data
                    .filter((ad: any) => ad[fieldOrQuery] === value)
                    .map((ad: any) => ({
                      id: ad.id,
                      name: ad.name,
                      description: ad.description,
                      datasetId: ad.datasetId,
                      profileId: ad.profileId,
                      mode: ad.mode
                    }));
                } catch (error) {
                  console.error('Error filtering annotated datasets:', error);
                  return [];
                }
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<AnnotatedDataset[]> => {
                try {
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-datasets`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch annotated datasets');
                  const data = await response.json();
                  return data
                    .filter((ad: any) => values.includes(ad[fieldOrQuery]))
                    .map((ad: any) => ({
                      id: ad.id,
                      name: ad.name,
                      description: ad.description,
                      datasetId: ad.datasetId,
                      profileId: ad.profileId,
                      mode: ad.mode
                    }));
                } catch (error) {
                  console.error('Error filtering annotated datasets:', error);
                  return [];
                }
              }
            })
          };
        } else {
          return {
            toArray: async (): Promise<AnnotatedDataset[]> => {
              try {
                const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-datasets`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  }
                });
                if (!response.ok) throw new Error('Failed to fetch annotated datasets');
                const data = await response.json();
                return data.map((ad: any) => ({
                  id: ad.id,
                  name: ad.name,
                  description: ad.description,
                  datasetId: ad.datasetId,
                  profileId: ad.profileId,
                  mode: ad.mode
                }));
              } catch (error) {
                console.error('Error fetching annotated datasets:', error);
                return [];
              }
            }
          };
        }
      }
    };
  }

  get AnnotatedTexts() {
    return {
      toArray: async (): Promise<AnnotatedText[]> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-texts`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch annotated texts');
          const data = await response.json();
          return data.map((at: any) => ({
            id: at.id,
            textId: at.textId,
            annotatedDatasetId: at.annotatedDatasetId,
            verified: at.verified,
            aiFaulty: at.aiFaulty
          }));
        } catch (error) {
          console.error('Error fetching annotated texts:', error);
          return [];
        }
      },
      add: async (annotatedText: AnnotatedTextCreate): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-texts`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              textId: annotatedText.textId,
              annotatedDatasetId: annotatedText.annotatedDatasetId,
              verified: annotatedText.verified,
              aiFaulty: annotatedText.aiFaulty
            })
          });
          if (!response.ok) throw new Error('Failed to create annotated text');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating annotated text:', error);
          throw error;
        }
      },
      put: async (annotatedText: AnnotatedText): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-texts/${annotatedText.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              textId: annotatedText.textId,
              annotatedDatasetId: annotatedText.annotatedDatasetId,
              verified: annotatedText.verified,
              aiFaulty: annotatedText.aiFaulty
            })
          });
          if (!response.ok) throw new Error('Failed to update annotated text');
          return annotatedText.id;
        } catch (error) {
          console.error('Error updating annotated text:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<AnnotatedText | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-texts`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch annotated texts');
          const data = await response.json();
          const annotatedText = data.find((at: any) => at.id === id);
          if (!annotatedText) return undefined;
          return {
            id: annotatedText.id,
            textId: annotatedText.textId,
            annotatedDatasetId: annotatedText.annotatedDatasetId,
            verified: annotatedText.verified,
            aiFaulty: annotatedText.aiFaulty
          };
        } catch (error) {
          console.error('Error fetching annotated text:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-texts/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete annotated text');
        } catch (error) {
          console.error('Error deleting annotated text:', error);
          throw error;
        }
      },
      where: (fieldOrQuery: string | object): any => {
        if (typeof fieldOrQuery === 'string') {
          return {
            equals: (value: any) => ({
              toArray: async (): Promise<AnnotatedText[]> => {
                try {
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-texts`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch annotated texts');
                  const data = await response.json();
                  return data
                    .filter((at: any) => at[fieldOrQuery] === value)
                    .map((at: any) => ({
                      id: at.id,
                      textId: at.textId,
                      annotatedDatasetId: at.annotatedDatasetId,
                      verified: at.verified,
                      aiFaulty: at.aiFaulty
                    }));
                } catch (error) {
                  console.error('Error filtering annotated texts:', error);
                  return [];
                }
              }
            }),
            anyOf: (values: any[]) => ({
              toArray: async (): Promise<AnnotatedText[]> => {
                try {
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-texts`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch annotated texts');
                  const data = await response.json();
                  return data
                    .filter((at: any) => values.includes(at[fieldOrQuery]))
                    .map((at: any) => ({
                      id: at.id,
                      textId: at.textId,
                      annotatedDatasetId: at.annotatedDatasetId,
                      verified: at.verified,
                      aiFaulty: at.aiFaulty
                    }));
                } catch (error) {
                  console.error('Error filtering annotated texts:', error);
                  return [];
                }
              }
            })
          };
        } else {
          // Handle object query like { field: value }
          return {
            toArray: async (): Promise<AnnotatedText[]> => {
              try {
                const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/annotated-texts`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  }
                });
                if (!response.ok) throw new Error('Failed to fetch annotated texts');
                const data = await response.json();
                return data.map((at: any) => ({
                  id: at.id,
                  textId: at.textId,
                  annotatedDatasetId: at.annotatedDatasetId,
                  verified: at.verified,
                  aiFaulty: at.aiFaulty
                }));
              } catch (error) {
                console.error('Error fetching annotated texts:', error);
                return [];
              }
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/data-points`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch data points');
          const data = await response.json();
          return data.map((dp: any) => ({
            id: dp.id,
            annotatedTextId: dp.annotatedTextId,
            name: dp.name,
            value: dp.value,
            match: dp.match,
            profilePointId: dp.profilePointId,
            verified: dp.verified
          }));
        } catch (error) {
          console.error('Error fetching data points:', error);
          return [];
        }
      },
      add: async (dataPoint: DataPointCreate): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/data-points`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              annotatedTextId: dataPoint.annotatedTextId,
              name: dataPoint.name,
              value: dataPoint.value,
              match: dataPoint.match,
              profilePointId: dataPoint.profilePointId,
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/data-points/${dataPoint.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: dataPoint.name,
              value: dataPoint.value,
              match: dataPoint.match,
              profilePointId: dataPoint.profilePointId,
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/data-points`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch data points');
          const data = await response.json();
          const dataPoint = data.find((dp: any) => dp.id === id);
          if (!dataPoint) return undefined;
          return {
            id: dataPoint.id,
            annotatedTextId: dataPoint.annotatedTextId,
            name: dataPoint.name,
            value: dataPoint.value,
            match: dataPoint.match,
            profilePointId: dataPoint.profilePointId,
            verified: dataPoint.verified
          };
        } catch (error) {
          console.error('Error fetching data point:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/data-points/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
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
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/data-points`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch data points');
                  const data = await response.json();
                  return data
                    .filter((dp: any) => dp[fieldOrQuery] === value)
                    .map((dp: any) => ({
                      id: dp.id,
                      annotatedTextId: dp.annotatedTextId,
                      name: dp.name,
                      value: dp.value,
                      match: dp.match,
                      profilePointId: dp.profilePointId,
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
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/data-points`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch data points');
                  const data = await response.json();
                  return data
                    .filter((dp: any) => values.includes(dp[fieldOrQuery]))
                    .map((dp: any) => ({
                      id: dp.id,
                      annotatedTextId: dp.annotatedTextId,
                      name: dp.name,
                      value: dp.value,
                      match: dp.match,
                      profilePointId: dp.profilePointId,
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
                const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/data-points`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  }
                });
                if (!response.ok) throw new Error('Failed to fetch data points');
                const data = await response.json();
                return data.map((dp: any) => ({
                  id: dp.id,
                  annotatedTextId: dp.annotatedTextId,
                  name: dp.name,
                  value: dp.value,
                  match: dp.match,
                  profilePointId: dp.profilePointId,
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segment-data-points`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch segment data points');
          const data = await response.json();
          return data.map((sdp: any) => ({
            id: sdp.id,
            annotatedTextId: sdp.annotatedTextId,
            name: sdp.name,
            beginMatch: sdp.beginMatch,
            endMatch: sdp.endMatch,
            profilePointId: sdp.profilePointId,
            verified: sdp.verified
          }));
        } catch (error) {
          console.error('Error fetching segment data points:', error);
          return [];
        }
      },
      add: async (segmentDataPoint: SegmentDataPointCreate): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segment-data-points`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              annotatedTextId: segmentDataPoint.annotatedTextId,
              name: segmentDataPoint.name,
              beginMatch: segmentDataPoint.beginMatch,
              endMatch: segmentDataPoint.endMatch,
              profilePointId: segmentDataPoint.profilePointId,
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segment-data-points/${segmentDataPoint.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: segmentDataPoint.name,
              beginMatch: segmentDataPoint.beginMatch,
              endMatch: segmentDataPoint.endMatch,
              profilePointId: segmentDataPoint.profilePointId,
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segment-data-points`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch segment data points');
          const data = await response.json();
          const segmentDataPoint = data.find((sdp: any) => sdp.id === id);
          if (!segmentDataPoint) return undefined;
          return {
            id: segmentDataPoint.id,
            annotatedTextId: segmentDataPoint.annotatedTextId,
            name: segmentDataPoint.name,
            beginMatch: segmentDataPoint.beginMatch,
            endMatch: segmentDataPoint.endMatch,
            profilePointId: segmentDataPoint.profilePointId,
            verified: segmentDataPoint.verified
          };
        } catch (error) {
          console.error('Error fetching segment data point:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segment-data-points/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
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
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segment-data-points`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch segment data points');
                  const data = await response.json();
                  return data
                    .filter((sdp: any) => sdp[fieldOrQuery] === value)
                    .map((sdp: any) => ({
                      id: sdp.id,
                      annotatedTextId: sdp.annotatedTextId,
                      name: sdp.name,
                      beginMatch: sdp.beginMatch,
                      endMatch: sdp.endMatch,
                      profilePointId: sdp.profilePointId,
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
                  const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segment-data-points`, {
                    headers: {
                      'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                    }
                  });
                  if (!response.ok) throw new Error('Failed to fetch segment data points');
                  const data = await response.json();
                  return data
                    .filter((sdp: any) => values.includes(sdp[fieldOrQuery]))
                    .map((sdp: any) => ({
                      id: sdp.id,
                      annotatedTextId: sdp.annotatedTextId,
                      name: sdp.name,
                      beginMatch: sdp.beginMatch,
                      endMatch: sdp.endMatch,
                      profilePointId: sdp.profilePointId,
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
                const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segment-data-points`, {
                  headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                  }
                });
                if (!response.ok) throw new Error('Failed to fetch segment data points');
                const data = await response.json();
                return data.map((sdp: any) => ({
                  id: sdp.id,
                  annotatedTextId: sdp.annotatedTextId,
                  name: sdp.name,
                  beginMatch: sdp.beginMatch,
                  endMatch: sdp.endMatch,
                  profilePointId: sdp.profilePointId,
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/profile-points`, {
            headers: this.getAuthHeaders()
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
            profileId: pp.profileId,
            order: pp.order,
            previousPointId: pp.previousPointId,
            nextPointId: pp.nextPointId
          }));
        } catch (error) {
          console.error('Error fetching profile points:', error);
          return [];
        }
      },
      add: async (profilePoint: ProfilePointCreate): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/profile-points`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: profilePoint.name,
              explanation: profilePoint.explanation,
              synonyms: profilePoint.synonyms,
              datatype: profilePoint.datatype,
              valueset: profilePoint.valueset,
              unit: profilePoint.unit,
              profileId: profilePoint.profileId,
              order: profilePoint.order,
              previousPointId: profilePoint.previousPointId,
              nextPointId: profilePoint.nextPointId
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/profile-points/${profilePoint.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: profilePoint.name,
              explanation: profilePoint.explanation,
              synonyms: profilePoint.synonyms,
              datatype: profilePoint.datatype,
              valueset: profilePoint.valueset,
              unit: profilePoint.unit,
              profileId: profilePoint.profileId,
              order: profilePoint.order,
              previousPointId: profilePoint.previousPointId,
              nextPointId: profilePoint.nextPointId
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/profile-points`, {
            headers: this.getAuthHeaders()
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
            profileId: profilePoint.profileId,
            order: profilePoint.order,
            previousPointId: profilePoint.previousPointId,
            nextPointId: profilePoint.nextPointId
          };
        } catch (error) {
          console.error('Error fetching profile point:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/profile-points/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
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
              const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/profile-points`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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
                  profileId: pp.profileId,
                  order: pp.order,
                  previousPointId: pp.previousPointId,
                  nextPointId: pp.nextPointId
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
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/profile-points/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: changes.name,
              explanation: changes.explanation,
              synonyms: changes.synonyms,
              datatype: changes.datatype,
              valueset: changes.valueset,
              unit: changes.unit,
              profileId: changes.profileId,
              order: changes.order,
              previousPointId: changes.previousPointId,
              nextPointId: changes.nextPointId
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
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segmentation-profile-points`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch segmentation profile points');
          const data = await response.json();
          return data.map((spp: any) => ({
            id: spp.id,
            name: spp.name,
            explanation: spp.explanation,
            synonyms: spp.synonyms,
            profileId: spp.profileId,
            order: spp.order,
            previousPointId: spp.previousPointId,
            nextPointId: spp.nextPointId
          }));
        } catch (error) {
          console.error('Error fetching segmentation profile points:', error);
          return [];
        }
      },
      add: async (segmentationProfilePoint: SegmentationProfilePointCreate): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segmentation-profile-points`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: segmentationProfilePoint.name,
              explanation: segmentationProfilePoint.explanation,
              synonyms: segmentationProfilePoint.synonyms,
              profileId: segmentationProfilePoint.profileId,
              order: segmentationProfilePoint.order,
              previousPointId: segmentationProfilePoint.previousPointId,
              nextPointId: segmentationProfilePoint.nextPointId
            })
          });
          if (!response.ok) throw new Error('Failed to create segmentation profile point');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating segmentation profile point:', error);
          throw error;
        }
      },
      put: async (segmentationProfilePoint: SegmentationProfilePoint): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segmentation-profile-points/${segmentationProfilePoint.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: segmentationProfilePoint.name,
              explanation: segmentationProfilePoint.explanation,
              synonyms: segmentationProfilePoint.synonyms,
              profileId: segmentationProfilePoint.profileId,
              order: segmentationProfilePoint.order,
              previousPointId: segmentationProfilePoint.previousPointId,
              nextPointId: segmentationProfilePoint.nextPointId
            })
          });
          if (!response.ok) throw new Error('Failed to update segmentation profile point');
          return segmentationProfilePoint.id;
        } catch (error) {
          console.error('Error updating segmentation profile point:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<SegmentationProfilePoint | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segmentation-profile-points`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch segmentation profile points');
          const data = await response.json();
          const segmentationProfilePoint = data.find((spp: any) => spp.id === id);
          if (!segmentationProfilePoint) return undefined;
          return {
            id: segmentationProfilePoint.id,
            name: segmentationProfilePoint.name,
            explanation: segmentationProfilePoint.explanation,
            synonyms: segmentationProfilePoint.synonyms,
            profileId: segmentationProfilePoint.profileId,
            order: segmentationProfilePoint.order,
            previousPointId: segmentationProfilePoint.previousPointId,
            nextPointId: segmentationProfilePoint.nextPointId
          };
        } catch (error) {
          console.error('Error fetching segmentation profile point:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segmentation-profile-points/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete segmentation profile point');
        } catch (error) {
          console.error('Error deleting segmentation profile point:', error);
          throw error;
        }
      },
      where: (field: string) => ({
        equals: (value: any) => ({
          toArray: async (): Promise<SegmentationProfilePoint[]> => {
            try {
              const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segmentation-profile-points`, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                }
              });
              if (!response.ok) throw new Error('Failed to fetch segmentation profile points');
              const data = await response.json();
              return data
                .filter((spp: any) => spp[field] === value)
                .map((spp: any) => ({
                  id: spp.id,
                  name: spp.name,
                  explanation: spp.explanation,
                  synonyms: spp.synonyms,
                  profileId: spp.profileId,
                  order: spp.order,
                  previousPointId: spp.previousPointId,
                  nextPointId: spp.nextPointId
                }));
            } catch (error) {
              console.error('Error filtering segmentation profile points:', error);
              return [];
            }
          }
        })
      }),
      update: async (id: string, changes: Partial<SegmentationProfilePoint>): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/segmentation-profile-points/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: changes.name,
              explanation: changes.explanation,
              synonyms: changes.synonyms,
              profileId: changes.profileId,
              order: changes.order,
              previousPointId: changes.previousPointId,
              nextPointId: changes.nextPointId
            })
          });
          if (!response.ok) throw new Error('Failed to update segmentation profile point');
        } catch (error) {
          console.error('Error updating segmentation profile point:', error);
          throw error;
        }
      }
    };
  }

  get ApiKeys() {
    return {
      toArray: async (): Promise<ApiKey[]> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/api-keys`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch API keys');
          const data = await response.json();
          return data.map((ak: any) => ({
            id: ak.id,
            key: ak.key
          }));
        } catch (error) {
          console.error('Error fetching API keys:', error);
          return [];
        }
      },
      add: async (apiKey: ApiKey): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/api-keys`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              key: apiKey.key
            })
          });
          if (!response.ok) throw new Error('Failed to create API key');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating API key:', error);
          throw error;
        }
      },
      put: async (apiKey: ApiKey): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/api-keys/${apiKey.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              key: apiKey.key
            })
          });
          if (!response.ok) throw new Error('Failed to update API key');
          return apiKey.id;
        } catch (error) {
          console.error('Error updating API key:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<ApiKey | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/api-keys`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch API keys');
          const data = await response.json();
          const apiKey = data.find((ak: any) => ak.id === id);
          if (!apiKey) return undefined;
          return {
            id: apiKey.id,
            key: apiKey.key
          };
        } catch (error) {
          console.error('Error fetching API key:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/api-keys/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete API key');
        } catch (error) {
          console.error('Error deleting API key:', error);
          throw error;
        }
      }
    };
  }

  get models() {
    return {
      toArray: async (): Promise<Model[]> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/models`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch models');
          const data = await response.json();
          return data.map((m: any) => ({
            id: m.id,
            name: m.name
          }));
        } catch (error) {
          console.error('Error fetching models:', error);
          return [];
        }
      },
      add: async (model: Model): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/models`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: model.name
            })
          });
          if (!response.ok) throw new Error('Failed to create model');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating model:', error);
          throw error;
        }
      },
      put: async (model: Model): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/models/${model.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              name: model.name
            })
          });
          if (!response.ok) throw new Error('Failed to update model');
          return model.id;
        } catch (error) {
          console.error('Error updating model:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<Model | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/models`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch models');
          const data = await response.json();
          const model = data.find((m: any) => m.id === id);
          if (!model) return undefined;
          return {
            id: model.id,
            name: model.name
          };
        } catch (error) {
          console.error('Error fetching model:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/models/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete model');
        } catch (error) {
          console.error('Error deleting model:', error);
          throw error;
        }
      }
    };
  }

  get llmProviders() {
    return {
      toArray: async (): Promise<LLMProvider[]> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-providers`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch LLM providers');
          const data = await response.json();
          return data.map((lp: any) => ({
            id: lp.id,
            provider: lp.provider
          }));
        } catch (error) {
          console.error('Error fetching LLM providers:', error);
          return [];
        }
      },
      add: async (llmProvider: LLMProvider): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-providers`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              provider: llmProvider.provider
            })
          });
          if (!response.ok) throw new Error('Failed to create LLM provider');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating LLM provider:', error);
          throw error;
        }
      },
      put: async (llmProvider: LLMProvider): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-providers/${llmProvider.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              provider: llmProvider.provider
            })
          });
          if (!response.ok) throw new Error('Failed to update LLM provider');
          return llmProvider.id;
        } catch (error) {
          console.error('Error updating LLM provider:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<LLMProvider | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-providers`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch LLM providers');
          const data = await response.json();
          const provider = data.find((lp: any) => lp.id === id);
          if (!provider) return undefined;
          return {
            id: provider.id,
            provider: provider.provider
          };
        } catch (error) {
          console.error('Error fetching LLM provider:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-providers/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete LLM provider');
        } catch (error) {
          console.error('Error deleting LLM provider:', error);
          throw error;
        }
      }
    };
  }

  get llmUrls() {
    return {
      toArray: async (): Promise<LLMUrl[]> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-urls`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch LLM URLs');
          const data = await response.json();
          return data.map((lu: any) => ({
            id: lu.id,
            url: lu.url
          }));
        } catch (error) {
          console.error('Error fetching LLM URLs:', error);
          return [];
        }
      },
      add: async (llmUrl: LLMUrl): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-urls`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              url: llmUrl.url
            })
          });
          if (!response.ok) throw new Error('Failed to create LLM URL');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating LLM URL:', error);
          throw error;
        }
      },
      put: async (llmUrl: LLMUrl): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-urls/${llmUrl.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              url: llmUrl.url
            })
          });
          if (!response.ok) throw new Error('Failed to update LLM URL');
          return llmUrl.id;
        } catch (error) {
          console.error('Error updating LLM URL:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<LLMUrl | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-urls`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch LLM URLs');
          const data = await response.json();
          const url = data.find((lu: any) => lu.id === id);
          if (!url) return undefined;
          return {
            id: url.id,
            url: url.url
          };
        } catch (error) {
          console.error('Error fetching LLM URL:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/llm-urls/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete LLM URL');
        } catch (error) {
          console.error('Error deleting LLM URL:', error);
          throw error;
        }
      }
    };
  }

  get batchSizes() {
    return {
      toArray: async (): Promise<BatchSize[]> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/batch-sizes`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch batch sizes');
          const data = await response.json();
          return data.map((bs: any) => ({
            id: bs.id,
            value: bs.value
          }));
        } catch (error) {
          console.error('Error fetching batch sizes:', error);
          return [];
        }
      },
      add: async (batchSize: BatchSize): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/batch-sizes`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              value: batchSize.value
            })
          });
          if (!response.ok) throw new Error('Failed to create batch size');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating batch size:', error);
          throw error;
        }
      },
      put: async (batchSize: BatchSize): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/batch-sizes/${batchSize.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              value: batchSize.value
            })
          });
          if (!response.ok) throw new Error('Failed to update batch size');
          return batchSize.id;
        } catch (error) {
          console.error('Error updating batch size:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<BatchSize | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/batch-sizes`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch batch sizes');
          const data = await response.json();
          const batchSize = data.find((bs: any) => bs.id === id);
          if (!batchSize) return undefined;
          return {
            id: batchSize.id,
            value: batchSize.value
          };
        } catch (error) {
          console.error('Error fetching batch size:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/batch-sizes/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete batch size');
        } catch (error) {
          console.error('Error deleting batch size:', error);
          throw error;
        }
      }
    };
  }

  get maxTokens() {
    return {
      toArray: async (): Promise<MaxTokens[]> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/max-tokens`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch max tokens');
          const data = await response.json();
          return data.map((mt: any) => ({
            id: mt.id,
            value: mt.value
          }));
        } catch (error) {
          console.error('Error fetching max tokens:', error);
          return [];
        }
      },
      add: async (maxTokens: MaxTokens): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/max-tokens`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              value: maxTokens.value
            })
          });
          if (!response.ok) throw new Error('Failed to create max tokens');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating max tokens:', error);
          throw error;
        }
      },
      put: async (maxTokens: MaxTokens): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/max-tokens/${maxTokens.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              value: maxTokens.value
            })
          });
          if (!response.ok) throw new Error('Failed to update max tokens');
          return maxTokens.id;
        } catch (error) {
          console.error('Error updating max tokens:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<MaxTokens | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/max-tokens`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch max tokens');
          const data = await response.json();
          const maxTokens = data.find((mt: any) => mt.id === id);
          if (!maxTokens) return undefined;
          return {
            id: maxTokens.id,
            value: maxTokens.value
          };
        } catch (error) {
          console.error('Error fetching max tokens:', error);
          return undefined;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/max-tokens/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete max tokens');
        } catch (error) {
          console.error('Error deleting max tokens:', error);
          throw error;
        }
      }
    };
  }

  get userSettings() {
    return {
      toArray: async (): Promise<UserSettings[]> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/user-settings`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch user settings');
          const data = await response.json();
          return data.map((us: any) => ({
            id: us.id,
            tutorialCompleted: us.tutorialCompleted
          }));
        } catch (error) {
          console.error('Error fetching user settings:', error);
          return [];
        }
      },
      add: async (userSettings: UserSettings): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/user-settings`, {
            method: 'POST',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              tutorialCompleted: userSettings.tutorialCompleted
            })
          });
          if (!response.ok) throw new Error('Failed to create user settings');
          const data = await response.json();
          return data.id;
        } catch (error) {
          console.error('Error creating user settings:', error);
          throw error;
        }
      },
      put: async (userSettings: UserSettings): Promise<string> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/user-settings/${userSettings.id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              tutorialCompleted: userSettings.tutorialCompleted
            })
          });
          if (!response.ok) throw new Error('Failed to update user settings');
          return userSettings.id;
        } catch (error) {
          console.error('Error updating user settings:', error);
          throw error;
        }
      },
      get: async (id: string): Promise<UserSettings | undefined> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/user-settings`, {
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to fetch user settings');
          const data = await response.json();
          const settings = data.find((us: any) => us.id === id);
          if (!settings) return undefined;
          return {
            id: settings.id,
            tutorialCompleted: settings.tutorialCompleted
          };
        } catch (error) {
          console.error('Error fetching user settings:', error);
          return undefined;
        }
      },
      update: async (id: string, changes: Partial<UserSettings>): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/user-settings/${id}`, {
            method: 'PUT',
            headers: this.getAuthHeaders(),
            body: JSON.stringify({
              tutorialCompleted: changes.tutorialCompleted
            })
          });
          if (!response.ok) throw new Error('Failed to update user settings');
        } catch (error) {
          console.error('Error updating user settings:', error);
          throw error;
        }
      },
      delete: async (id: string): Promise<void> => {
        try {
          const response = await fetch(`${this.baseUrl}/user-data/${this.storageId}/user-settings/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeaders()
          });
          if (!response.ok) throw new Error('Failed to delete user settings');
        } catch (error) {
          console.error('Error deleting user settings:', error);
          throw error;
        }
      }
    };
  }
}
