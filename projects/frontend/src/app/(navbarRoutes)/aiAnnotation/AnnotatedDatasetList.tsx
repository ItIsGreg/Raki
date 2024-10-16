import { useEffect, useRef, useState } from "react";
import { LLMAnnotationAnnotatedDatasetListProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readAllAnnotatedDatasets,
  readAllAnnotatedTexts,
  readAllApiKeys,
  readAllProfilePoints,
  readAllTexts,
} from "@/lib/db/crud";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfilePoint, Text } from "@/lib/db/db";
import { annotateText, handleUploadAnnotatedDataset } from "./annotationUtils";
import { AddDatasetForm } from "./AddDatasetForm";
import { ApiKeyInput } from "./ApiKeyInput";
import { AnnotatedDatasetCard } from "./AnnotatedDatasetCard";

const AnnotatedDatasetList = (
  props: LLMAnnotationAnnotatedDatasetListProps
) => {
  const { activeAnnotatedDataset, setActiveAnnotatedDataset } = props;

  const [addingDataset, setAddingDataset] = useState(false);
  const [activeProfilePoints, setActiveProfilePoints] = useState<
    ProfilePoint[]
  >([]);

  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [annotationTexts, setAnnotationTexts] = useState<Text[]>([]);

  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());
  const dbApiKeys = useLiveQuery(() => readAllApiKeys());
  const dbTexts = useLiveQuery(() => readAllTexts());
  const dbAnnotatedTexts = useLiveQuery(() => readAllAnnotatedTexts());
  const dbProfilePoints = useLiveQuery(() => readAllProfilePoints());

  const fileInputRef = useRef<HTMLInputElement>(null);

  // create the array containing the text that should be annotated
  useEffect(() => {
    const annotationTexts: Text[] = [];
    if (dbTexts && dbAnnotatedDatasets) {
      dbTexts.forEach((text) => {
        if (text.datasetId === activeAnnotatedDataset?.datasetId) {
          annotationTexts.push(text);
        }
      });
      if (dbAnnotatedTexts) {
        setAnnotationTexts(
          annotationTexts.filter((text) => {
            return !dbAnnotatedTexts.find((annotatedText) => {
              return (
                annotatedText.textId === text.id &&
                annotatedText.annotatedDatasetId === activeAnnotatedDataset?.id
              );
            });
          })
        );
      }
    }
  }, [isRunning, activeAnnotatedDataset]);

  // annotation control useEffect
  useEffect(() => {
    let isCancelled = false;

    const runAnnotation = async () => {
      if (isRunning && currentIndex < annotationTexts.length) {
        await annotateText(
          annotationTexts[currentIndex],
          activeAnnotatedDataset!,
          activeProfilePoints,
          dbApiKeys
        );
        if (!isCancelled) {
          setCurrentIndex(currentIndex + 1);
        }
      }
    };

    runAnnotation();

    return () => {
      isCancelled = true;
    };
  }, [
    isRunning,
    currentIndex,
    annotationTexts,
    activeAnnotatedDataset,
    activeProfilePoints,
    dbApiKeys,
  ]);

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
  };

  const identifyActiveProfilePoints = (profileId: string) => {
    if (dbProfilePoints) {
      const activeProfilePoints: ProfilePoint[] = [];
      dbProfilePoints.forEach((profilePoint) => {
        if (profilePoint.profileId === profileId) {
          activeProfilePoints.push(profilePoint);
        }
      });
      setActiveProfilePoints(activeProfilePoints);
    }
  };

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await handleUploadAnnotatedDataset(file);
      // You might want to refresh the list of annotated datasets here
    } catch (error) {
      console.error("Error uploading annotated dataset:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Annotated Datasets</CardTitle>
          <div className="flex-grow"></div>
          <ApiKeyInput />
          <div className="flex-grow"></div>
          <Button onClick={() => setAddingDataset(true)}>New Dataset</Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileUpload}
          />
          <Button onClick={handleUploadButtonClick}>Upload Dataset</Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {addingDataset && (
            <AddDatasetForm onClose={() => setAddingDataset(false)} />
          )}

          {dbAnnotatedDatasets?.map((dataset) => (
            <AnnotatedDatasetCard
              key={dataset.id}
              dataset={dataset}
              isActive={activeAnnotatedDataset === dataset}
              isRunning={isRunning}
              onSelect={() => {
                identifyActiveProfilePoints(dataset.profileId);
                setActiveAnnotatedDataset(dataset);
              }}
              onStart={() => {
                identifyActiveProfilePoints(dataset.profileId);
                setActiveAnnotatedDataset(dataset);
                handleStart();
              }}
              onStop={handleStop}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotatedDatasetList;
