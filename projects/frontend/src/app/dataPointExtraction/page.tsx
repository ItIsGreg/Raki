"use client";

import { BaseAnnotationPage } from "@/components/annotation/BaseAnnotationPage";
import { dataPointExtractionConfig } from "@/configurations/dataPointExtractionConfig";

export default function DataPointExtractionPage() {
  return <BaseAnnotationPage configuration={dataPointExtractionConfig} />;
}
