"use client";

import { Brain, Database, Rocket, ScanText, Settings } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import RouteCardGrid, { Route } from "@/components/RouteCardGrid";

export default function Home() {
  const { setIsSettingsOpen } = useSettings();

  // Define routes configuration
  const routes: Route[] = [
    {
      path: "/dataPointExtraction/datasets",
      label: "Datasets",
      icon: Database,
    },
    // {
    //   path: "/dataPointExtraction/aiAnnotation",
    //   label: "AI-Annotation",
    //   icon: Brain,
    // },
    {
      path: "/dataPointExtraction/annotation",
      label: "Annotation",
      icon: ScanText,
    },
    {
      path: "#",
      label: "Setup",
      icon: Settings,
      onClick: () => setIsSettingsOpen(true),
    },
  ];

  return <RouteCardGrid routes={routes} />;
}
