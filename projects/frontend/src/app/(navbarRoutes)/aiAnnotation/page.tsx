"use client";

import { useState } from "react";
import AnnotatedDatasetList from "./AnnotatedDatasetList";
import AnnotatedTextsList from "./AnnotatedTextsList";
import { AnnotatedDataset, ProfilePoint } from "@/lib/db/db";

const LLMAnnotation = () => {
  const [activeAnnotatedDataset, setActiveAnnotatedDataset] =
    useState<AnnotatedDataset | null>(null);
  const [activeProfilePoints, setActiveProfilePoints] = useState<
    ProfilePoint[]
  >([]);

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <AnnotatedDatasetList
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeProfilePoints={activeProfilePoints}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveProfilePoints={setActiveProfilePoints}
      />
      <AnnotatedTextsList
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeProfilePoints={activeProfilePoints}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveProfilePoints={setActiveProfilePoints}
      />
    </div>
  );
};

export default LLMAnnotation;
