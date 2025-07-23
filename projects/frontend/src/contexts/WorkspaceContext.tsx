"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

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
  switchWorkspace: (workspaceId: string) => Promise<void>;
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

  static deleteLocalWorkspace(workspaceId: string): boolean {
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

    return true;
  }
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(
    null
  );
  const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load workspaces when auth state changes
  useEffect(() => {
    loadWorkspaces();
  }, [isAuthenticated]);

  const loadWorkspaces = async () => {
    setIsLoading(true);
    try {
      let workspaces: Workspace[] = [];

      if (isAuthenticated) {
        // Load cloud workspaces
        workspaces = await WorkspaceService.getWorkspaces();
      } else {
        // Load local workspaces
        workspaces = LocalWorkspaceManager.getLocalWorkspaces();
      }

      setAllWorkspaces(workspaces);

      // Set active workspace
      const activeId = LocalWorkspaceManager.getActiveWorkspaceId();
      const active =
        workspaces.find((w) => w.id === activeId) || workspaces[0] || null;
      setActiveWorkspace(active);

      if (active && active.id !== activeId) {
        LocalWorkspaceManager.setActiveWorkspace(active.id);
      }
    } catch (error) {
      console.error("Failed to load workspaces:", error);
      // Fallback to local workspaces
      const localWorkspaces = LocalWorkspaceManager.getLocalWorkspaces();
      setAllWorkspaces(localWorkspaces);
      setActiveWorkspace(localWorkspaces[0] || null);
    } finally {
      setIsLoading(false);
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    const workspace = allWorkspaces.find((w) => w.id === workspaceId);
    if (workspace) {
      setActiveWorkspace(workspace);
      LocalWorkspaceManager.setActiveWorkspace(workspaceId);
    }
  };

  const createWorkspace = async (
    workspace: WorkspaceCreate
  ): Promise<Workspace> => {
    let newWorkspace: Workspace;

    if (isAuthenticated && workspace.storage_type === "cloud") {
      newWorkspace = await WorkspaceService.createWorkspace(workspace);
    } else {
      newWorkspace = LocalWorkspaceManager.createLocalWorkspace(workspace);
    }

    setAllWorkspaces((prev) => [...prev, newWorkspace]);
    return newWorkspace;
  };

  const updateWorkspace = async (
    workspaceId: string,
    update: WorkspaceUpdate
  ): Promise<Workspace> => {
    const workspace = allWorkspaces.find((w) => w.id === workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    let updatedWorkspace: Workspace;

    if (workspace.storage_type === "cloud" && isAuthenticated) {
      updatedWorkspace = await WorkspaceService.updateWorkspace(
        workspaceId,
        update
      );
    } else {
      const result = LocalWorkspaceManager.updateLocalWorkspace(
        workspaceId,
        update
      );
      if (!result) throw new Error("Failed to update local workspace");
      updatedWorkspace = result;
    }

    setAllWorkspaces((prev) =>
      prev.map((w) => (w.id === workspaceId ? updatedWorkspace : w))
    );

    if (activeWorkspace?.id === workspaceId) {
      setActiveWorkspace(updatedWorkspace);
    }

    return updatedWorkspace;
  };

  const deleteWorkspace = async (workspaceId: string): Promise<void> => {
    const workspace = allWorkspaces.find((w) => w.id === workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    if (workspace.storage_type === "cloud" && isAuthenticated) {
      await WorkspaceService.deleteWorkspace(workspaceId);
    } else {
      const success = LocalWorkspaceManager.deleteLocalWorkspace(workspaceId);
      if (!success) throw new Error("Failed to delete local workspace");
    }

    setAllWorkspaces((prev) => prev.filter((w) => w.id !== workspaceId));

    if (activeWorkspace?.id === workspaceId) {
      const remaining = allWorkspaces.filter((w) => w.id !== workspaceId);
      const newActive = remaining[0] || null;
      setActiveWorkspace(newActive);
      if (newActive) {
        LocalWorkspaceManager.setActiveWorkspace(newActive.id);
      }
    }
  };

  const promoteToCloud = async (workspaceId: string): Promise<Workspace> => {
    if (!isAuthenticated) {
      throw new Error("Must be authenticated to promote workspace to cloud");
    }

    const workspace = allWorkspaces.find((w) => w.id === workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    if (workspace.storage_type === "cloud") {
      throw new Error("Workspace is already cloud-based");
    }

    // This would involve migrating local data to cloud
    // For now, just update the workspace type
    const updatedWorkspace = await updateWorkspace(workspaceId, {
      storage_type: "cloud",
    });

    return updatedWorkspace;
  };

  const refreshWorkspaces = async (): Promise<void> => {
    await loadWorkspaces();
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
