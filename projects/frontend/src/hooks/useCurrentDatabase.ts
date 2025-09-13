import { useEffect } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { setCurrentDatabase } from '@/lib/db/databaseManager';

export const useCurrentDatabase = () => {
  const { currentStorage, isLoading } = useStorage();

  useEffect(() => {
    if (!isLoading && currentStorage?.database) {
      setCurrentDatabase(currentStorage.database);
    }
  }, [currentStorage, isLoading]);

  return currentStorage?.database;
};
