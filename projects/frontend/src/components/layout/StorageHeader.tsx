"use client";

import React from 'react';
import { StorageSelector } from '@/components/storage/StorageSelector';
import { useStorage } from '@/contexts/StorageContext';
import { Badge } from '@/components/ui/badge';
import { Cloud, HardDrive } from 'lucide-react';

export const StorageHeader: React.FC = () => {
  const { currentStorage } = useStorage();

  return (
    <div className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold">Raki</h1>
        <StorageSelector />
        {currentStorage && (
          <Badge variant={currentStorage.type === 'cloud' ? 'default' : 'secondary'}>
            {currentStorage.type === 'cloud' ? (
              <>
                <Cloud className="h-3 w-3 mr-1" />
                Cloud
              </>
            ) : (
              <>
                <HardDrive className="h-3 w-3 mr-1" />
                Local
              </>
            )}
          </Badge>
        )}
      </div>
    </div>
  );
};
