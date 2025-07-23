"use client";

import React from "react";
import { UserMenu } from "@/components/auth/UserMenu";
import { StorageStatus } from "@/components/auth/StorageStatus";
import { WorkspaceSelector } from "@/components/workspace/WorkspaceSelector";

export function AppHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Raki</h1>
            <WorkspaceSelector />
            <StorageStatus />
          </div>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
