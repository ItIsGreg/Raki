"use client";

import React, { useState } from 'react';
import { useStorage } from '@/contexts/StorageContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Cloud, 
  HardDrive, 
  Plus, 
  Settings, 
  Trash2, 
  Upload,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';

export const StorageSelector: React.FC = () => {
  const { 
    storages, 
    currentStorage, 
    switchStorage, 
    addStorage, 
    removeStorage, 
    migrateLocalToCloud,
    isLoading 
  } = useStorage();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMigrateDialogOpen, setIsMigrateDialogOpen] = useState(false);
  const [newStorageName, setNewStorageName] = useState('');
  const [newStorageType, setNewStorageType] = useState<'local' | 'cloud'>('local');
  const [migrateStorageId, setMigrateStorageId] = useState('');
  const [migrateStorageName, setMigrateStorageName] = useState('');

  const handleAddStorage = async () => {
    if (!newStorageName.trim()) {
      toast.error('Please enter a storage name');
      return;
    }

    try {
      await addStorage(newStorageName.trim(), newStorageType);
      setNewStorageName('');
      setNewStorageType('local');
      setIsAddDialogOpen(false);
      toast.success(`${newStorageType === 'local' ? 'Local' : 'Cloud'} storage created successfully`);
    } catch (error) {
      console.error('Error adding storage:', error);
      toast.error('Failed to create storage');
    }
  };

  const handleRemoveStorage = async (storageId: string, storageName: string) => {
    if (storageId === 'default') {
      toast.error('Cannot remove default storage');
      return;
    }

    if (!confirm(`Are you sure you want to remove "${storageName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await removeStorage(storageId);
      toast.success('Storage removed successfully');
    } catch (error) {
      console.error('Error removing storage:', error);
      toast.error('Failed to remove storage');
    }
  };

  const handleMigrateToCloud = async () => {
    if (!migrateStorageId || !migrateStorageName.trim()) {
      toast.error('Please select a storage and enter a name');
      return;
    }

    try {
      await migrateLocalToCloud(migrateStorageId, migrateStorageName.trim());
      setMigrateStorageId('');
      setMigrateStorageName('');
      setIsMigrateDialogOpen(false);
      toast.success('Storage migrated to cloud successfully');
    } catch (error) {
      console.error('Error migrating storage:', error);
      toast.error('Failed to migrate storage');
    }
  };

  const localStorages = storages.filter(s => s.type === 'local');
  const cloudStorages = storages.filter(s => s.type === 'cloud');

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {currentStorage?.type === 'local' ? (
              <HardDrive className="h-4 w-4" />
            ) : (
              <Cloud className="h-4 w-4" />
            )}
            <span className="max-w-32 truncate">
              {currentStorage?.name || 'Select Storage'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          {/* Local Storages */}
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Local Storages
          </div>
          {localStorages.map((storage) => (
            <DropdownMenuItem
              key={storage.id}
              onClick={() => switchStorage(storage.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4" />
                <span className="truncate">{storage.name}</span>
              </div>
              {storage.id !== 'default' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveStorage(storage.id, storage.name);
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </DropdownMenuItem>
          ))}

          {/* Cloud Storages */}
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
            Cloud Storages
          </div>
          {cloudStorages.map((storage) => (
            <DropdownMenuItem
              key={storage.id}
              onClick={() => switchStorage(storage.id)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span className="truncate">{storage.name}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveStorage(storage.id, storage.name);
                }}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />
          
          {/* Add Storage */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Storage
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Storage</DialogTitle>
                <DialogDescription>
                  Create a new local or cloud storage for your data.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="storage-name">Storage Name</Label>
                  <Input
                    id="storage-name"
                    value={newStorageName}
                    onChange={(e) => setNewStorageName(e.target.value)}
                    placeholder="Enter storage name"
                  />
                </div>
                <div>
                  <Label htmlFor="storage-type">Storage Type</Label>
                  <Select value={newStorageType} onValueChange={(value: 'local' | 'cloud') => setNewStorageType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">
                        <div className="flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          Local Storage
                        </div>
                      </SelectItem>
                      <SelectItem value="cloud">
                        <div className="flex items-center gap-2">
                          <Cloud className="h-4 w-4" />
                          Cloud Storage
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddStorage} disabled={isLoading}>
                  Create Storage
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Migrate to Cloud */}
          {localStorages.length > 0 && (
            <Dialog open={isMigrateDialogOpen} onOpenChange={setIsMigrateDialogOpen}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Migrate to Cloud
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Migrate Local Storage to Cloud</DialogTitle>
                  <DialogDescription>
                    Migrate your local storage data to a new cloud storage.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="migrate-storage">Select Local Storage</Label>
                    <Select value={migrateStorageId} onValueChange={setMigrateStorageId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select storage to migrate" />
                      </SelectTrigger>
                      <SelectContent>
                        {localStorages.map((storage) => (
                          <SelectItem key={storage.id} value={storage.id}>
                            <div className="flex items-center gap-2">
                              <HardDrive className="h-4 w-4" />
                              {storage.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cloud-storage-name">Cloud Storage Name</Label>
                    <Input
                      id="cloud-storage-name"
                      value={migrateStorageName}
                      onChange={(e) => setMigrateStorageName(e.target.value)}
                      placeholder="Enter cloud storage name"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsMigrateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleMigrateToCloud} disabled={isLoading}>
                    Migrate to Cloud
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
