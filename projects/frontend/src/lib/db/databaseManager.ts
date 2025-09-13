import { MySubClassedDexie } from './db';
import { DATABASE_NAME } from '@/app/constants';

// Global database manager
class DatabaseManager {
  private static instance: DatabaseManager;
  private currentDatabase: MySubClassedDexie | null = null;

  private constructor() {
    // Don't initialize database here - it will be set by StorageContext
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public getCurrentDatabase(): MySubClassedDexie {
    if (!this.currentDatabase) {
      // Fallback: create default database if none is set
      this.currentDatabase = new MySubClassedDexie(DATABASE_NAME);
    }
    return this.currentDatabase;
  }

  public setCurrentDatabase(database: MySubClassedDexie): void {
    this.currentDatabase = database;
  }

  public createDatabase(name: string): MySubClassedDexie {
    return new MySubClassedDexie(name);
  }
}

// Export singleton instance
export const databaseManager = DatabaseManager.getInstance();

// Export convenience function to get current database
export const getCurrentDatabase = (): MySubClassedDexie => {
  return databaseManager.getCurrentDatabase();
};

// Export function to set current database
export const setCurrentDatabase = (database: MySubClassedDexie): void => {
  databaseManager.setCurrentDatabase(database);
};

// Export function to create new database
export const createDatabase = (name: string): MySubClassedDexie => {
  return databaseManager.createDatabase(name);
};
