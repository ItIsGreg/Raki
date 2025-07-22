"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Database } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import { AppHeader } from "@/components/layout/AppHeader";

export default function Home() {
  const { setIsSettingsOpen } = useSettings();

  return (
    <>
      <AppHeader />
      <div className="flex justify-center items-center min-h-screen w-full">
        <div className="flex flex-col w-full max-w-md">
          <Link href="/dataPointExtraction" className="m-10">
            <Card
              className="hover:bg-gray-100 transform hover:shadow-md"
              data-cy="datapoint-extraction-card"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-center">
                  Datapoint Extraction
                </CardTitle>
                <Database className="h-8 w-8" />
              </CardHeader>
            </Card>
          </Link>

          <Link href="/textSegmentation" className="m-10">
            <Card
              className="hover:bg-gray-100 transform hover:shadow-md"
              data-cy="text-segmentation-card"
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-center">Text Segmentation</CardTitle>
                <Scissors className="h-8 w-8" />
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </>
  );
}
