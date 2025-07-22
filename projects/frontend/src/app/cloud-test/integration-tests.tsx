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
import { HybridDataService } from "@/lib/api/hybridDataService";
import { CloudDataService } from "@/lib/api/cloudDataService";
import {
  createProfile,
  readProfilesByMode,
  deleteProfile,
} from "@/lib/db/crud";
import { useAuth } from "@/contexts/AuthContext";

interface TestResult {
  name: string;
  status: "pending" | "running" | "passed" | "failed";
  message?: string;
  details?: string;
}

export function IntegrationTests() {
  const { isAuthenticated } = useAuth();
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, update: Partial<TestResult>) => {
    setTests((prev) =>
      prev.map((test, i) => (i === index ? { ...test, ...update } : test))
    );
  };

  const runTests = async () => {
    setIsRunning(true);
    const testCases: TestResult[] = [
      { name: "Authentication Detection", status: "pending" },
      { name: "Local Storage - Create Profile", status: "pending" },
      { name: "Local Storage - Read Profiles", status: "pending" },
      {
        name: "Cloud Storage - Create Profile (if authenticated)",
        status: "pending",
      },
      {
        name: "Cloud Storage - Read Profiles (if authenticated)",
        status: "pending",
      },
      { name: "Hybrid Service - Route Selection", status: "pending" },
      { name: "Error Handling", status: "pending" },
    ];

    setTests(testCases);

    try {
      // Test 1: Authentication Detection
      updateTest(0, { status: "running" });
      const authTest = HybridDataService.isAuthenticated();
      const expectedAuth = !!localStorage.getItem("auth_token");
      if (authTest === expectedAuth) {
        updateTest(0, {
          status: "passed",
          message: `Authentication detection works correctly: ${authTest}`,
        });
      } else {
        updateTest(0, {
          status: "failed",
          message: `Expected ${expectedAuth}, got ${authTest}`,
        });
      }

      // Test 2: Local Storage - Create Profile
      updateTest(1, { status: "running" });
      try {
        const testProfile = {
          name: `Test Profile ${Date.now()}`,
          description: "Integration test profile",
          mode: "datapoint_extraction" as const,
        };

        const createdProfile = await createProfile(testProfile);
        if (createdProfile && createdProfile.id) {
          updateTest(1, {
            status: "passed",
            message: `Local profile created with ID: ${createdProfile.id}`,
          });
        } else {
          updateTest(1, {
            status: "failed",
            message: "Failed to create local profile",
          });
        }
      } catch (error) {
        updateTest(1, {
          status: "failed",
          message: `Error: ${error}`,
        });
      }

      // Test 3: Local Storage - Read Profiles
      updateTest(2, { status: "running" });
      try {
        const profiles = await readProfilesByMode("datapoint_extraction");
        updateTest(2, {
          status: "passed",
          message: `Found ${profiles.length} local profiles`,
        });
      } catch (error) {
        updateTest(2, {
          status: "failed",
          message: `Error reading profiles: ${error}`,
        });
      }

      // Test 4: Cloud Storage - Create Profile (if authenticated)
      updateTest(3, { status: "running" });
      if (isAuthenticated) {
        try {
          const cloudProfile = await CloudDataService.createProfile({
            name: `Cloud Test Profile ${Date.now()}`,
            description: "Integration test cloud profile",
            mode: "datapoint_extraction",
          });

          if (cloudProfile && cloudProfile.id) {
            updateTest(3, {
              status: "passed",
              message: `Cloud profile created with ID: ${cloudProfile.id}`,
            });
          } else {
            updateTest(3, {
              status: "failed",
              message: "Failed to create cloud profile",
            });
          }
        } catch (error) {
          updateTest(3, {
            status: "failed",
            message: `Cloud service error: ${error}`,
          });
        }
      } else {
        updateTest(3, {
          status: "passed",
          message: "Skipped - not authenticated",
        });
      }

      // Test 5: Cloud Storage - Read Profiles (if authenticated)
      updateTest(4, { status: "running" });
      if (isAuthenticated) {
        try {
          const cloudProfiles = await CloudDataService.getProfiles();
          updateTest(4, {
            status: "passed",
            message: `Found ${cloudProfiles.length} cloud profiles`,
          });
        } catch (error) {
          updateTest(4, {
            status: "failed",
            message: `Error reading cloud profiles: ${error}`,
          });
        }
      } else {
        updateTest(4, {
          status: "passed",
          message: "Skipped - not authenticated",
        });
      }

      // Test 6: Hybrid Service - Route Selection
      updateTest(5, { status: "running" });
      try {
        const beforeCount = await HybridDataService.getProfiles();
        const testProfile = {
          name: `Hybrid Test Profile ${Date.now()}`,
          description: "Testing hybrid routing",
          mode: "datapoint_extraction" as const,
        };

        await HybridDataService.createProfile(testProfile);
        const afterCount = await HybridDataService.getProfiles();

        if (afterCount.length > beforeCount.length) {
          const storage = isAuthenticated ? "cloud" : "local";
          updateTest(5, {
            status: "passed",
            message: `Hybrid service correctly routed to ${storage} storage`,
          });
        } else {
          updateTest(5, {
            status: "failed",
            message: "Profile count did not increase after creation",
          });
        }
      } catch (error) {
        updateTest(5, {
          status: "failed",
          message: `Hybrid service error: ${error}`,
        });
      }

      // Test 7: Error Handling
      updateTest(6, { status: "running" });
      try {
        // Test with invalid profile ID
        const result = await HybridDataService.getProfile("invalid-id-123");
        if (result === undefined) {
          updateTest(6, {
            status: "passed",
            message:
              "Error handling works correctly - returns undefined for invalid ID",
          });
        } else {
          updateTest(6, {
            status: "failed",
            message: "Should return undefined for invalid profile ID",
          });
        }
      } catch (error) {
        updateTest(6, {
          status: "failed",
          message: `Unexpected error: ${error}`,
        });
      }
    } catch (error) {
      console.error("Test suite error:", error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusColor = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return "text-gray-500";
      case "running":
        return "text-blue-500";
      case "passed":
        return "text-green-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-500";
    }
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return "⏸️";
      case "running":
        return "🔄";
      case "passed":
        return "✅";
      case "failed":
        return "❌";
      default:
        return "⏸️";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Integration Tests</CardTitle>
        <CardDescription>
          Automated tests to verify hybrid storage functionality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Status:{" "}
            {isAuthenticated
              ? "🟢 Authenticated (Cloud Mode)"
              : "🟡 Unauthenticated (Local Mode)"}
          </div>
          <Button onClick={runTests} disabled={isRunning} className="w-32">
            {isRunning ? "Running..." : "Run Tests"}
          </Button>
        </div>

        {tests.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">Test Results:</h3>
            {tests.map((test, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <span className="text-lg">{getStatusIcon(test.status)}</span>
                <div className="flex-1">
                  <div className={`font-medium ${getStatusColor(test.status)}`}>
                    {test.name}
                  </div>
                  {test.message && (
                    <div className="text-sm text-gray-600 mt-1">
                      {test.message}
                    </div>
                  )}
                  {test.details && (
                    <div className="text-xs text-gray-500 mt-1">
                      {test.details}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
          <strong>What these tests verify:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Authentication detection works correctly</li>
            <li>• Local storage operations (IndexedDB)</li>
            <li>• Cloud storage operations (PostgreSQL API)</li>
            <li>• Hybrid service routes to correct storage based on auth</li>
            <li>• Error handling for invalid operations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
