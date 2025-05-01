"use client";

import { useState } from "react";
import AnnotatedDatasetList from "@/components/aiAnnotation/AnnotatedDatasetList";
import AnnotatedTextsList from "@/components/aiAnnotation/AnnotatedTextsList";
import { AnnotatedDataset, ProfilePoint } from "@/lib/db/db";
import { useAnnotationState } from "@/components/aiAnnotation/hooks/useAnnotationState";

const LLMAnnotation = () => {
  const [activeAnnotatedDataset, setActiveAnnotatedDataset] =
    useState<AnnotatedDataset | null>(null);
  const [activeProfilePoints, setActiveProfilePoints] = useState<
    ProfilePoint[]
  >([]);
  const [addingDataset, setAddingDataset] = useState(false);
  const [isOpen, setIsOpen] = useState(true);

  const {
    annotationState,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
  } = useAnnotationState<ProfilePoint>({
    activeAnnotatedDataset,
    setActiveAnnotatedDataset,
    activeProfilePoints,
    setActiveProfilePoints,
    autoRerunFaulty: true,
    mode: "datapoint_extraction",
  });

  return (
    <div
      className="grid grid-cols-2 gap-4 h-full"
      data-cy="llm-annotation-container"
    >
      <AnnotatedDatasetList<ProfilePoint>
        data-cy="annotated-dataset-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeProfilePoints={activeProfilePoints}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveProfilePoints={setActiveProfilePoints}
        mode="datapoint_extraction"
        addingDataset={addingDataset}
        setAddingDataset={setAddingDataset}
        annotationState={annotationState}
        handleStart={handleStart}
        handleStop={handleStop}
        identifyActiveProfilePoints={identifyActiveProfilePoints}
        isOpen={isOpen}
      />
      <AnnotatedTextsList<ProfilePoint>
        data-cy="annotated-texts-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeProfilePoints={activeProfilePoints}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveProfilePoints={setActiveProfilePoints}
        mode="datapoint_extraction"
      />
    </div>
  );
};

export default LLMAnnotation;
