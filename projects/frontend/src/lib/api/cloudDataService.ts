import { useAuth } from '@/contexts/AuthContext';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Generic API call function with authentication
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Profile types (matching backend schemas)
export interface CloudProfile {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  mode: string;
  example?: { text: string; output: Record<string, string> };
  created_at: string;
  updated_at: string;
}

export interface CloudProfileCreate {
  name: string;
  description?: string;
  mode: string;
  example?: { text: string; output: Record<string, string> };
}

export interface CloudProfilePoint {
  id: string;
  profile_id: string;
  name: string;
  explanation?: string;
  synonyms: string[];
  datatype: string;
  valueset?: string[];
  unit?: string;
  order: number;
  previous_point_id?: string;
  next_point_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CloudProfilePointCreate {
  profile_id: string;
  name: string;
  explanation?: string;
  synonyms: string[];
  datatype: string;
  valueset?: string[];
  unit?: string;
  order?: number;
  previous_point_id?: string;
  next_point_id?: string;
}

// Dataset types
export interface CloudDataset {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  mode: string;
  created_at: string;
  updated_at: string;
}

export interface CloudDatasetCreate {
  name: string;
  description?: string;
  mode: string;
}

// Cloud Data Service
export class CloudDataService {
  // Profile operations
  static async createProfile(profile: CloudProfileCreate): Promise<CloudProfile> {
    return apiCall<CloudProfile>('/data/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  }

  static async getProfiles(): Promise<CloudProfile[]> {
    return apiCall<CloudProfile[]>('/data/profiles');
  }

  static async getProfile(profileId: string): Promise<CloudProfile> {
    return apiCall<CloudProfile>(`/data/profiles/${profileId}`);
  }

  static async updateProfile(profileId: string, profile: CloudProfileCreate): Promise<CloudProfile> {
    return apiCall<CloudProfile>(`/data/profiles/${profileId}`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  static async deleteProfile(profileId: string): Promise<void> {
    return apiCall<void>(`/data/profiles/${profileId}`, {
      method: 'DELETE',
    });
  }

  // Profile Point operations
  static async createProfilePoint(point: CloudProfilePointCreate): Promise<CloudProfilePoint> {
    return apiCall<CloudProfilePoint>('/data/profile-points', {
      method: 'POST',
      body: JSON.stringify(point),
    });
  }

  static async getProfilePoints(profileId: string): Promise<CloudProfilePoint[]> {
    return apiCall<CloudProfilePoint[]>(`/data/profiles/${profileId}/points`);
  }

  // Dataset operations
  static async createDataset(dataset: CloudDatasetCreate): Promise<CloudDataset> {
    return apiCall<CloudDataset>('/data/datasets', {
      method: 'POST',
      body: JSON.stringify(dataset),
    });
  }

  static async getDatasets(): Promise<CloudDataset[]> {
    return apiCall<CloudDataset[]>('/data/datasets');
  }

  static async getDataset(datasetId: string): Promise<CloudDataset> {
    return apiCall<CloudDataset>(`/data/datasets/${datasetId}`);
  }

  // User Settings operations
  static async getUserSettings(): Promise<any> {
    return apiCall<any>('/data/settings');
  }

  static async updateUserSettings(settings: any): Promise<any> {
    return apiCall<any>('/data/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  // LLM Config operations
  static async getLLMConfig(): Promise<any> {
    return apiCall<any>('/data/llm-config');
  }

  static async updateLLMConfig(config: any): Promise<any> {
    return apiCall<any>('/data/llm-config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }
} 