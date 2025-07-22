"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Cloud, HardDrive } from "lucide-react";

export function StorageStatus() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Cloud className="h-3 w-3" />
        Cloud Storage
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="flex items-center gap-1">
      <HardDrive className="h-3 w-3" />
      Local Storage
    </Badge>
  );
}
