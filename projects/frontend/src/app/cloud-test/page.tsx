"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { MoveToCloudButton } from "@/components/auth/MoveToCloudButton";
import { HybridDataService } from "@/lib/api/hybridDataService";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IntegrationTests } from "./integration-tests";

export default function CloudTestPage() {
  const { isAuthenticated } = useAuth();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProfiles = async () => {
    setLoading(true);
    try {
      const userProfiles = await HybridDataService.getProfiles();
      setProfiles(userProfiles);
    } catch (error) {
      console.error("Failed to load profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const createTestProfile = async () => {
    try {
      await HybridDataService.createProfile({
        name: `Test Profile ${Date.now()}`,
        description: "A test profile created from the cloud test page",
        mode: "datapoint_extraction",
      });
      await loadProfiles();
    } catch (error) {
      console.error("Failed to create profile:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadProfiles();
    }
  }, [isAuthenticated]);

  return (
    <>
      <AppHeader />
      <div className="container mx-auto p-8 space-y-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Cloud Storage Test</h1>
          <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="font-semibold mb-2">What this test shows:</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>
                • <strong>Without login:</strong> Data is stored in your browser
                (IndexedDB) - only visible on this device
              </li>
              <li>
                • <strong>With login:</strong> Data is stored in the cloud
                (PostgreSQL) - accessible from any device
              </li>
              <li>
                • <strong>Migration:</strong> Move your local data to the cloud
                when you sign up
              </li>
            </ul>
          </div>

          <div
            className={`p-4 rounded-lg mb-6 ${
              isAuthenticated
                ? "bg-green-50 border-green-200"
                : "bg-yellow-50 border-yellow-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  isAuthenticated ? "bg-green-500" : "bg-yellow-500"
                }`}
              ></div>
              <strong>Current Status:</strong>
              {isAuthenticated ? (
                <span className="text-green-700">
                  Signed in - Using cloud storage
                </span>
              ) : (
                <span className="text-yellow-700">
                  Not signed in - Using local storage
                </span>
              )}
            </div>
          </div>

          {/* Demo Steps */}
          <div className="mb-8">
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800">
                  🚀 Try This Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="text-sm space-y-2 text-purple-700">
                  <li>
                    <strong>Step 1:</strong> Create a "Local Profile" (without
                    signing in)
                  </li>
                  <li>
                    <strong>Step 2:</strong> Sign in using the header
                  </li>
                  <li>
                    <strong>Step 3:</strong> Notice how the storage type changes
                    to "Cloud"
                  </li>
                  <li>
                    <strong>Step 4:</strong> Create a "Cloud Profile" (data goes
                    to PostgreSQL)
                  </li>
                  <li>
                    <strong>Step 5:</strong> Use "Move to Cloud" to migrate your
                    local profile
                  </li>
                  <li>
                    <strong>Step 6:</strong> Your data is now accessible from
                    any device!
                  </li>
                </ol>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Migration Section */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Data Migration</h2>
              <MoveToCloudButton onSuccess={() => loadProfiles()} />
            </div>

            {/* Test Operations */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Test Operations</CardTitle>
                  <CardDescription>
                    {isAuthenticated
                      ? "Create profiles in the cloud (PostgreSQL)"
                      : "Create profiles locally (IndexedDB)"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={createTestProfile} className="w-full">
                    {isAuthenticated
                      ? "Create Cloud Profile"
                      : "Create Local Profile"}
                  </Button>
                  <Button
                    onClick={loadProfiles}
                    variant="outline"
                    className="w-full"
                  >
                    Reload Profiles
                  </Button>
                  <div className="text-xs text-gray-500 mt-2">
                    {isAuthenticated
                      ? "✅ Data will be saved to PostgreSQL and accessible from any device"
                      : "⚠️ Data will be saved to your browser and only visible on this device"}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Integration Tests */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Automated Tests</h2>
            <IntegrationTests />
          </div>

          {/* Profiles List */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4">
              Your Profiles {isAuthenticated ? "(Cloud)" : "(Local)"}
            </h2>

            {loading ? (
              <p>Loading profiles...</p>
            ) : profiles.length === 0 ? (
              <p className="text-gray-500">
                No profiles found. Create one to test the system!
              </p>
            ) : (
              <div className="grid gap-4">
                {profiles.map((profile) => (
                  <Card key={profile.id} data-cy="profile-card">
                    <CardHeader>
                      <CardTitle className="text-lg">{profile.name}</CardTitle>
                      <CardDescription>{profile.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-500">
                        Mode: {profile.mode} | ID: {profile.id}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
