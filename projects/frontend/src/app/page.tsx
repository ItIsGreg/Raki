"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Database, Rocket, ScanText, Settings } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";

export default function Home() {
  const { setIsSettingsOpen } = useSettings();

  return (
    <div className="flex justify-center w-full">
      <div className="flex flex-col w-full max-w-md">
        <Link href="/profiles" className="m-10">
          <Card
            className="hover:bg-gray-100 transform hover:shadow-md"
            data-cy="profile-card"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-center">Profile</CardTitle>
              <Rocket className="h-8 w-8" />
            </CardHeader>
          </Card>
        </Link>

        <Link href="/datasets" className="m-10">
          <Card
            className="hover:bg-gray-100 transform hover:shadow-md"
            data-cy="datasets-card"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-center">Datasets</CardTitle>
              <Database className="h-8 w-8" />
            </CardHeader>
          </Card>
        </Link>

        <Link href="/aiAnnotation" className="m-10">
          <Card
            className="hover:bg-gray-100 transform hover:shadow-md"
            data-cy="ai-annotation-card"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-center">AI-Annotation</CardTitle>
              <Brain className="h-8 w-8" />
            </CardHeader>
          </Card>
        </Link>

        <Link href="/annotation" className="m-10">
          <Card
            className="hover:bg-gray-100 transform hover:shadow-md"
            data-cy="manual-annotation-card"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-center">Manual Annotation</CardTitle>
              <ScanText className="h-8 w-8" />
            </CardHeader>
          </Card>
        </Link>

        <div className="m-10">
          <Card
            className="hover:bg-gray-100 transform hover:shadow-md"
            onClick={() => setIsSettingsOpen(true)}
            data-cy="setup-card"
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-center">Setup</CardTitle>
              <Settings className="h-8 w-8" />
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
