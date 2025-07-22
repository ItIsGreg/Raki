"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Cloud, Upload, Check, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { HybridDataService } from "@/lib/api/hybridDataService";
// Using simple div instead of Alert component

interface MoveToCloudButtonProps {
  onSuccess?: () => void;
}

export function MoveToCloudButton({ onSuccess }: MoveToCloudButtonProps) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "migrating" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string>("");

  const handleMigration = async () => {
    if (!isAuthenticated) {
      setError("You must be signed in to move data to the cloud");
      setStatus("error");
      return;
    }

    setIsLoading(true);
    setStatus("migrating");
    setProgress(0);
    setError("");

    try {
      // Simulate progress updates
      setProgress(20);
      setStatus("migrating");

      // Start migration
      await HybridDataService.migrateLocalDataToCloud();

      setProgress(100);
      setStatus("success");

      setTimeout(() => {
        onSuccess?.();
      }, 1000);
    } catch (err) {
      console.error("Migration failed:", err);
      setError(err instanceof Error ? err.message : "Migration failed");
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
        <AlertCircle className="h-4 w-4" />
        <div>
          Sign in to move your data to the cloud for access across devices.
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex items-center gap-2 p-4 border border-green-200 rounded-lg bg-green-50">
        <Check className="h-4 w-4 text-green-600" />
        <div className="text-green-800">
          Your data has been successfully moved to the cloud! You can now access
          it from any device.
        </div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="h-5 w-5" />
          Move to Cloud
        </CardTitle>
        <CardDescription>
          Migrate your local data to the cloud for access across all your
          devices.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status === "migrating" && (
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Migrating your data... {Math.round(progress)}%
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {status === "error" && error && (
          <div className="flex items-center gap-2 p-4 border border-red-200 rounded-lg bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <div className="text-red-800">{error}</div>
          </div>
        )}

        <Button
          onClick={handleMigration}
          disabled={isLoading || status === "migrating"}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Upload className="h-4 w-4 mr-2 animate-spin" />
              Moving to Cloud...
            </>
          ) : (
            <>
              <Cloud className="h-4 w-4 mr-2" />
              Move to Cloud
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500">
          Your local data will remain available as a backup.
        </div>
      </CardContent>
    </Card>
  );
}
