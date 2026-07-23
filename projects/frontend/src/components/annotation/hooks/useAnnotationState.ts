import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { RunSelection, selectRunSubset } from "../utils/runSelection";
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
  const [batchIndex, setBatchIndex] = useState(0);
  const [textBatches, setTextBatches] = useState<Text[][]>([]);
  const [faultyBatches, setFaultyBatches] = useState<AnnotatedText[][]>([]);
  const [faultyBatchIndex, setFaultyBatchIndex] = useState(0);
  // Controls cancellation of the active annotation run. Stop aborts it; the run
  // then stops starting new requests and cancels in-flight ones, and only after
  // it has fully settled does the effect return the state to "idle" — which is
  // what prevents a resume from overlapping a still-running (uncancelled) run.
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Texts in the active dataset that have not been annotated yet, sorted by
  // filename. This is the candidate pool a run draws from (and what the
  // "Run subset" dialog previews against).
  const unannotatedTexts = useMemo(() => {
    if (!activeAnnotatedDataset || !dbTexts || !dbAnnotatedTexts) return [];

    const annotatedTextIds = new Set(
      dbAnnotatedTexts
        .filter((at) => at.annotatedDatasetId === activeAnnotatedDataset.id)
        .map((at) => at.textId)
    );

    return dbTexts
      .filter(
        (text) =>
          text.datasetId === activeAnnotatedDataset.datasetId &&
          !annotatedTextIds.has(text.id)
      )
      .sort((a, b) =>
        a.filename.localeCompare(b.filename, undefined, { sensitivity: "base" })
      );
  }, [activeAnnotatedDataset, dbTexts, dbAnnotatedTexts]);

  const prepareTextBatches = useCallback(
    (selection: RunSelection = { mode: "all" }) => {
      if (!dbBatchSize?.[0]) return;

      // Narrow the unannotated pool to the requested subset. The chosen texts
      // run as a single sliding-window pass (concurrency = batch-size setting),
      // not fixed sequential chunks.
      const { selected } = selectRunSubset(unannotatedTexts, selection);
      setTextBatches(selected.length ? [selected] : []);
      setBatchIndex(0);
    },
    [unannotatedTexts, dbBatchSize]
  );

  useEffect(() => {
    const runAnnotation = async () => {
      if (!activeAnnotatedDataset || !dbApiKeys || !dbLlmProvider || !dbLlmModel || !dbLlmUrl || !dbMaxTokens || !dbBatchSize?.[0])
        return;

      // The batch-size setting is now the max number of requests kept in flight
      // at once (the sliding-window width), not a chunk size.
      const concurrency = dbBatchSize[0].value;
      const signal = abortControllerRef.current?.signal;

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
            concurrency,
            signal
          );
          // If Stop was pressed, halt here (the run has settled) instead of
          // advancing or auto-rerunning faulty texts.
          if (signal?.aborted) {
            setAnnotationState("idle");
          } else {
            setBatchIndex((prevIndex) => prevIndex + 1);
          }
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
            },
            signal
          );
          if (signal?.aborted) {
            setAnnotationState("idle");
          } else {
            setFaultyBatchIndex((prevIndex) => prevIndex + 1);
          }
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

  const handleStart = (selection: RunSelection = { mode: "all" }) => {
    // Fresh cancellation scope for this run. prepareTextBatches recomputes the
    // unannotated set from the DB, which is now accurate because Stop waits for
    // the previous run to fully settle before returning to "idle".
    abortControllerRef.current = new AbortController();
    prepareTextBatches(selection);
    setAnnotationState("regular");
  };

  const handleStop = () => {
    // Cancel the active run: workers stop pulling new texts and in-flight
    // requests are aborted (their results discarded). We deliberately do NOT set
    // "idle" here — the running effect returns the state to idle once the run has
    // actually settled, so the Start button (and thus a resume) only reappears
    // after the run is truly stopped.
    abortControllerRef.current?.abort();
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
    unannotatedTexts,
  };
};
