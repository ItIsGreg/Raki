"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Badge } from "@/components/ui/badge";
import { Cloud, HardDrive } from "lucide-react";

export function StorageStatus() {
  const { isAuthenticated } = useAuth();
  const { activeWorkspace } = useWorkspace();

  if (!activeWorkspace) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-1"
        data-cy="storage-status"
      >
        <HardDrive className="h-3 w-3" />
        Loading...
      </Badge>
    );
  }

  if (activeWorkspace.storage_type === "cloud") {
    return (
      <Badge
        variant="secondary"
        className="flex items-center gap-1"
        data-cy="storage-status"
      >
        <Cloud className="h-3 w-3" />
        Cloud Storage
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="flex items-center gap-1"
      data-cy="storage-status"
    >
      <HardDrive className="h-3 w-3" />
      Local Storage
    </Badge>
  );
}
