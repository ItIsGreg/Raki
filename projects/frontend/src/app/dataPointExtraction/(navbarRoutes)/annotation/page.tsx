"use client";

import { useState } from "react";
import { AnnotatedDataset, AnnotatedText } from "@/lib/db/db";
import TextAnnotation from "@/components/annotation/TextAnnotation";
import DataPointList from "@/components/annotation/DataPointList";
import AnnotatedTextList from "@/components/annotation/AnnotatedTextList";
import DatasetList from "@/components/annotation/DatasetList";
import { TASK_MODE } from "@/app/constants";

const Annotation = () => {
  const [activeAnnotatedDataset, setActiveAnnotatedDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);
  const [activeAnnotatedText, setActiveAnnotatedText] = useState<
    AnnotatedText | undefined
  >(undefined);
  const [activeDataPointId, setActiveDataPointId] = useState<
    string | undefined
  >(undefined);

  // Since this is in the dataPointExtraction directory, we set the mode accordingly
  const mode = TASK_MODE.DATAPOINT_EXTRACTION;

  return (
    <div
      className="grid grid-cols-7 gap-4 h-full"
      data-cy="annotation-container"
    >
      <TextAnnotation
        data-cy="text-annotation"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeDataPointId={activeDataPointId}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveDataPointId={setActiveDataPointId}
        activeAnnotatedText={activeAnnotatedText}
      />
      <DataPointList
        data-cy="data-point-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeDataPointId={activeDataPointId}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveDataPointId={setActiveDataPointId}
        activeAnnotatedText={activeAnnotatedText}
        mode={mode}
      />
      <AnnotatedTextList
        data-cy="annotated-text-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeAnnotatedText={activeAnnotatedText}
        setActiveAnnotatedText={setActiveAnnotatedText}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        mode={mode}
      />
      <DatasetList
        data-cy="dataset-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        mode={mode}
      />
    </div>
  );
};

export default Annotation;
