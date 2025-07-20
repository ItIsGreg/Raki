"use client";

import { BaseAnnotationPage } from "@/components/annotation/BaseAnnotationPage";
import { textSegmentationConfig } from "@/configurations/textSegmentationConfig";

export default function TextSegmentationPage() {
  return <BaseAnnotationPage configuration={textSegmentationConfig} />;
}
