"use client";

import { useState } from "react";
import AnnotatedDatasetList from "./AnnotatedDatasetList";
import AnnotatedTextsList from "./AnnotatedTextsList";
import { AnnotatedDataset } from "@/lib/db/db";

const LLMAnnotation = () => {
  const [activeAnnotatedDataset, setActiveAnnotatedDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);

  return (
    <div className="grid grid-cols-2 gap-4">
      <AnnotatedDatasetList
        activeAnnotatedDataset={activeAnnotatedDataset}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
      />
      <AnnotatedTextsList activeAnnotatedDataset={activeAnnotatedDataset} />
    </div>
  );
};

export default LLMAnnotation;
