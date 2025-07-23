"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  Plus,
  Cloud,
  HardDrive,
  Settings,
  Trash2,
} from "lucide-react";
import { useWorkspace, type Workspace } from "@/contexts/WorkspaceContext";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";

export function WorkspaceSelector() {
  const {
    activeWorkspace,
    allWorkspaces,
    switchWorkspace,
    deleteWorkspace,
    isLoading,
  } = useWorkspace();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<Workspace | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteWorkspace = (
    workspace: Workspace,
    event: React.MouseEvent
  ) => {
    event.stopPropagation();
    setWorkspaceToDelete(workspace);
    // Small delay to let DropdownMenu close first
    setTimeout(() => setShowDeleteConfirm(true), 100);
  };

  const confirmDeleteWorkspace = async () => {
    if (!workspaceToDelete) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(workspaceToDelete.id);
      setShowDeleteConfirm(false);
      setWorkspaceToDelete(null);
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      // Could add toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteWorkspace = () => {
    setShowDeleteConfirm(false);
    setWorkspaceToDelete(null);
  };

  if (isLoading || !activeWorkspace) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-md">
        <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        <span className="text-sm text-gray-600">Loading workspace...</span>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2 max-w-xs"
            data-cy="workspace-selector"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {activeWorkspace.storage_type === "cloud" ? (
                <Cloud className="h-4 w-4 text-blue-500 flex-shrink-0" />
              ) : (
                <HardDrive className="h-4 w-4 text-gray-500 flex-shrink-0" />
              )}
              <span className="truncate text-sm font-medium">
                {activeWorkspace.name}
              </span>
              <Badge
                variant={
                  activeWorkspace.storage_type === "cloud"
                    ? "default"
                    : "outline"
                }
                className="text-xs flex-shrink-0"
              >
                {activeWorkspace.storage_type}
              </Badge>
            </div>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide">
            Active Workspace
          </DropdownMenuLabel>

          <div className="px-2 py-2 bg-blue-50 rounded-md mx-2 mb-2">
            <div className="flex items-center gap-2">
              {activeWorkspace.storage_type === "cloud" ? (
                <Cloud className="h-4 w-4 text-blue-500" />
              ) : (
                <HardDrive className="h-4 w-4 text-gray-500" />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {activeWorkspace.name}
                </div>
                {activeWorkspace.description && (
                  <div className="text-xs text-gray-600 truncate">
                    {activeWorkspace.description}
                  </div>
                )}
              </div>
              <Badge
                variant={
                  activeWorkspace.storage_type === "cloud"
                    ? "default"
                    : "outline"
                }
                className="text-xs"
              >
                {activeWorkspace.storage_type}
              </Badge>
            </div>
          </div>

          {allWorkspaces.length > 1 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide">
                Switch Workspace
              </DropdownMenuLabel>

              {allWorkspaces
                .filter((workspace) => workspace.id !== activeWorkspace.id)
                .map((workspace) => (
                  <DropdownMenuItem
                    key={workspace.id}
                    className="flex items-center gap-2 cursor-pointer p-0"
                    data-cy={`workspace-option-${workspace.id}`}
                  >
                    <div
                      className="flex items-center gap-2 flex-1 px-2 py-1.5 hover:bg-gray-50 rounded"
                      onClick={() => switchWorkspace(workspace.id)}
                    >
                      {workspace.storage_type === "cloud" ? (
                        <Cloud className="h-4 w-4 text-blue-500" />
                      ) : (
                        <HardDrive className="h-4 w-4 text-gray-500" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {workspace.name}
                        </div>
                        {workspace.description && (
                          <div className="text-xs text-gray-600 truncate">
                            {workspace.description}
                          </div>
                        )}
                      </div>
                      <Badge
                        variant={
                          workspace.storage_type === "cloud"
                            ? "default"
                            : "outline"
                        }
                        className="text-xs"
                      >
                        {workspace.storage_type}
                      </Badge>
                    </div>
                    {/* Only show delete button if more than 1 workspace exists */}
                    {allWorkspaces.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 mr-2 hover:text-red-500 hover:bg-red-50"
                        onClick={(e) => handleDeleteWorkspace(workspace, e)}
                        data-cy={`delete-workspace-${workspace.id}`}
                        title={`Delete ${workspace.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </DropdownMenuItem>
                ))}
            </>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => {
              // Small delay to let DropdownMenu close first
              setTimeout(() => setShowCreateModal(true), 100);
            }}
            className="flex items-center gap-2 cursor-pointer"
            data-cy="create-workspace-button"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Workspace</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2 cursor-pointer opacity-50">
            <Settings className="h-4 w-4" />
            <span>Workspace Settings</span>
            <span className="text-xs text-gray-400 ml-auto">Soon</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateWorkspaceModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{workspaceToDelete?.name}"?
              <br />
              <br />
              <strong>This action cannot be undone.</strong> This will
              permanently delete:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All profiles and their configuration points</li>
                <li>All datasets and their texts</li>
                <li>All annotations and data extractions</li>
                <li>All analysis results and segments</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={cancelDeleteWorkspace}
              data-cy="delete-workspace-cancel"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteWorkspace}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
              data-cy="delete-workspace-confirm"
            >
              {isDeleting ? "Deleting..." : "Delete Workspace"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
