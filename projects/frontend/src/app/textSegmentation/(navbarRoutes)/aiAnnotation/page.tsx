"use client";

import { useState } from "react";
import AnnotatedDatasetList from "@/components/aiAnnotation/AnnotatedDatasetList";
import AnnotatedTextsList from "@/components/aiAnnotation/AnnotatedTextsList";
import { AnnotatedDataset, SegmentationProfilePoint } from "@/lib/db/db";

const AIAnnotation = () => {
  const [activeAnnotatedDataset, setActiveAnnotatedDataset] =
    useState<AnnotatedDataset | null>(null);
  const [activeProfilePoints, setActiveProfilePoints] = useState<
    SegmentationProfilePoint[]
  >([]);

  return (
    <div
      className="grid grid-cols-2 gap-4 h-full"
      data-cy="ai-annotation-container"
    >
      <AnnotatedDatasetList<SegmentationProfilePoint>
        data-cy="annotated-dataset-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeProfilePoints={activeProfilePoints}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveProfilePoints={setActiveProfilePoints}
        mode="text_segmentation"
      />
      <AnnotatedTextsList<SegmentationProfilePoint>
        data-cy="annotated-texts-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeProfilePoints={activeProfilePoints}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveProfilePoints={setActiveProfilePoints}
        mode="text_segmentation"
      />
    </div>
  );
};

export default AIAnnotation;
