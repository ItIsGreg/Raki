import { useState, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readAllAnnotatedDatasets,
  readAllApiKeys,
  readAllTexts,
  readAllAnnotatedTexts,
  readAllProfilePoints,
} from "@/lib/db/crud";
import {
  AnnotatedDataset,
  AnnotatedText,
  ProfilePoint,
  Text,
} from "@/lib/db/db";
import { annotateTextBatch, reannotateFaultyText } from "../annotationUtils";

interface UseAnnotationStateProps {
  activeAnnotatedDataset: AnnotatedDataset | null;
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | null) => void;
  activeProfilePoints: ProfilePoint[];
  setActiveProfilePoints: (points: ProfilePoint[]) => void;
  batchSize: number;
  autoRerunFaulty: boolean;
}

export const useAnnotationState = ({
  activeAnnotatedDataset,
  setActiveAnnotatedDataset,
  activeProfilePoints,
  setActiveProfilePoints,
  batchSize,
  autoRerunFaulty,
}: UseAnnotationStateProps) => {
  // state definitions
  const [addingDataset, setAddingDataset] = useState(false);

  const [annotationState, setAnnotationState] = useState<
    "idle" | "regular" | "faulty"
  >("idle");

  const [isRunning, setIsRunning] = useState(false);
  const [batchIndex, setBatchIndex] = useState(0);
  const [textBatches, setTextBatches] = useState<Text[][]>([]);

  const [faultyBatches, setFaultyBatches] = useState<AnnotatedText[][]>([]);
  const [faultyBatchIndex, setFaultyBatchIndex] = useState(0);

  // db queries
  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());
  const dbApiKeys = useLiveQuery(() => readAllApiKeys());
  const dbTexts = useLiveQuery(() => readAllTexts());
  const dbAnnotatedTexts = useLiveQuery(() => readAllAnnotatedTexts());
  const dbProfilePoints = useLiveQuery(() => readAllProfilePoints());

  const prepareFaultyBatches = useCallback(() => {
    if (!activeAnnotatedDataset || !dbAnnotatedTexts) return;

    const faultyTexts = dbAnnotatedTexts.filter(
      (at) => at.annotatedDatasetId === activeAnnotatedDataset.id && at.aiFaulty
    );

    const faultyBatches: AnnotatedText[][] = [];
    for (let i = 0; i < faultyTexts.length; i += batchSize) {
      faultyBatches.push(faultyTexts.slice(i, i + batchSize));
    }

    setFaultyBatches(faultyBatches);
    setFaultyBatchIndex(0);
  }, [activeAnnotatedDataset, dbAnnotatedTexts, batchSize]);

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
  }, [activeAnnotatedDataset, dbTexts, dbAnnotatedTexts, batchSize]);

  useEffect(() => {
    const runAnnotation = async () => {
      if (!activeAnnotatedDataset || !dbApiKeys) return;

      if (annotationState === "regular") {
        if (textBatches.length > 0 && batchIndex < textBatches.length) {
          await annotateTextBatch(
            textBatches[batchIndex],
            activeAnnotatedDataset,
            activeProfilePoints,
            dbApiKeys[0].key
          );
          setBatchIndex((prevIndex) => prevIndex + 1);
        } else if (autoRerunFaulty) {
          // Transition to faulty annotation
          prepareFaultyBatches();
          setAnnotationState("faulty");
        } else {
          setAnnotationState("idle");
        }
      } else if (annotationState === "faulty") {
        if (
          faultyBatches.length > 0 &&
          faultyBatchIndex < faultyBatches.length
        ) {
          await Promise.all(
            faultyBatches[faultyBatchIndex].map((annotatedText) =>
              reannotateFaultyText(
                annotatedText,
                activeProfilePoints,
                dbApiKeys
              )
            )
          );
          setFaultyBatchIndex((prevIndex) => prevIndex + 1);
        } else {
          setAnnotationState("idle");
        }
      }
    };

    if (annotationState !== "idle") {
      runAnnotation();
    }
  }, [
    annotationState,
    textBatches,
    batchIndex,
    faultyBatches,
    faultyBatchIndex,
    activeAnnotatedDataset,
    activeProfilePoints,
    dbApiKeys,
    autoRerunFaulty,
  ]);

  const handleStart = () => {
    prepareTextBatches();
    setAnnotationState("regular");
  };

  const handleStop = () => {
    setAnnotationState("idle");
    setTextBatches([]);
    setBatchIndex(0);
    setFaultyBatches([]);
    setFaultyBatchIndex(0);
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
    dbAnnotatedDatasets,
    dbApiKeys,
    dbAnnotatedTexts,
    dbTexts,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
    autoRerunFaulty,
    annotationState,
  };
};
