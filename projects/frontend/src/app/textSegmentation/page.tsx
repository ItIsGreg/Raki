"use client";

import { BaseAnnotationPage } from "@/components/layout/BaseAnnotationPage";
import { textSegmentationConfig } from "@/configurations/textSegmentationConfig";

export default function TextSegmentationPage() {
  return <BaseAnnotationPage configuration={textSegmentationConfig} />;
}
