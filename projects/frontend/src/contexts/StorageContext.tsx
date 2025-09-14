"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MySubClassedDexie } from '@/lib/db/db';
import { DATABASE_NAME } from '@/app/constants';
import { cloudStorageManager, CloudStorageResponse } from '@/lib/storage/cloudStorageManager';

export interface Storage {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  database?: MySubClassedDexie;
  storageId?: string; // For cloud storages
}

export interface StorageContextType {
  storages: Storage[];
  currentStorage: Storage | null;
  addStorage: (name: string, type: 'local' | 'cloud') => Promise<void>;
  switchStorage: (storageId: string) => void;
  removeStorage: (storageId: string) => void;
  syncCloudStorages: () => Promise<void>;
  migrateLocalToCloud: (storageId: string, cloudStorageName: string) => Promise<void>;
  isLoading: boolean;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
};

interface StorageProviderProps {
  children: ReactNode;
}

export const StorageProvider: React.FC<StorageProviderProps> = ({ children }) => {
  const [storages, setStorages] = useState<Storage[]>([]);
  const [currentStorage, setCurrentStorage] = useState<Storage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize default storage on mount
  useEffect(() => {
    const initializeStorage = async () => {
      try {
        // Load existing storages from localStorage (only on client side)
        const savedStorages = typeof window !== 'undefined' ? localStorage.getItem('raki_storages') : null;
        let allStorages: Storage[] = [];

        if (savedStorages) {
          const parsed = JSON.parse(savedStorages);
          // Recreate database instances for local storages only
          allStorages = parsed.map((storage: Omit<Storage, 'database'>) => {
            if (storage.type === 'local') {
              return {
                ...storage,
                database: new MySubClassedDexie(storage.name.toLowerCase().replace(/\s+/g, '_'))
              };
            }
            return storage; // Cloud storages don't need database instances
          });
        } else {
          // Only create default storage if no existing storages
          const defaultStorage: Storage = {
            id: 'default',
            name: 'Local',
            type: 'local',
            database: new MySubClassedDexie(DATABASE_NAME)
          };
          allStorages = [defaultStorage];
          
          // Save to localStorage (only on client side)
          if (typeof window !== 'undefined') {
            localStorage.setItem('raki_storages', JSON.stringify(
              allStorages.map(s => ({ id: s.id, name: s.name, type: s.type, storageId: s.storageId }))
            ));
          }
        }

        // Sync cloud storages (only on client side)
        if (typeof window !== 'undefined') {
          await syncCloudStorages();
        }

        setStorages(allStorages);
        setCurrentStorage(allStorages[0]);

      } catch (error) {
        console.error('Error initializing storage:', error);
        // Fallback: create default storage
        const defaultStorage: Storage = {
          id: 'default',
          name: 'Local',
          type: 'local',
          database: new MySubClassedDexie(DATABASE_NAME)
        };
        setStorages([defaultStorage]);
        setCurrentStorage(defaultStorage);
      } finally {
        setIsLoading(false);
      }
    };

    initializeStorage();
  }, []);

  const syncCloudStorages = async () => {
    try {
      // Check if we're on client side and user is authenticated
      if (typeof window === 'undefined') {
        console.log('Server side rendering, skipping cloud storage sync');
        return;
      }
      
      const token = localStorage.getItem('auth_token');
      if (!token) {
        console.log('No auth token found, skipping cloud storage sync');
        return;
      }

      const cloudStorages = await cloudStorageManager.getStorages();
      const cloudStorageList: Storage[] = cloudStorages.map(cloudStorage => ({
        id: `cloud_${cloudStorage.id}`,
        name: cloudStorage.storageName,
        type: 'cloud' as const,
        storageId: cloudStorage.id
      }));

      setStorages(prevStorages => {
        const localStorages = prevStorages.filter(s => s.type === 'local');
        const allStorages = [...localStorages, ...cloudStorageList];
        
        // Save to localStorage (only on client side)
        if (typeof window !== 'undefined') {
          localStorage.setItem('raki_storages', JSON.stringify(
            allStorages.map(s => ({ id: s.id, name: s.name, type: s.type, storageId: s.storageId }))
          ));
        }
        
        return allStorages;
      });
    } catch (error) {
      console.error('Error syncing cloud storages:', error);
      // Don't throw error to prevent breaking the app
      // This allows the app to work with local storage only if cloud is unavailable
    }
  };

  const addStorage = async (name: string, type: 'local' | 'cloud') => {
    try {
      setIsLoading(true);
      
      let newStorage: Storage;
      
      if (type === 'local') {
        const storageId = `storage_${Date.now()}`;
        const dbName = name.toLowerCase().replace(/\s+/g, '_');
        const database = new MySubClassedDexie(dbName);
        newStorage = {
          id: storageId,
          name: name.trim(),
          type: 'local',
          database
        };
      } else {
        // Create cloud storage
        const cloudStorage = await cloudStorageManager.createStorage(name.trim());
        newStorage = {
          id: `cloud_${cloudStorage.id}`,
          name: cloudStorage.storageName,
          type: 'cloud',
          storageId: cloudStorage.id
        };
      }

      const updatedStorages = [...storages, newStorage];
      setStorages(updatedStorages);
      setCurrentStorage(newStorage);

      // Save to localStorage (only on client side)
      if (typeof window !== 'undefined') {
        localStorage.setItem('raki_storages', JSON.stringify(
          updatedStorages.map(s => ({ id: s.id, name: s.name, type: s.type, storageId: s.storageId }))
        ));
      }

    } catch (error) {
      console.error('Error adding storage:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const switchStorage = (storageId: string) => {
    const storage = storages.find(s => s.id === storageId);
    if (storage) {
      setCurrentStorage(storage);
    }
  };

  const removeStorage = async (storageId: string) => {
    if (storageId === 'default') {
      // Don't allow removing default storage
      return;
    }

    const storage = storages.find(s => s.id === storageId);
    if (!storage) return;

    try {
      if (storage.type === 'cloud' && storage.storageId) {
        // Delete cloud storage
        await cloudStorageManager.deleteStorage(storage.storageId);
      }
      // For local storage, just remove from the list (database will remain)

      const updatedStorages = storages.filter(s => s.id !== storageId);
      setStorages(updatedStorages);

      // If we're removing the current storage, switch to default
      if (currentStorage?.id === storageId) {
        const defaultStorage = updatedStorages.find(s => s.id === 'default');
        setCurrentStorage(defaultStorage || updatedStorages[0]);
      }

      // Save to localStorage (only on client side)
      if (typeof window !== 'undefined') {
        localStorage.setItem('raki_storages', JSON.stringify(
          updatedStorages.map(s => ({ id: s.id, name: s.name, type: s.type, storageId: s.storageId }))
        ));
      }
    } catch (error) {
      console.error('Error removing storage:', error);
      throw error;
    }
  };

  const migrateLocalToCloud = async (storageId: string, cloudStorageName: string) => {
    try {
      setIsLoading(true);
      
      const storage = storages.find(s => s.id === storageId);
      if (!storage || storage.type !== 'local' || !storage.database) {
        throw new Error('Storage not found or not a local storage');
      }

      // Export all data from local storage
      const localData = {
        profiles: await storage.database.Profiles.toArray(),
        datasets: await storage.database.Datasets.toArray(),
        texts: await storage.database.Texts.toArray(),
        annotatedDatasets: await storage.database.AnnotatedDatasets.toArray(),
        annotatedTexts: await storage.database.AnnotatedTexts.toArray(),
        dataPoints: await storage.database.DataPoints.toArray(),
        segmentDataPoints: await storage.database.SegmentDataPoints.toArray(),
        profilePoints: await storage.database.profilePoints.toArray(),
        segmentationProfilePoints: await storage.database.segmentationProfilePoints.toArray(),
        apiKeys: await storage.database.ApiKeys.toArray(),
        models: await storage.database.models.toArray(),
        llmProviders: await storage.database.llmProviders.toArray(),
        llmUrls: await storage.database.llmUrls.toArray(),
        batchSizes: await storage.database.batchSizes.toArray(),
        maxTokens: await storage.database.maxTokens.toArray(),
        userSettings: await storage.database.userSettings.toArray(),
      };

      // Convert to cloud format
      const cloudData = cloudStorageManager.convertLocalToCloud(localData);

      // Create cloud storage with migrated data
      const cloudStorage = await cloudStorageManager.migrateLocalToCloud(cloudStorageName, cloudData);
      
      // Add cloud storage to the list
      const newCloudStorage: Storage = {
        id: `cloud_${cloudStorage.id}`,
        name: cloudStorage.storageName,
        type: 'cloud',
        storageId: cloudStorage.id
      };

      const updatedStorages = [...storages, newCloudStorage];
      setStorages(updatedStorages);
      setCurrentStorage(newCloudStorage);

      // Save to localStorage (only on client side)
      if (typeof window !== 'undefined') {
        localStorage.setItem('raki_storages', JSON.stringify(
          updatedStorages.map(s => ({ id: s.id, name: s.name, type: s.type, storageId: s.storageId }))
        ));
      }

    } catch (error) {
      console.error('Error migrating storage:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: StorageContextType = {
    storages,
    currentStorage,
    addStorage,
    switchStorage,
    removeStorage,
    syncCloudStorages,
    migrateLocalToCloud,
    isLoading,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};
