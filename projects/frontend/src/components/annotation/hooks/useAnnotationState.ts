import { useState, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readAllAnnotatedDatasets,
  readAnnotatedDatasetsByMode,
  readAllApiKeys,
  readAllTexts,
  readAllAnnotatedTexts,
  readAllProfilePoints,
  readAllSegmentationProfilePoints,
  readAllLLMProviders,
  readAllLLMUrls,
  readAllModels,
  readAllBatchSizes,
  readAllMaxTokens,
} from "@/lib/db/crud";
import {
  AnnotatedDataset,
  AnnotatedText,
  ProfilePoint,
  SegmentationProfilePoint,
  Text,
} from "@/lib/db/db";
import { annotateTextBatch, reannotateFaultyText } from "../utils/annotationUtils";
import {
  annotateSegmentationTextBatch,
  reannotateFaultySegmentationText
} from "../utils/segmentationAnnotationUtils";
import { runWithConcurrency } from "../utils/concurrency";
import { TaskMode } from "@/app/constants";

type ProfilePointType = ProfilePoint | SegmentationProfilePoint;

interface UseAnnotationStateProps<T extends ProfilePointType> {
  activeAnnotatedDataset: AnnotatedDataset | null;
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | null) => void;
  activeProfilePoints: T[];
  setActiveProfilePoints: (points: T[]) => void;
  autoRerunFaulty: boolean;
  mode: TaskMode;
}

export const useAnnotationState = <T extends ProfilePointType>({
  activeAnnotatedDataset,
  setActiveAnnotatedDataset,
  activeProfilePoints,
  setActiveProfilePoints,
  autoRerunFaulty,
  mode,
}: UseAnnotationStateProps<T>) => {
  // state definitions
  const [addingDataset, setAddingDataset] = useState(false);
  const [annotationState, setAnnotationState] = useState<"idle" | "regular" | "faulty">("idle");
  const [isRunning, setIsRunning] = useState(false);
  const [batchIndex, setBatchIndex] = useState(0);
  const [textBatches, setTextBatches] = useState<Text[][]>([]);
  const [faultyBatches, setFaultyBatches] = useState<AnnotatedText[][]>([]);
  const [faultyBatchIndex, setFaultyBatchIndex] = useState(0);

  // db queries
  const dbAnnotatedDatasets = useLiveQuery(() => readAnnotatedDatasetsByMode(mode), [mode]);
  const dbApiKeys = useLiveQuery(() => readAllApiKeys());
  const dbTexts = useLiveQuery(() => readAllTexts());
  const dbAnnotatedTexts = useLiveQuery(() => readAllAnnotatedTexts());
  const dbProfilePoints = useLiveQuery(() => 
    mode === "datapoint_extraction" 
      ? readAllProfilePoints()
      : readAllSegmentationProfilePoints()
  );
  const dbLlmProvider = useLiveQuery(() => readAllLLMProviders());
  const dbLlmModel = useLiveQuery(() => readAllModels());
  const dbLlmUrl = useLiveQuery(() => readAllLLMUrls());
  const dbBatchSize = useLiveQuery(() => readAllBatchSizes());
  const dbMaxTokens = useLiveQuery(() => readAllMaxTokens());

  // Add effect to update activeProfilePoints when dataset or profile points change
  useEffect(() => {
    if (activeAnnotatedDataset?.profileId && dbProfilePoints) {
      const activePoints = dbProfilePoints.filter(
        (profilePoint) => profilePoint.profileId === activeAnnotatedDataset.profileId
      );
      setActiveProfilePoints(activePoints as T[]);
    }
  }, [activeAnnotatedDataset?.profileId, dbProfilePoints, setActiveProfilePoints]);

  const prepareFaultyBatches = useCallback(() => {
    if (!activeAnnotatedDataset || !dbAnnotatedTexts || !dbBatchSize?.[0])
      return;

    const faultyTexts = dbAnnotatedTexts.filter(
      (at) => at.annotatedDatasetId === activeAnnotatedDataset.id && at.aiFaulty
    );

    // All faulty texts run as a single sliding-window pass (concurrency comes
    // from the batch-size setting), not as fixed sequential chunks.
    setFaultyBatches(faultyTexts.length ? [faultyTexts] : []);
    setFaultyBatchIndex(0);
  }, [activeAnnotatedDataset, dbAnnotatedTexts, dbBatchSize]);

  const prepareTextBatches = useCallback(() => {
    if (!activeAnnotatedDataset || !dbTexts || !dbAnnotatedTexts || !dbBatchSize?.[0])
      return;

    const annotatedTextIds = new Set(
      dbAnnotatedTexts
        .filter((at) => at.annotatedDatasetId === activeAnnotatedDataset.id)
        .map((at) => at.textId)
    );

    const unannotatedTexts = dbTexts
      .filter(
        (text) =>
          text.datasetId === activeAnnotatedDataset.datasetId &&
          !annotatedTextIds.has(text.id)
      )
      .sort((a, b) =>
        a.filename.localeCompare(b.filename, undefined, { sensitivity: "base" })
      );

    // All unannotated texts run as a single sliding-window pass (concurrency
    // comes from the batch-size setting), not as fixed sequential chunks — this
    // avoids paying each chunk's slowest-request latency at every boundary.
    setTextBatches(unannotatedTexts.length ? [unannotatedTexts] : []);
    setBatchIndex(0);
  }, [activeAnnotatedDataset, dbTexts, dbAnnotatedTexts, dbBatchSize]);

  useEffect(() => {
    const runAnnotation = async () => {
      if (!activeAnnotatedDataset || !dbApiKeys || !dbLlmProvider || !dbLlmModel || !dbLlmUrl || !dbMaxTokens || !dbBatchSize?.[0])
        return;

      // The batch-size setting is now the max number of requests kept in flight
      // at once (the sliding-window width), not a chunk size.
      const concurrency = dbBatchSize[0].value;

      const annotateFunction = mode === "datapoint_extraction"
        ? annotateTextBatch
        : annotateSegmentationTextBatch;

      const reannotateFunction = mode === "datapoint_extraction"
        ? reannotateFaultyText
        : reannotateFaultySegmentationText;

      if (annotationState === "regular") {
        if (textBatches.length > 0 && batchIndex < textBatches.length) {
          await annotateFunction(
            textBatches[batchIndex],
            activeAnnotatedDataset,
            activeProfilePoints as any, // Type assertion needed due to generic constraints
            dbLlmProvider[0].provider,
            dbLlmModel[0].name,
            dbLlmUrl[0].url,
            dbApiKeys[0].key,
            dbMaxTokens[0]?.value,
            concurrency
          );
          setBatchIndex((prevIndex) => prevIndex + 1);
        } else if (autoRerunFaulty) {
          prepareFaultyBatches();
          setAnnotationState("faulty");
        } else {
          setAnnotationState("idle");
        }
      } else if (annotationState === "faulty") {
        if (faultyBatches.length > 0 && faultyBatchIndex < faultyBatches.length) {
          await runWithConcurrency(
            faultyBatches[faultyBatchIndex],
            concurrency,
            async (annotatedText) => {
              await reannotateFunction(
                annotatedText,
                activeProfilePoints as any, // Type assertion needed due to generic constraints
                dbLlmProvider[0].provider,
                dbLlmModel[0].name,
                dbLlmUrl[0].url,
                dbApiKeys[0].key,
                dbMaxTokens[0]?.value
              );
            }
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
    dbLlmProvider,
    dbLlmModel,
    dbLlmUrl,
    dbMaxTokens,
    dbBatchSize,
    autoRerunFaulty,
    mode,
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
      const activePoints = dbProfilePoints.filter(
        (profilePoint) => profilePoint.profileId === profileId
      );
      setActiveProfilePoints(activePoints as T[]);
    }
  };

  return {
    addingDataset,
    setAddingDataset,
    dbAnnotatedDatasets,
    dbApiKeys,
    dbAnnotatedTexts,
    dbTexts,
    dbBatchSize,
    dbLlmProvider,
    dbLlmModel,
    dbLlmUrl,
    dbMaxTokens,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
    autoRerunFaulty,
    annotationState,
  };
};
