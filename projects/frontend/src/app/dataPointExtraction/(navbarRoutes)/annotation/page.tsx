"use client";

import { useState } from "react";
import { AnnotatedDataset, AnnotatedText, ProfilePoint } from "@/lib/db/db";
import TextAnnotation from "@/components/annotation/TextAnnotation";
import DataPointList from "@/components/annotation/DataPointList";
import AnnotatedTextList from "@/components/annotation/AnnotatedTextList";
import AnnotatedDatasetList from "@/components/aiAnnotation/AnnotatedDatasetList";
import { TASK_MODE } from "@/app/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

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
  const [activeProfilePoints, setActiveProfilePoints] = useState<
    ProfilePoint[]
  >([]);
  const [isDatasetListOpen, setIsDatasetListOpen] = useState(true);

  // Since this is in the dataPointExtraction directory, we set the mode accordingly
  const mode = TASK_MODE.DATAPOINT_EXTRACTION;

  // Wrapper functions to handle type conversion
  const handleSetActiveAnnotatedDataset = (
    dataset: AnnotatedDataset | null
  ) => {
    setActiveAnnotatedDataset(dataset || undefined);
  };

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
        setActiveAnnotatedText={setActiveAnnotatedText}
      />
      <DataPointList
        data-cy="data-point-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeDataPointId={activeDataPointId}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveDataPointId={setActiveDataPointId}
        activeAnnotatedText={activeAnnotatedText}
        mode={mode}
        isDatasetListOpen={isDatasetListOpen}
      />
      <AnnotatedTextList
        data-cy="annotated-text-list"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeAnnotatedText={activeAnnotatedText}
        setActiveAnnotatedText={setActiveAnnotatedText}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        mode={mode}
      />
      <Sheet open={isDatasetListOpen} onOpenChange={setIsDatasetListOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
            data-cy="toggle-dataset-list"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${
                isDatasetListOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 w-[400px]">
          <div className="h-full overflow-y-auto">
            <AnnotatedDatasetList<ProfilePoint>
              data-cy="dataset-list"
              activeAnnotatedDataset={activeAnnotatedDataset || null}
              activeProfilePoints={activeProfilePoints}
              setActiveAnnotatedDataset={handleSetActiveAnnotatedDataset}
              setActiveProfilePoints={setActiveProfilePoints}
              mode={mode}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Annotation;
