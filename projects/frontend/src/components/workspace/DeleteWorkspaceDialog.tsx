"use client";

import React, { useState } from "react";
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
import { useWorkspace, type Workspace } from "@/contexts/WorkspaceContext";

interface DeleteWorkspaceDialogProps {
  workspace: Workspace | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteWorkspaceDialog({
  workspace,
  open,
  onOpenChange,
}: DeleteWorkspaceDialogProps) {
  const { deleteWorkspace } = useWorkspace();
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDeleteWorkspace = async () => {
    if (!workspace) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace(workspace.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete workspace:", error);
      // Could add toast notification here
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete "{workspace?.name}"?
            <br />
            <br />
            <strong>This action cannot be undone.</strong> This will permanently
            delete:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>All profiles and their configuration points</li>
              <li>All datasets and their texts</li>
              <li>All annotations and data extractions</li>
              <li>All analysis results and segments</li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel data-cy="delete-workspace-cancel">
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
  );
}
