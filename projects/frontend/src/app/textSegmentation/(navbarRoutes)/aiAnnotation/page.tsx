"use client";

import { useState } from "react";
import AnnotatedDatasetList from "@/components/aiAnnotation/AnnotatedDatasetList";
import AnnotatedTextsList from "@/components/aiAnnotation/AnnotatedTextsList";
import { AnnotatedDataset, SegmentationProfilePoint } from "@/lib/db/db";
import { useAnnotationState } from "@/components/aiAnnotation/hooks/useAnnotationState";

const AIAnnotation = () => {
  const [activeAnnotatedDataset, setActiveAnnotatedDataset] =
    useState<AnnotatedDataset | null>(null);
  const [activeProfilePoints, setActiveProfilePoints] = useState<
    SegmentationProfilePoint[]
  >([]);
  const [addingDataset, setAddingDataset] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const {
    annotationState,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
  } = useAnnotationState<SegmentationProfilePoint>({
    activeAnnotatedDataset,
    setActiveAnnotatedDataset,
    activeProfilePoints,
    setActiveProfilePoints,
    autoRerunFaulty: true,
    mode: "text_segmentation",
  });

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
        isOpen={isOpen}
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
