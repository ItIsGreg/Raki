"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { v4 as uuidv4 } from "uuid";
import { deleteWorkspaceData } from "@/lib/db/crud";

// Workspace types
export interface Workspace {
  id: string;
  name: string;
  description?: string;
  storage_type: "local" | "cloud";
  is_default: boolean;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceCreate {
  name: string;
  description?: string;
  storage_type: "local" | "cloud";
  is_default?: boolean;
}

export interface WorkspaceUpdate {
  name?: string;
  description?: string;
  storage_type?: "local" | "cloud";
  is_default?: boolean;
}

// Context interface
interface WorkspaceContextType {
  // State
  activeWorkspace: Workspace | null;
  allWorkspaces: Workspace[];
  isLoading: boolean;

  // Actions
  switchWorkspace: (
    workspaceId: string,
    workspaceToSwitch?: Workspace
  ) => Promise<void>;
  createWorkspace: (workspace: WorkspaceCreate) => Promise<Workspace>;
  updateWorkspace: (
    workspaceId: string,
    update: WorkspaceUpdate
  ) => Promise<Workspace>;
  deleteWorkspace: (workspaceId: string) => Promise<void>;
  promoteToCloud: (workspaceId: string) => Promise<Workspace>;
  refreshWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}

// Workspace API service
class WorkspaceService {
  private static apiBase = "http://localhost:8000";

  private static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const token = localStorage.getItem("auth_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async getWorkspaces(): Promise<Workspace[]> {
    return this.fetchWithAuth(`${this.apiBase}/data/workspaces`);
  }

  static async createWorkspace(workspace: WorkspaceCreate): Promise<Workspace> {
    return this.fetchWithAuth(`${this.apiBase}/data/workspaces`, {
      method: "POST",
      body: JSON.stringify(workspace),
    });
  }

  static async updateWorkspace(
    workspaceId: string,
    update: WorkspaceUpdate
  ): Promise<Workspace> {
    return this.fetchWithAuth(
      `${this.apiBase}/data/workspaces/${workspaceId}`,
      {
        method: "PUT",
        body: JSON.stringify(update),
      }
    );
  }

  static async deleteWorkspace(workspaceId: string): Promise<void> {
    await this.fetchWithAuth(`${this.apiBase}/data/workspaces/${workspaceId}`, {
      method: "DELETE",
    });
  }

  static async promoteToCloud(workspaceId: string): Promise<Workspace> {
    return this.fetchWithAuth(
      `${this.apiBase}/data/workspaces/${workspaceId}/promote`,
      {
        method: "POST",
      }
    );
  }
}

// Local workspace management
class LocalWorkspaceManager {
  private static STORAGE_KEY = "local_workspaces";
  private static ACTIVE_WORKSPACE_KEY = "active_workspace_id";

  static getLocalWorkspaces(): Workspace[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) {
      // Create default local workspace
      const defaultWorkspace = this.createDefaultWorkspace();
      this.saveLocalWorkspaces([defaultWorkspace]);
      this.setActiveWorkspace(defaultWorkspace.id);
      return [defaultWorkspace];
    }
    return JSON.parse(stored);
  }

  static saveLocalWorkspaces(workspaces: Workspace[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(workspaces));
  }

  static createDefaultWorkspace(): Workspace {
    return {
      id: `local-${Date.now()}`,
      name: "My Local Workspace",
      description: "Default local workspace",
      storage_type: "local",
      is_default: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  static getActiveWorkspaceId(): string | null {
    return localStorage.getItem(this.ACTIVE_WORKSPACE_KEY);
  }

  static setActiveWorkspace(workspaceId: string): void {
    localStorage.setItem(this.ACTIVE_WORKSPACE_KEY, workspaceId);
  }

  static createLocalWorkspace(workspace: WorkspaceCreate): Workspace {
    const newWorkspace: Workspace = {
      id: `local-${Date.now()}`,
      ...workspace,
      storage_type: "local", // Force local for local workspaces
      is_default: workspace.is_default ?? false, // Provide default value
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const workspaces = this.getLocalWorkspaces();
    workspaces.push(newWorkspace);
    this.saveLocalWorkspaces(workspaces);

    return newWorkspace;
  }

  static updateLocalWorkspace(
    workspaceId: string,
    update: WorkspaceUpdate
  ): Workspace | null {
    const workspaces = this.getLocalWorkspaces();
    const index = workspaces.findIndex((w) => w.id === workspaceId);

    if (index === -1) return null;

    const updatedWorkspace = {
      ...workspaces[index],
      ...update,
      storage_type: "local" as const, // Keep local workspaces local
      updated_at: new Date().toISOString(),
    };

    workspaces[index] = updatedWorkspace;
    this.saveLocalWorkspaces(workspaces);

    return updatedWorkspace;
  }

  static async deleteLocalWorkspace(workspaceId: string): Promise<boolean> {
    const workspaces = this.getLocalWorkspaces();
    const filteredWorkspaces = workspaces.filter((w) => w.id !== workspaceId);

    if (filteredWorkspaces.length === workspaces.length) return false;

    this.saveLocalWorkspaces(filteredWorkspaces);

    // If deleted workspace was active, switch to first remaining workspace
    if (
      this.getActiveWorkspaceId() === workspaceId &&
      filteredWorkspaces.length > 0
    ) {
      this.setActiveWorkspace(filteredWorkspaces[0].id);
    }

    // Cascade delete workspace data
    try {
      await deleteWorkspaceData(workspaceId);
      return true;
    } catch (error) {
      console.error("Failed to delete workspace data:", error);
      return false;
    }
  }
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workspaces when auth state changes
  useEffect(() => {
    async function initializeWorkspaces() {
      // Only wait for auth loading if user is not authenticated
      // If user is authenticated, we should proceed even if auth is still "loading"
      if (isLoading && !isAuthenticated) {
        return;
      }

      try {
        setIsLoading(true);

        // Always load local workspaces first
        const localWorkspaces = LocalWorkspaceManager.getLocalWorkspaces();

        // Ensure there's a default local workspace
        let defaultLocalWorkspace = localWorkspaces.find((w) => w.is_default);
        if (!defaultLocalWorkspace) {
          defaultLocalWorkspace =
            LocalWorkspaceManager.createDefaultWorkspace();
          localWorkspaces.push(defaultLocalWorkspace);
        }

        let allWorkspaces = [...localWorkspaces];

        // If authenticated, also load cloud workspaces (but don't auto-create any)
        if (isAuthenticated && user) {
          try {
            const cloudWorkspaces = await WorkspaceService.getWorkspaces();
            allWorkspaces = [...localWorkspaces, ...cloudWorkspaces];
          } catch (error) {
            console.error("Failed to load cloud workspaces:", error);
            // Continue with just local workspaces
          }
        }

        setAllWorkspaces(allWorkspaces);

        // Determine active workspace:
        // 1. Try to keep current active workspace if it still exists
        // 2. Fall back to saved active workspace ID
        // 3. Fall back to default local workspace
        const savedActiveId = LocalWorkspaceManager.getActiveWorkspaceId();
        let newActiveWorkspace =
          allWorkspaces.find((w) => w.id === activeWorkspace?.id) ||
          allWorkspaces.find((w) => w.id === savedActiveId) ||
          defaultLocalWorkspace;

        setActiveWorkspace(newActiveWorkspace);

        // Save the active workspace ID
        if (newActiveWorkspace) {
          LocalWorkspaceManager.setActiveWorkspace(newActiveWorkspace.id);
        }
      } catch (error) {
        console.error("Error initializing workspaces:", error);
        // Fallback to local workspaces only
        const localWorkspaces = LocalWorkspaceManager.getLocalWorkspaces();
        const defaultLocal =
          localWorkspaces.find((w) => w.is_default) ||
          LocalWorkspaceManager.createDefaultWorkspace();
        setAllWorkspaces([defaultLocal]);
        setActiveWorkspace(defaultLocal);
      } finally {
        setIsLoading(false);
      }
    }

    initializeWorkspaces();
  }, [isAuthenticated, user]);

  const switchWorkspace = async (
    workspaceId: string,
    workspaceToSwitch?: Workspace
  ): Promise<void> => {
    const workspace =
      workspaceToSwitch || allWorkspaces.find((w) => w.id === workspaceId);
    if (!workspace) return;

    setActiveWorkspace(workspace);
    LocalWorkspaceManager.setActiveWorkspace(workspaceId);
  };

  const createWorkspace = async (
    workspaceData: WorkspaceCreate
  ): Promise<Workspace> => {
    let newWorkspace: Workspace;

    if (workspaceData.storage_type === "cloud" && isAuthenticated) {
      // Create cloud workspace
      newWorkspace = await WorkspaceService.createWorkspace(workspaceData);
    } else {
      // Create local workspace
      newWorkspace = LocalWorkspaceManager.createLocalWorkspace(workspaceData);
    }

    // Add to allWorkspaces
    setAllWorkspaces((prev) => [...prev, newWorkspace]);

    // Auto-switch to the new workspace
    await switchWorkspace(newWorkspace.id, newWorkspace);

    return newWorkspace;
  };

  const updateWorkspace = async (
    workspaceId: string,
    updates: WorkspaceUpdate
  ): Promise<Workspace> => {
    const workspace = allWorkspaces.find((w) => w.id === workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    let updatedWorkspace: Workspace;

    if (workspace.storage_type === "cloud" && isAuthenticated) {
      // Update cloud workspace
      updatedWorkspace = await WorkspaceService.updateWorkspace(
        workspaceId,
        updates
      );
    } else {
      // Update local workspace
      const result = LocalWorkspaceManager.updateLocalWorkspace(
        workspaceId,
        updates
      );
      if (!result) throw new Error("Failed to update local workspace");
      updatedWorkspace = result;
    }

    // Update in allWorkspaces
    setAllWorkspaces((prev) =>
      prev.map((w) => (w.id === workspaceId ? updatedWorkspace : w))
    );

    // Update active workspace if it's the one being updated
    if (activeWorkspace?.id === workspaceId) {
      setActiveWorkspace(updatedWorkspace);
    }

    return updatedWorkspace;
  };

  const deleteWorkspace = async (workspaceId: string): Promise<void> => {
    const workspace = allWorkspaces.find((w) => w.id === workspaceId);
    if (!workspace) return;

    // Can't delete the last remaining workspace
    if (allWorkspaces.length <= 1) {
      throw new Error("Cannot delete the last workspace");
    }

    if (workspace.storage_type === "cloud" && isAuthenticated) {
      // Delete cloud workspace
      await WorkspaceService.deleteWorkspace(workspaceId);
    } else {
      // Delete local workspace (and associated data)
      await LocalWorkspaceManager.deleteLocalWorkspace(workspaceId);
    }

    // Remove from allWorkspaces
    const updatedWorkspaces = allWorkspaces.filter((w) => w.id !== workspaceId);
    setAllWorkspaces(updatedWorkspaces);

    // If this was the active workspace, switch to another one
    if (activeWorkspace?.id === workspaceId) {
      const newActive = updatedWorkspaces[0];
      setActiveWorkspace(newActive);
      LocalWorkspaceManager.setActiveWorkspace(newActive.id);
    }
  };

  const promoteToCloud = async (workspaceId: string): Promise<Workspace> => {
    if (!isAuthenticated) {
      throw new Error("Must be authenticated to promote to cloud");
    }

    const workspace = allWorkspaces.find((w) => w.id === workspaceId);
    if (!workspace || workspace.storage_type !== "local") {
      throw new Error("Can only promote local workspaces");
    }

    // This would involve complex data migration - placeholder for now
    throw new Error("Workspace promotion not yet implemented");
  };

  const refreshWorkspaces = async (): Promise<void> => {
    if (isLoading) {
      return;
    }

    try {
      setIsLoading(true);

      // Always refresh local workspaces
      const localWorkspaces = LocalWorkspaceManager.getLocalWorkspaces();
      let allWorkspaces = [...localWorkspaces];

      // If authenticated, also refresh cloud workspaces
      if (isAuthenticated && user) {
        try {
          const cloudWorkspaces = await WorkspaceService.getWorkspaces();
          allWorkspaces = [...localWorkspaces, ...cloudWorkspaces];
        } catch (error) {
          console.error("Failed to refresh cloud workspaces:", error);
        }
      }

      setAllWorkspaces(allWorkspaces);

      // Update active workspace if it still exists
      const currentActive = allWorkspaces.find(
        (w) => w.id === activeWorkspace?.id
      );
      if (currentActive) {
        setActiveWorkspace(currentActive);
      } else if (allWorkspaces.length > 0) {
        setActiveWorkspace(allWorkspaces[0]);
      }
    } catch (error) {
      console.error("Error refreshing workspaces:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: WorkspaceContextType = {
    activeWorkspace,
    allWorkspaces,
    isLoading,
    switchWorkspace,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    promoteToCloud,
    refreshWorkspaces,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}
