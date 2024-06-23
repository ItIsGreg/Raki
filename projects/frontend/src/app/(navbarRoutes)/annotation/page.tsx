"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import TextAnnotation from "./TextAnnotation";
import DataPointList from "./DataPointList";
import DatasetList from "./DatasetList";
import { AnnotatedDataset, AnnotatedText, DataPoint } from "@/lib/db/db";
import AnnotatedTextList from "./AnnotatedTextList";

// create a representation of the text and the data points
// where the data points are highlighted

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

  return (
    <div className="grid grid-cols-7 gap-4 h-full">
      <TextAnnotation
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeDataPointId={activeDataPointId}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveDataPointId={setActiveDataPointId}
        activeAnnotatedText={activeAnnotatedText}
      />
      <DataPointList
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeDataPointId={activeDataPointId}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveDataPointId={setActiveDataPointId}
        activeAnnotatedText={activeAnnotatedText}
        setActiveAnnotatedText={setActiveAnnotatedText}
      />
      <AnnotatedTextList
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeAnnotatedText={activeAnnotatedText}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveAnnotatedText={setActiveAnnotatedText}
      />
      <DatasetList
        activeAnnotatedDataset={activeAnnotatedDataset}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
      />
    </div>
  );
};

export default Annotation;
