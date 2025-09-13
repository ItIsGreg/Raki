import { useEffect, useMemo } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { setCurrentDatabase, createCloudAdapter } from '@/lib/db/databaseManager';

export const useCurrentDatabase = () => {
  const { currentStorage, isLoading } = useStorage();

  // Memoize the cloud adapter to prevent creating new instances on every render
  const cloudAdapter = useMemo(() => {
    if (currentStorage?.type === 'cloud' && currentStorage.storageId) {
      return createCloudAdapter(currentStorage.storageId);
    }
    return null;
  }, [currentStorage?.type, currentStorage?.storageId]);

  useEffect(() => {
    if (!isLoading && currentStorage) {
      if (currentStorage.type === 'local' && currentStorage.database) {
        setCurrentDatabase(currentStorage.database);
      } else if (currentStorage.type === 'cloud' && cloudAdapter) {
        setCurrentDatabase(cloudAdapter);
      }
    }
  }, [currentStorage, isLoading, cloudAdapter]);

  if (currentStorage?.type === 'local') {
    return currentStorage.database;
  } else if (currentStorage?.type === 'cloud' && cloudAdapter) {
    return cloudAdapter;
  }
  
  return null;
};
