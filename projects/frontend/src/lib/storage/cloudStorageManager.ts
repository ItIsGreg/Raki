import { MySubClassedDexie } from '@/lib/db/db';
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

export interface CloudStorage {
  id: string;
  name: string;
  type: 'cloud';
  storageId: string;
}

export interface CloudStorageResponse {
  id: string;
  userId: string;
  storageName: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StorageDataExport {
  profiles: any[];
  datasets: any[];
  texts: any[];
  annotated_datasets: any[];
  annotated_texts: any[];
  data_points: any[];
  segment_data_points: any[];
  profile_points: any[];
  segmentation_profile_points: any[];
  api_keys: any[];
  models: any[];
  llm_providers: any[];
  llm_urls: any[];
  batch_sizes: any[];
  max_tokens: any[];
  user_settings: any[];
}

class CloudStorageManager {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    // Only access localStorage on client side
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('auth_token');
    }
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/user-data${endpoint}`;
    
    // Get fresh token from localStorage (only on client side)
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    console.log('Auth token available:', !!token);
    console.log('Token value:', token ? `${token.substring(0, 10)}...` : 'null');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    console.log(`Making request to: ${url}`);
    console.log('Headers:', headers);

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log(`Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error:', errorData);
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Storage Management
  async createStorage(name: string): Promise<CloudStorageResponse> {
    return this.makeRequest<CloudStorageResponse>('/', {
      method: 'POST',
      body: JSON.stringify({ storageName: name }),
    });
  }

  async getStorages(): Promise<CloudStorageResponse[]> {
    return this.makeRequest<CloudStorageResponse[]>('/');
  }

  async getStorage(storageId: string): Promise<CloudStorageResponse> {
    return this.makeRequest<CloudStorageResponse>(`/${storageId}`);
  }

  async updateStorage(storageId: string, name: string): Promise<CloudStorageResponse> {
    return this.makeRequest<CloudStorageResponse>(`/${storageId}`, {
      method: 'PUT',
      body: JSON.stringify({ storageName: name }),
    });
  }

  async deleteStorage(storageId: string): Promise<void> {
    await this.makeRequest(`/${storageId}`, {
      method: 'DELETE',
    });
  }

  // Migration
  async migrateLocalToCloud(storageName: string, localData: StorageDataExport): Promise<CloudStorageResponse> {
    return this.makeRequest<CloudStorageResponse>('/migrate-local', {
      method: 'POST',
      body: JSON.stringify({
        storageName: storageName,
        ...localData,
      }),
    });
  }

  async exportCloudToLocal(storageId: string): Promise<StorageDataExport> {
    return this.makeRequest<StorageDataExport>(`/${storageId}/export`);
  }

  // Profile CRUD
  async createProfile(storageId: string, profileData: ProfileCreate): Promise<Profile> {
    return this.makeRequest<Profile>(`/${storageId}/profiles`, {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getProfiles(storageId: string): Promise<Profile[]> {
    return this.makeRequest<Profile[]>(`/${storageId}/profiles`);
  }

  async updateProfile(storageId: string, profileId: string, profileData: Partial<ProfileCreate>): Promise<Profile> {
    return this.makeRequest<Profile>(`/${storageId}/profiles/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async deleteProfile(storageId: string, profileId: string): Promise<void> {
    await this.makeRequest(`/${storageId}/profiles/${profileId}`, {
      method: 'DELETE',
    });
  }

  // Dataset CRUD
  async createDataset(storageId: string, datasetData: DatasetCreate): Promise<Dataset> {
    return this.makeRequest<Dataset>(`/${storageId}/datasets`, {
      method: 'POST',
      body: JSON.stringify(datasetData),
    });
  }

  async getDatasets(storageId: string): Promise<Dataset[]> {
    return this.makeRequest<Dataset[]>(`/${storageId}/datasets`);
  }

  async updateDataset(storageId: string, datasetId: string, datasetData: Partial<DatasetCreate>): Promise<Dataset> {
    return this.makeRequest<Dataset>(`/${storageId}/datasets/${datasetId}`, {
      method: 'PUT',
      body: JSON.stringify(datasetData),
    });
  }

  async deleteDataset(storageId: string, datasetId: string): Promise<void> {
    await this.makeRequest(`/${storageId}/datasets/${datasetId}`, {
      method: 'DELETE',
    });
  }

  // Helper method to convert cloud storage to local format
  convertCloudToLocal(cloudData: StorageDataExport): {
    profiles: Profile[];
    datasets: Dataset[];
    texts: Text[];
    annotatedDatasets: AnnotatedDataset[];
    annotatedTexts: AnnotatedText[];
    dataPoints: DataPoint[];
    segmentDataPoints: SegmentDataPoint[];
    profilePoints: ProfilePoint[];
    segmentationProfilePoints: SegmentationProfilePoint[];
    apiKeys: ApiKey[];
    models: Model[];
    llmProviders: LLMProvider[];
    llmUrls: LLMUrl[];
    batchSizes: BatchSize[];
    maxTokens: MaxTokens[];
    userSettings: UserSettings[];
  } {
    return {
      profiles: cloudData.profiles.map(p => ({ ...p, id: p.id })),
      datasets: cloudData.datasets.map(d => ({ ...d, id: d.id })),
      texts: cloudData.texts.map(t => ({ ...t, id: t.id })),
      annotatedDatasets: cloudData.annotated_datasets.map(ad => ({ ...ad, id: ad.id })),
      annotatedTexts: cloudData.annotated_texts.map(at => ({ ...at, id: at.id })),
      dataPoints: cloudData.data_points.map(dp => ({ ...dp, id: dp.id })),
      segmentDataPoints: cloudData.segment_data_points.map(sdp => ({ ...sdp, id: sdp.id })),
      profilePoints: cloudData.profile_points.map(pp => ({ ...pp, id: pp.id })),
      segmentationProfilePoints: cloudData.segmentation_profile_points.map(spp => ({ ...spp, id: spp.id })),
      apiKeys: cloudData.api_keys.map(ak => ({ ...ak, id: ak.id })),
      models: cloudData.models.map(m => ({ ...m, id: m.id })),
      llmProviders: cloudData.llm_providers.map(lp => ({ ...lp, id: lp.id })),
      llmUrls: cloudData.llm_urls.map(lu => ({ ...lu, id: lu.id })),
      batchSizes: cloudData.batch_sizes.map(bs => ({ ...bs, id: bs.id })),
      maxTokens: cloudData.max_tokens.map(mt => ({ ...mt, id: mt.id })),
      userSettings: cloudData.user_settings.map(us => ({ ...us, id: us.id })),
    };
  }

  // Helper method to convert local data to cloud format
  convertLocalToCloud(localData: {
    profiles: Profile[];
    datasets: Dataset[];
    texts: Text[];
    annotatedDatasets: AnnotatedDataset[];
    annotatedTexts: AnnotatedText[];
    dataPoints: DataPoint[];
    segmentDataPoints: SegmentDataPoint[];
    profilePoints: ProfilePoint[];
    segmentationProfilePoints: SegmentationProfilePoint[];
    apiKeys: ApiKey[];
    models: Model[];
    llmProviders: LLMProvider[];
    llmUrls: LLMUrl[];
    batchSizes: BatchSize[];
    maxTokens: MaxTokens[];
    userSettings: UserSettings[];
  }): StorageDataExport {
    return {
      profiles: localData.profiles.map(p => ({ ...p, id: p.id })),
      datasets: localData.datasets.map(d => ({ ...d, id: d.id })),
      texts: localData.texts.map(t => ({ ...t, id: t.id })),
      annotated_datasets: localData.annotatedDatasets.map(ad => ({ ...ad, id: ad.id })),
      annotated_texts: localData.annotatedTexts.map(at => ({ ...at, id: at.id })),
      data_points: localData.dataPoints.map(dp => ({ ...dp, id: dp.id })),
      segment_data_points: localData.segmentDataPoints.map(sdp => ({ ...sdp, id: sdp.id })),
      profile_points: localData.profilePoints.map(pp => ({ ...pp, id: pp.id })),
      segmentation_profile_points: localData.segmentationProfilePoints.map(spp => ({ ...spp, id: spp.id })),
      api_keys: localData.apiKeys.map(ak => ({ ...ak, id: ak.id })),
      models: localData.models.map(m => ({ ...m, id: m.id })),
      llm_providers: localData.llmProviders.map(lp => ({ ...lp, id: lp.id })),
      llm_urls: localData.llmUrls.map(lu => ({ ...lu, id: lu.id })),
      batch_sizes: localData.batchSizes.map(bs => ({ ...bs, id: bs.id })),
      max_tokens: localData.maxTokens.map(mt => ({ ...mt, id: mt.id })),
      user_settings: localData.userSettings.map(us => ({ ...us, id: us.id })),
    };
  }
}

export const cloudStorageManager = new CloudStorageManager();
