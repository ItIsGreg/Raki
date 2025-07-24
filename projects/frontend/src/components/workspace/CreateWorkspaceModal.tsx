"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Cloud, HardDrive } from "lucide-react";
import {
  useWorkspace,
  type WorkspaceCreate,
} from "@/contexts/WorkspaceContext";
import { useAuth } from "@/contexts/AuthContext";

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateWorkspaceModal({
  open,
  onOpenChange,
}: CreateWorkspaceModalProps) {
  const { createWorkspace, switchWorkspace } = useWorkspace();
  const { isAuthenticated } = useAuth();

  const [formData, setFormData] = useState<WorkspaceCreate>({
    name: "",
    description: "",
    storage_type: "local",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Workspace name is required");
      return;
    }

    if (formData.storage_type === "cloud" && !isAuthenticated) {
      setError("You must be signed in to create cloud workspaces");
      return;
    }

    setIsLoading(true);

    try {
      const newWorkspace = await createWorkspace({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        storage_type: formData.storage_type,
      });

      // Switch to the newly created workspace
      await switchWorkspace(newWorkspace.id, newWorkspace);

      // Reset form and close modal
      setFormData({
        name: "",
        description: "",
        storage_type: "local",
      });
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create workspace"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      description: "",
      storage_type: "local",
    });
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a workspace to organize your profiles, datasets, and
            annotations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-name">Workspace Name *</Label>
            <Input
              id="workspace-name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="My Project Workspace"
              data-cy="workspace-name-input"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-description">Description</Label>
            <Textarea
              id="workspace-description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Optional description for your workspace"
              rows={3}
              data-cy="workspace-description-input"
            />
          </div>

          <div className="space-y-2">
            <Label>Storage Type *</Label>
            <Select
              value={formData.storage_type}
              onValueChange={(value: "local" | "cloud") =>
                setFormData((prev) => ({ ...prev, storage_type: value }))
              }
            >
              <SelectTrigger data-cy="storage-type-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">
                  <div className="flex items-center gap-2">
                    <HardDrive className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium">Local Storage</div>
                      <div className="text-xs text-gray-600">
                        Stored on your device only
                      </div>
                    </div>
                  </div>
                </SelectItem>
                <SelectItem value="cloud" disabled={!isAuthenticated}>
                  <div className="flex items-center gap-2">
                    <Cloud
                      className={`h-4 w-4 ${
                        isAuthenticated ? "text-blue-500" : "text-gray-400"
                      }`}
                    />
                    <div>
                      <div
                        className={`font-medium ${
                          !isAuthenticated ? "text-gray-400" : ""
                        }`}
                      >
                        Cloud Storage
                        {!isAuthenticated && (
                          <span className="text-xs ml-1">
                            (Sign in required)
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs ${
                          isAuthenticated ? "text-gray-600" : "text-gray-400"
                        }`}
                      >
                        Accessible from any device
                      </div>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1"
              data-cy="create-workspace-submit"
            >
              {isLoading ? "Creating..." : "Create Workspace"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
