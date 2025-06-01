import { useState, useEffect, useCallback } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readAllAnnotatedDatasets,
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
import { annotateTextBatch, reannotateFaultyText } from "../annotationUtils";
import { 
  annotateSegmentationTextBatch, 
  reannotateFaultySegmentationText 
} from "../segmentationAnnotationUtils";
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
  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());
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

    const batchSize = dbBatchSize[0].value;
    const faultyTexts = dbAnnotatedTexts.filter(
      (at) => at.annotatedDatasetId === activeAnnotatedDataset.id && at.aiFaulty
    );

    const faultyBatches: AnnotatedText[][] = [];
    for (let i = 0; i < faultyTexts.length; i += batchSize) {
      faultyBatches.push(faultyTexts.slice(i, i + batchSize));
    }

    setFaultyBatches(faultyBatches);
    setFaultyBatchIndex(0);
  }, [activeAnnotatedDataset, dbAnnotatedTexts, dbBatchSize]);

  const prepareTextBatches = useCallback(() => {
    if (!activeAnnotatedDataset || !dbTexts || !dbAnnotatedTexts || !dbBatchSize?.[0])
      return;

    const batchSize = dbBatchSize[0].value;
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

    const batches: Text[][] = [];
    for (let i = 0; i < unannotatedTexts.length; i += batchSize) {
      batches.push(unannotatedTexts.slice(i, i + batchSize));
    }

    setTextBatches(batches);
    setBatchIndex(0);
  }, [activeAnnotatedDataset, dbTexts, dbAnnotatedTexts, dbBatchSize]);

  useEffect(() => {
    const runAnnotation = async () => {
      if (!activeAnnotatedDataset || !dbApiKeys || !dbLlmProvider || !dbLlmModel || !dbLlmUrl || !dbMaxTokens)
        return;

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
            dbMaxTokens[0]?.value
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
          await Promise.all(
            faultyBatches[faultyBatchIndex].map((annotatedText) =>
              reannotateFunction(
                annotatedText,
                activeProfilePoints as any, // Type assertion needed due to generic constraints
                dbLlmProvider[0].provider,
                dbLlmModel[0].name,
                dbLlmUrl[0].url,
                dbApiKeys[0].key,
                dbMaxTokens[0]?.value
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
    dbLlmProvider,
    dbLlmModel,
    dbLlmUrl,
    dbMaxTokens,
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
