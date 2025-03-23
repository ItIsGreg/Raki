"use client";

import { FileText, Database, Brain, Settings, ScanText } from "lucide-react";
import { useSettings } from "@/contexts/SettingsContext";
import RouteCardGrid, { Route } from "@/components/RouteCardGrid";

export default function TextSegmentationHome() {
  const { setIsSettingsOpen } = useSettings();

  // Define routes configuration for text segmentation
  const routes: Route[] = [
    {
      path: "/textSegmentation/profiles",
      label: "Profiles",
      icon: FileText,
    },
    {
      path: "/textSegmentation/datasets",
      label: "Datasets",
      icon: Database,
    },
    {
      path: "/textSegmentation/aiAnnotation",
      label: "AI-Annotation",
      icon: Brain,
    },
    {
      path: "/textSegmentation/manualAnnotation",
      label: "Manual Annotation",
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
