"use client";

import { useState } from "react";
import DataPointList from "@/components/annotation/DataPointList";
import { TextDisplay } from "@/components/annotation/SegmentationTextDisplay";
import DatasetList from "@/components/annotation/DatasetList";
import AnnotatedTextList from "@/components/annotation/AnnotatedTextList";
import { TASK_MODE } from "@/app/constants";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  createSegmentDataPoint,
  readSegmentDataPointsByAnnotatedText,
  readText,
} from "@/lib/db/crud";
import { v4 as uuidv4 } from "uuid";
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
  const [isMarkdownEnabled, setIsMarkdownEnabled] = useState(false);

  // Get segments from database
  const segments =
    useLiveQuery<SegmentDataPoint[]>(
      () => readSegmentDataPointsByAnnotatedText(activeAnnotatedText?.id),
      [activeAnnotatedText]
    ) || [];

  // Get text content from database
  const text = useLiveQuery<Text | undefined>(
    () =>
      activeAnnotatedText?.textId
        ? readText(activeAnnotatedText.textId)
        : undefined,
    [activeAnnotatedText?.textId]
  );

  const handleCreateSegment = async (begin: string, end: string) => {
    if (!activeAnnotatedText) return;

    const newSegment = {
      id: uuidv4(),
      name: `Section ${begin}...${end}`,
      begin,
      end,
      beginMatch: [0], // These will need to be calculated properly
      endMatch: [0], // These will need to be calculated properly
      annotatedTextId: activeAnnotatedText.id,
      verified: false,
      profilePointId: undefined,
    };

    await createSegmentDataPoint(newSegment);
  };

  // Since this is in the textSegmentation directory, we set the mode accordingly
  const mode = TASK_MODE.TEXT_SEGMENTATION;

  return (
    <div
      className="grid grid-cols-7 gap-4 h-full"
      data-cy="annotation-container"
    >
      <div className="col-span-4" data-cy="text-display">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="markdown-mode"
              checked={isMarkdownEnabled}
              onCheckedChange={setIsMarkdownEnabled}
            />
            <Label htmlFor="markdown-mode">Markdown Mode</Label>
          </div>
        </div>
        <TextDisplay
          isMarkdownEnabled={isMarkdownEnabled}
          text={text?.text || ""}
          segments={segments}
          activeSegmentId={activeSegmentId}
          setActiveSegmentId={setActiveSegmentId}
          onCreateSegment={handleCreateSegment}
        />
      </div>

      <DataPointList
        data-cy="data-point-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeDataPointId={activeSegmentId}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveDataPointId={setActiveSegmentId}
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
}
