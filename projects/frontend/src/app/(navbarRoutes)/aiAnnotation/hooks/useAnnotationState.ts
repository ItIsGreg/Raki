import { useState, useEffect } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readAllAnnotatedDatasets,
  readAllApiKeys,
  readAllTexts,
  readAllAnnotatedTexts,
  readAllProfilePoints,
} from "@/lib/db/crud";
import { AnnotatedDataset, ProfilePoint } from "@/lib/db/db";
import { annotateText } from "../annotationUtils";

interface UseAnnotationStateProps {
  activeAnnotatedDataset: AnnotatedDataset | null;
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | null) => void;
  activeProfilePoints: ProfilePoint[];
  setActiveProfilePoints: (points: ProfilePoint[]) => void;
}

export const useAnnotationState = ({
  activeAnnotatedDataset,
  setActiveAnnotatedDataset,
  activeProfilePoints,
  setActiveProfilePoints,
}: UseAnnotationStateProps) => {
  // state definitions
  const [addingDataset, setAddingDataset] = useState(false);

  const [isRunning, setIsRunning] = useState(false);

  // db queries
  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());
  const dbApiKeys = useLiveQuery(() => readAllApiKeys());
  const dbTexts = useLiveQuery(() => readAllTexts());
  const dbAnnotatedTexts = useLiveQuery(() => readAllAnnotatedTexts());
  const dbProfilePoints = useLiveQuery(() => readAllProfilePoints());

  // effect to run annotation
  useEffect(() => {
    if (
      !isRunning ||
      !activeAnnotatedDataset ||
      !dbTexts ||
      !dbAnnotatedTexts
    ) {
      return;
    }

    let isCancelled = false;

    const runAnnotation = async () => {
      const textsToAnnotate = dbTexts.filter(
        (text) => text.datasetId === activeAnnotatedDataset.datasetId
      );
      const annotatedTextIds = dbAnnotatedTexts
        .filter((at) => at.annotatedDatasetId === activeAnnotatedDataset.id)
        .map((at) => at.textId);

      const unannotatedTexts = textsToAnnotate.filter(
        (text) => !annotatedTextIds.includes(text.id)
      );

      if (unannotatedTexts.length === 0) {
        console.log("All texts annotated");
        return;
      }

      const textToAnnotate = unannotatedTexts[0];

      await annotateText(
        textToAnnotate,
        { id: activeAnnotatedDataset.id },
        activeProfilePoints,
        dbApiKeys
      );

      if (!isCancelled) {
        // Trigger the effect again to process the next text
        runAnnotation();
      }
    };

    runAnnotation();

    return () => {
      isCancelled = true;
    };
  }, [
    isRunning,
    activeAnnotatedDataset,
    dbTexts,
    dbAnnotatedTexts,
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
      const activePoints: ProfilePoint[] = [];
      dbProfilePoints.forEach((profilePoint) => {
        if (profilePoint.profileId === profileId) {
          activePoints.push(profilePoint);
        }
      });
      setActiveProfilePoints(activePoints);
    }
  };

  return {
    addingDataset,
    setAddingDataset,
    isRunning,
    dbAnnotatedDatasets,
    dbApiKeys,
    dbAnnotatedTexts,
    dbTexts,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
  };
};
