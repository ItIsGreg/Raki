import { MySubClassedDexie } from './db';
import { DATABASE_NAME } from '@/app/constants';
import { CloudStorageAdapter } from '@/lib/storage/cloudStorageAdapter';

// Global database manager
class DatabaseManager {
  private static instance: DatabaseManager;
  private currentDatabase: MySubClassedDexie | CloudStorageAdapter | null = null;

  private constructor() {
    // Don't initialize database here - it will be set by StorageContext
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getCurrentDatabase(): MySubClassedDexie | CloudStorageAdapter {
    if (!this.currentDatabase) {
      // Fallback: create default database if none is set
      this.currentDatabase = new MySubClassedDexie(DATABASE_NAME);
    }
    return this.currentDatabase;
  }

  public setCurrentDatabase(database: MySubClassedDexie | CloudStorageAdapter): void {
    this.currentDatabase = database;
  }

  public createDatabase(name: string): MySubClassedDexie {
    return new MySubClassedDexie(name);
  }

  public createCloudAdapter(storageId: string): CloudStorageAdapter {
    return new CloudStorageAdapter(storageId);
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Export convenience function to get current database
export const getCurrentDatabase = (): MySubClassedDexie | CloudStorageAdapter => {
  return databaseManager.getCurrentDatabase();
};

// Export function to set current database
export const setCurrentDatabase = (database: MySubClassedDexie | CloudStorageAdapter): void => {
  databaseManager.setCurrentDatabase(database);
};

// Export function to create new database
export const createDatabase = (name: string): MySubClassedDexie => {
  return databaseManager.createDatabase(name);
};

// Export function to create cloud adapter
export const createCloudAdapter = (storageId: string): CloudStorageAdapter => {
  return databaseManager.createCloudAdapter(storageId);
};
