import { useState, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readAllAnnotatedDatasets,
  readAllApiKeys,
  readAllTexts,
  readAllAnnotatedTexts,
  readAllProfilePoints,
} from "@/lib/db/crud";
import { AnnotatedDataset, ProfilePoint, Text } from "@/lib/db/db";
import { annotateTextBatch } from "../annotationUtils";

interface UseAnnotationStateProps {
  activeAnnotatedDataset: AnnotatedDataset | null;
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | null) => void;
  activeProfilePoints: ProfilePoint[];
  setActiveProfilePoints: (points: ProfilePoint[]) => void;
  batchSize: number;
}

export const useAnnotationState = ({
  activeAnnotatedDataset,
  setActiveAnnotatedDataset,
  activeProfilePoints,
  setActiveProfilePoints,
  batchSize,
}: UseAnnotationStateProps) => {
  // state definitions
  const [addingDataset, setAddingDataset] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [batchIndex, setBatchIndex] = useState(0);
  const [textBatches, setTextBatches] = useState<Text[][]>([]);

  // db queries
  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());
  const dbApiKeys = useLiveQuery(() => readAllApiKeys());
  const dbTexts = useLiveQuery(() => readAllTexts());
  const dbAnnotatedTexts = useLiveQuery(() => readAllAnnotatedTexts());
  const dbProfilePoints = useLiveQuery(() => readAllProfilePoints());

  const prepareTextBatches = useCallback(() => {
    if (!activeAnnotatedDataset || !dbTexts || !dbAnnotatedTexts) return;

    const annotatedTextIds = new Set(
      dbAnnotatedTexts
        .filter((at) => at.annotatedDatasetId === activeAnnotatedDataset.id)
        .map((at) => at.textId)
    );

    const unannotatedTexts = dbTexts.filter(
      (text) =>
        text.datasetId === activeAnnotatedDataset.datasetId &&
        !annotatedTextIds.has(text.id)
    );

    const batches: Text[][] = [];
    for (let i = 0; i < unannotatedTexts.length; i += batchSize) {
      batches.push(unannotatedTexts.slice(i, i + batchSize));
    }

    console.log(batches);

    setTextBatches(batches);
    setBatchIndex(0);
  }, [activeAnnotatedDataset, dbTexts, batchSize, dbAnnotatedTexts]);

  useEffect(() => {
    if (
      isRunning &&
      textBatches.length > 0 &&
      batchIndex < textBatches.length
    ) {
      const runAnnotation = async () => {
        if (!activeAnnotatedDataset || !dbApiKeys) return;

        await annotateTextBatch(
          textBatches[batchIndex],
          activeAnnotatedDataset,
          activeProfilePoints,
          dbApiKeys[0].key
        );

        setBatchIndex((prevIndex) => prevIndex + 1);
      };

      runAnnotation();
    } else if (
      isRunning &&
      (textBatches.length === 0 || batchIndex >= textBatches.length)
    ) {
      setIsRunning(false);
      console.log("Annotation completed");
    }
  }, [
    isRunning,
    textBatches,
    batchIndex,
    activeAnnotatedDataset,
    activeProfilePoints,
    dbApiKeys,
    batchSize,
  ]);

  const handleStart = () => {
    prepareTextBatches();
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTextBatches([]);
    setBatchIndex(0);
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
