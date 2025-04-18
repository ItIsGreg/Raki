"use client";

import { useState } from "react";
import AnnotatedDatasetList from "@/components/aiAnnotation/AnnotatedDatasetList";
import AnnotatedTextsList from "@/components/aiAnnotation/AnnotatedTextsList";
import { AnnotatedDataset, ProfilePoint } from "@/lib/db/db";

const LLMAnnotation = () => {
  const [activeAnnotatedDataset, setActiveAnnotatedDataset] =
    useState<AnnotatedDataset | null>(null);
  const [activeProfilePoints, setActiveProfilePoints] = useState<
    ProfilePoint[]
  >([]);

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
