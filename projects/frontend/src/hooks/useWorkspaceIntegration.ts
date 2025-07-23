"use client";

import { useEffect } from 'react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { HybridDataService } from '@/lib/api/hybridDataService';

/**
 * Hook that integrates WorkspaceContext with HybridDataService
 * This ensures HybridDataService always knows about the active workspace
 */
export function useWorkspaceIntegration() {
  const { activeWorkspace } = useWorkspace();

  useEffect(() => {
    if (activeWorkspace) {
      // Update HybridDataService with the active workspace info
      HybridDataService.setActiveWorkspace({
        id: activeWorkspace.id,
        storage_type: activeWorkspace.storage_type,
      });
    } else {
      // Clear workspace info if no active workspace
      HybridDataService.setActiveWorkspace(null);
    }
  }, [activeWorkspace]);

  return {
    activeWorkspace,
    isCloudWorkspace: activeWorkspace?.storage_type === 'cloud',
    isLocalWorkspace: activeWorkspace?.storage_type === 'local',
  };
} 