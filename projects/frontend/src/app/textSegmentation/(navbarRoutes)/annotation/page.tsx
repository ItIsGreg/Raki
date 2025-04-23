"use client";

import { useState } from "react";
import DataPointList from "@/components/annotation/DataPointList";
import { TextDisplay } from "@/components/annotation/SegmentationTextDisplay";
import DatasetList from "@/components/annotation/DatasetList";
import AnnotatedTextList from "@/components/annotation/AnnotatedTextList";
import { TASK_MODE } from "@/app/constants";
import { readText, updateSegmentDataPoint } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import {
  SegmentDataPoint,
  AnnotatedDataset,
  AnnotatedText,
  Text,
} from "@/lib/db/db";

export default function AnnotationPage() {
  const [activeAnnotatedDataset, setActiveAnnotatedDataset] = useState<
    AnnotatedDataset | undefined
  >();
  const [activeAnnotatedText, setActiveAnnotatedText] = useState<
    AnnotatedText | undefined
  >();
  const [activeSegmentId, setActiveSegmentId] = useState<string>();

  // Get text content from database
  const text = useLiveQuery<Text | undefined>(
    () =>
      activeAnnotatedText?.textId
        ? readText(activeAnnotatedText.textId)
        : undefined,
    [activeAnnotatedText?.textId]
  );

  const handleUpdateSegment = async (segment: SegmentDataPoint) => {
    console.log("Updating segment:", segment);
    await updateSegmentDataPoint(segment);
  };

  // Since this is in the textSegmentation directory, we set the mode accordingly
  const mode = TASK_MODE.TEXT_SEGMENTATION;

  return (
    <div
      className="grid grid-cols-7 gap-4 h-full p-4"
      data-cy="annotation-container"
    >
      <div className="col-span-4 flex flex-col h-full" data-cy="text-display">
        <div className="flex-1 h-full">
          <TextDisplay
            text={text?.text || ""}
            activeAnnotatedText={activeAnnotatedText}
            activeSegmentId={activeSegmentId}
            activeAnnotatedDataset={activeAnnotatedDataset}
            setActiveSegmentId={setActiveSegmentId}
            onUpdateSegment={handleUpdateSegment}
          />
        </div>
      </div>

      <DataPointList
        data-cy="data-point-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeDataPointId={activeSegmentId}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveDataPointId={setActiveSegmentId}
        activeAnnotatedText={activeAnnotatedText}
        mode={mode}
        isDatasetListOpen={true}
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
        isOpen={true}
        setIsOpen={() => {}}
      />
    </div>
  );
}
