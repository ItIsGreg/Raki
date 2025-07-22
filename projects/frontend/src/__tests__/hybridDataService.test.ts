import { HybridDataService } from '@/lib/api/hybridDataService';
import { CloudDataService } from '@/lib/api/cloudDataService';
import * as crud from '@/lib/db/crud';

// Mock the dependencies
jest.mock('@/lib/api/cloudDataService');
jest.mock('@/lib/db/crud');

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('HybridDataService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Authentication Detection', () => {
    it('should detect authenticated state when token exists', () => {
      mockLocalStorage.getItem.mockReturnValue('fake-jwt-token');
      expect(HybridDataService.isAuthenticated()).toBe(true);
    });

    it('should detect unauthenticated state when no token exists', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(HybridDataService.isAuthenticated()).toBe(false);
    });
  });

  describe('Profile Operations - Authenticated (Cloud Storage)', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue('fake-jwt-token');
    });

    it('should create profile using cloud service when authenticated', async () => {
      const profileCreate = {
        name: 'Test Profile',
        description: 'Test Description',
        mode: 'datapoint_extraction' as const,
      };

      const cloudProfile = {
        id: 'cloud-profile-id',
        user_id: 'user-id',
        name: 'Test Profile',
        description: 'Test Description',
        mode: 'datapoint_extraction',
        example: null,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      (CloudDataService.createProfile as jest.Mock).mockResolvedValue(cloudProfile);

      const result = await HybridDataService.createProfile(profileCreate);

      expect(CloudDataService.createProfile).toHaveBeenCalledWith({
        name: 'Test Profile',
        description: 'Test Description',
        mode: 'datapoint_extraction',
        example: undefined,
      });

      expect(result).toEqual({
        id: 'cloud-profile-id',
        name: 'Test Profile',
        description: 'Test Description',
        mode: 'datapoint_extraction',
        example: null,
      });
    });

    it('should get profiles using cloud service when authenticated', async () => {
      const cloudProfiles = [
        {
          id: 'profile-1',
          user_id: 'user-id',
          name: 'Profile 1',
          description: 'Description 1',
          mode: 'datapoint_extraction',
          example: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'profile-2',
          user_id: 'user-id',
          name: 'Profile 2',
          description: 'Description 2',
          mode: 'text_segmentation',
          example: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      (CloudDataService.getProfiles as jest.Mock).mockResolvedValue(cloudProfiles);

      const result = await HybridDataService.getProfiles();

      expect(CloudDataService.getProfiles).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Profile 1');
      expect(result[1].name).toBe('Profile 2');
    });

    it('should filter profiles by mode when authenticated', async () => {
      const cloudProfiles = [
        {
          id: 'profile-1',
          user_id: 'user-id',
          name: 'Profile 1',
          description: 'Description 1',
          mode: 'datapoint_extraction',
          example: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
        {
          id: 'profile-2',
          user_id: 'user-id',
          name: 'Profile 2',
          description: 'Description 2',
          mode: 'text_segmentation',
          example: null,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      (CloudDataService.getProfiles as jest.Mock).mockResolvedValue(cloudProfiles);

      const result = await HybridDataService.getProfiles('datapoint_extraction');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Profile 1');
      expect(result[0].mode).toBe('datapoint_extraction');
    });

    it('should delete profile using cloud service when authenticated', async () => {
      (CloudDataService.deleteProfile as jest.Mock).mockResolvedValue(undefined);

      const result = await HybridDataService.deleteProfile('profile-id');

      expect(CloudDataService.deleteProfile).toHaveBeenCalledWith('profile-id');
      expect(result).toBe(true);
    });
  });

  describe('Profile Operations - Unauthenticated (Local Storage)', () => {
    beforeEach(() => {
      mockLocalStorage.getItem.mockReturnValue(null);
    });

    it('should create profile using local storage when unauthenticated', async () => {
      const profileCreate = {
        name: 'Local Profile',
        description: 'Local Description',
        mode: 'datapoint_extraction' as const,
      };

      const localProfile = {
        id: 'local-profile-id',
        name: 'Local Profile',
        description: 'Local Description',
        mode: 'datapoint_extraction' as const,
      };

      (crud.createProfile as jest.Mock).mockResolvedValue(localProfile);

      const result = await HybridDataService.createProfile(profileCreate);

      expect(crud.createProfile).toHaveBeenCalledWith(profileCreate);
      expect(result).toEqual(localProfile);
    });

    it('should get all profiles from both modes when unauthenticated and no mode specified', async () => {
      const dataPointProfiles = [
        { id: '1', name: 'DP Profile', description: '', mode: 'datapoint_extraction' as const },
      ];
      const segmentationProfiles = [
        { id: '2', name: 'Seg Profile', description: '', mode: 'text_segmentation' as const },
      ];

      (crud.readProfilesByMode as jest.Mock)
        .mockResolvedValueOnce(dataPointProfiles)
        .mockResolvedValueOnce(segmentationProfiles);

      const result = await HybridDataService.getProfiles();

      expect(crud.readProfilesByMode).toHaveBeenCalledWith('datapoint_extraction');
      expect(crud.readProfilesByMode).toHaveBeenCalledWith('text_segmentation');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('DP Profile');
      expect(result[1].name).toBe('Seg Profile');
    });

    it('should get profiles by mode when unauthenticated and mode specified', async () => {
      const dataPointProfiles = [
        { id: '1', name: 'DP Profile', description: '', mode: 'datapoint_extraction' as const },
      ];

      (crud.readProfilesByMode as jest.Mock).mockResolvedValue(dataPointProfiles);

      const result = await HybridDataService.getProfiles('datapoint_extraction');

      expect(crud.readProfilesByMode).toHaveBeenCalledWith('datapoint_extraction');
      expect(result).toEqual(dataPointProfiles);
    });

    it('should delete profile using local storage when unauthenticated', async () => {
      (crud.deleteProfile as jest.Mock).mockResolvedValue(undefined);

      const result = await HybridDataService.deleteProfile('profile-id');

      expect(crud.deleteProfile).toHaveBeenCalledWith('profile-id');
      expect(result).toBe(true);
    });
  });

  describe('Dataset Operations', () => {
    it('should route to cloud service when authenticated', async () => {
      mockLocalStorage.getItem.mockReturnValue('fake-jwt-token');

      const datasetCreate = {
        name: 'Test Dataset',
        description: 'Test Description',
        mode: 'datapoint_extraction' as const,
      };

      const cloudDataset = {
        id: 'cloud-dataset-id',
        user_id: 'user-id',
        name: 'Test Dataset',
        description: 'Test Description',
        mode: 'datapoint_extraction',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      (CloudDataService.createDataset as jest.Mock).mockResolvedValue(cloudDataset);

      const result = await HybridDataService.createDataset(datasetCreate);

      expect(CloudDataService.createDataset).toHaveBeenCalledWith({
        name: 'Test Dataset',
        description: 'Test Description',
        mode: 'datapoint_extraction',
      });

      expect(result).toEqual({
        id: 'cloud-dataset-id',
        name: 'Test Dataset',
        description: 'Test Description',
        mode: 'datapoint_extraction',
      });
    });

    it('should route to local storage when unauthenticated', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const datasetCreate = {
        name: 'Local Dataset',
        description: 'Local Description',
        mode: 'datapoint_extraction' as const,
      };

      const localDataset = {
        id: 'local-dataset-id',
        name: 'Local Dataset',
        description: 'Local Description',
        mode: 'datapoint_extraction' as const,
      };

      (crud.createDataset as jest.Mock).mockResolvedValue(localDataset);

      const result = await HybridDataService.createDataset(datasetCreate);

      expect(crud.createDataset).toHaveBeenCalledWith(datasetCreate);
      expect(result).toEqual(localDataset);
    });
  });

  describe('Error Handling', () => {
    it('should handle cloud service errors gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue('fake-jwt-token');

      (CloudDataService.getProfile as jest.Mock).mockRejectedValue(new Error('Network error'));

      const result = await HybridDataService.getProfile('profile-id');

      expect(result).toBeUndefined();
    });

    it('should handle local storage errors gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      (crud.deleteProfile as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await HybridDataService.deleteProfile('profile-id');

      expect(result).toBe(false);
    });
  });

  describe('Data Migration', () => {
    it('should throw error when trying to migrate without authentication', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      await expect(HybridDataService.migrateLocalDataToCloud()).rejects.toThrow(
        'Must be authenticated to migrate data to cloud'
      );
    });

    it('should migrate profiles and profile points to cloud when authenticated', async () => {
      mockLocalStorage.getItem.mockReturnValue('fake-jwt-token');

      // Mock local data
      const localDataPointProfiles = [
        { id: 'local-1', name: 'DP Profile', description: '', mode: 'datapoint_extraction' as const },
      ];
      const localSegmentationProfiles = [
        { id: 'local-2', name: 'Seg Profile', description: '', mode: 'text_segmentation' as const },
      ];
      const localDatasets = [
        { id: 'dataset-1', name: 'Dataset 1', description: '', mode: 'datapoint_extraction' as const },
      ];
      const localProfilePoints = [
        {
          id: 'point-1',
          profileId: 'local-1',
          name: 'Point 1',
          explanation: '',
          synonyms: [],
          datatype: 'string',
          valueset: undefined,
          unit: undefined,
          order: 0,
          previousPointId: null,
          nextPointId: null,
        },
      ];

      // Mock CRUD calls
      (crud.readProfilesByMode as jest.Mock)
        .mockResolvedValueOnce(localDataPointProfiles)
        .mockResolvedValueOnce(localSegmentationProfiles);
      (crud.readAllDatasets as jest.Mock).mockResolvedValue(localDatasets);
      (crud.readProfilePointsByProfile as jest.Mock).mockResolvedValue(localProfilePoints);

      // Mock cloud service responses
      const cloudProfile = {
        id: 'cloud-profile-1',
        user_id: 'user-id',
        name: 'DP Profile',
        description: '',
        mode: 'datapoint_extraction',
        example: undefined,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
      };

      (CloudDataService.createProfile as jest.Mock).mockResolvedValue(cloudProfile);
      (CloudDataService.createProfilePoint as jest.Mock).mockResolvedValue({});
      (CloudDataService.createDataset as jest.Mock).mockResolvedValue({});

      await HybridDataService.migrateLocalDataToCloud();

      // Verify profile migration
      expect(CloudDataService.createProfile).toHaveBeenCalledTimes(2);
      expect(CloudDataService.createProfile).toHaveBeenCalledWith({
        name: 'DP Profile',
        description: '',
        mode: 'datapoint_extraction',
        example: undefined,
      });

      // Verify profile point migration
      expect(CloudDataService.createProfilePoint).toHaveBeenCalledWith({
        profile_id: 'cloud-profile-1',
        name: 'Point 1',
        explanation: '',
        synonyms: [],
        datatype: 'string',
        valueset: undefined,
        unit: undefined,
        order: 0,
        previous_point_id: undefined,
        next_point_id: undefined,
      });

      // Verify dataset migration
      expect(CloudDataService.createDataset).toHaveBeenCalledWith({
        name: 'Dataset 1',
        description: '',
        mode: 'datapoint_extraction',
      });
    });
  });
}); 