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
  const [addingDataset, setAddingDataset] = useState(false);
  const [annotationState, setAnnotationState] = useState<
    "idle" | "regular" | "faulty"
  >("idle");
  const [isDatasetListOpen, setIsDatasetListOpen] = useState(true);

  const handleStart = () => setAnnotationState("regular");
  const handleStop = () => setAnnotationState("idle");
  const identifyActiveProfilePoints = (profileId: string) => {
    // Implementation needed
  };

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
        addingDataset={addingDataset}
        setAddingDataset={setAddingDataset}
        annotationState={annotationState}
        handleStart={handleStart}
        handleStop={handleStop}
        identifyActiveProfilePoints={identifyActiveProfilePoints}
        isOpen={isDatasetListOpen}
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
