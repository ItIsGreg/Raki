"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MySubClassedDexie } from '@/lib/db/db';
import { DATABASE_NAME } from '@/app/constants';

export interface Storage {
  id: string;
  name: string;
  type: 'local' | 'cloud';
  database?: MySubClassedDexie;
}

export interface StorageContextType {
  storages: Storage[];
  currentStorage: Storage | null;
  addStorage: (name: string, type: 'local' | 'cloud') => Promise<void>;
  switchStorage: (storageId: string) => void;
  removeStorage: (storageId: string) => void;
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
        // Load existing storages from localStorage
        const savedStorages = localStorage.getItem('raki_storages');
        let allStorages: Storage[] = [];

        if (savedStorages) {
          const parsed = JSON.parse(savedStorages);
          // Recreate database instances for each storage
          allStorages = parsed.map((storage: Omit<Storage, 'database'>) => ({
            ...storage,
            database: new MySubClassedDexie(storage.name.toLowerCase().replace(/\s+/g, '_'))
          }));
        } else {
          // Only create default storage if no existing storages
          const defaultStorage: Storage = {
            id: 'default',
            name: 'Local',
            type: 'local',
            database: new MySubClassedDexie(DATABASE_NAME)
          };
          allStorages = [defaultStorage];
          
          // Save to localStorage
          localStorage.setItem('raki_storages', JSON.stringify(
            allStorages.map(s => ({ id: s.id, name: s.name, type: s.type }))
          ));
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

  const addStorage = async (name: string, type: 'local' | 'cloud') => {
    try {
      setIsLoading(true);
      
      const storageId = `storage_${Date.now()}`;
      const dbName = name.toLowerCase().replace(/\s+/g, '_');
      
      let newStorage: Storage;
      
      if (type === 'local') {
        // Create new local database instance
        const database = new MySubClassedDexie(dbName);
        newStorage = {
          id: storageId,
          name: name.trim(),
          type: 'local',
          database
        };
      } else {
        // For cloud storage, we'll handle this differently
        // For now, create a local database that will sync with cloud
        const database = new MySubClassedDexie(dbName);
        newStorage = {
          id: storageId,
          name: name.trim(),
          type: 'cloud',
          database
        };
      }

      const updatedStorages = [...storages, newStorage];
      setStorages(updatedStorages);
      setCurrentStorage(newStorage);

      // Save to localStorage
      localStorage.setItem('raki_storages', JSON.stringify(
        updatedStorages.map(s => ({ id: s.id, name: s.name, type: s.type }))
      ));

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

  const removeStorage = (storageId: string) => {
    if (storageId === 'default') {
      // Don't allow removing default storage
      return;
    }

    const updatedStorages = storages.filter(s => s.id !== storageId);
    setStorages(updatedStorages);

    // If we're removing the current storage, switch to default
    if (currentStorage?.id === storageId) {
      const defaultStorage = updatedStorages.find(s => s.id === 'default');
      setCurrentStorage(defaultStorage || updatedStorages[0]);
    }

    // Save to localStorage
    localStorage.setItem('raki_storages', JSON.stringify(
      updatedStorages.map(s => ({ id: s.id, name: s.name, type: s.type }))
    ));
  };

  const value: StorageContextType = {
    storages,
    currentStorage,
    addStorage,
    switchStorage,
    removeStorage,
    isLoading,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
};
