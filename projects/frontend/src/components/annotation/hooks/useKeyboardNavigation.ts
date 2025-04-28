import { updateDataPoint } from "@/lib/db/crud";
import { DataPoint, Text, AnnotatedText, ProfilePoint, SegmentDataPoint } from "@/lib/db/db";
import { useEffect } from "react";
import { TASK_MODE, TaskMode } from "@/app/constants";

type AnyDataPoint = DataPoint | SegmentDataPoint;

interface UseKeyboardNavigationProps {
  dataPoints: AnyDataPoint[] | undefined;
  activeDataPoint: AnyDataPoint | undefined;
  setActiveDataPointId: (id: string | undefined) => void;
  activeDataPointValue: string;
  setActiveDataPointValue: (value: string) => void;
  activeTooltipId: string | undefined;
  setActiveTooltipId: (id: string | undefined) => void;
  texts: Text[] | undefined;
  activeAnnotatedText: AnnotatedText | undefined;
  annotatedTexts: AnnotatedText[] | undefined;
  setActiveAnnotatedText: (text: AnnotatedText) => void;
  mode: TaskMode;
  activeProfilePoints?: ProfilePoint[];
  setEditingValue?: (value: string) => void;
  setEditingDataPointId?: (id: string | undefined) => void;
}

export const useKeyboardNavigation = ({
  dataPoints,
  activeDataPoint,
  setActiveDataPointId,
  activeDataPointValue,
  setActiveDataPointValue,
  activeTooltipId,
  setActiveTooltipId,
  texts,
  activeAnnotatedText,
  annotatedTexts,
  setActiveAnnotatedText,
  mode,
  activeProfilePoints,
  setEditingValue,
  setEditingDataPointId,
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    const arrowRight = () => {
      setActiveDataPointValue("");
      if (!dataPoints?.length) return;
      if (!activeDataPoint) {
        setActiveDataPointId(dataPoints[0].id);
        setActiveTooltipId(dataPoints[0].id);
        return;
      }
      const nextDataPoint = dataPoints?.find(
        (dataPoint) =>
          "match" in dataPoint &&
          dataPoint.match &&
          (activeDataPoint as DataPoint).match &&
          dataPoint.match[0] > (activeDataPoint as DataPoint).match![0]
      );
      if (nextDataPoint) {
        setActiveDataPointId(nextDataPoint.id);
        setActiveTooltipId(nextDataPoint.id);
      } else {
        setActiveDataPointId(undefined);
        setActiveTooltipId(undefined);
      }
    };

    const arrowLeft = () => {
      setActiveDataPointValue("");
      if (!dataPoints?.length) return;
      if (!activeDataPoint) {
        setActiveDataPointId(dataPoints[0].id);
        setActiveTooltipId(dataPoints[0].id);
        return;
      }
      const previousDataPoint = dataPoints
        ?.slice()
        .reverse()
        .find(
          (dataPoint) =>
            "match" in dataPoint &&
            dataPoint.match &&
            (activeDataPoint as DataPoint).match &&
            dataPoint.match[0] < (activeDataPoint as DataPoint).match![0]
        );
      if (previousDataPoint) {
        setActiveDataPointId(previousDataPoint.id);
        setActiveTooltipId(previousDataPoint.id);
      } else {
        setActiveDataPointId(dataPoints[0].id);
        setActiveTooltipId(dataPoints[0].id);
      }
    };

    const handleTextNavigation = (event: KeyboardEvent) => {
      if (!texts || !activeAnnotatedText || !annotatedTexts) return;

      const sortedAnnotatedTexts = annotatedTexts
        .map((annotatedText) => ({
          ...annotatedText,
          filename:
            texts.find((text) => text.id === annotatedText.textId)
              ?.filename || "",
        }))
        .sort((a, b) =>
          a.filename.localeCompare(b.filename, undefined, {
            sensitivity: "base",
          })
        );

      const currentIndex = sortedAnnotatedTexts.findIndex(
        (at) => at.id === activeAnnotatedText.id
      );

      if (event.key === "ArrowUp" && currentIndex > 0) {
        event.preventDefault();
        setActiveAnnotatedText(sortedAnnotatedTexts[currentIndex - 1]);
      } else if (
        event.key === "ArrowDown" &&
        currentIndex < sortedAnnotatedTexts.length - 1
      ) {
        event.preventDefault();
        setActiveAnnotatedText(sortedAnnotatedTexts[currentIndex + 1]);
      }
    };

    const handleDataPointListNavigation = (event: KeyboardEvent) => {
      if (!dataPoints?.length) return;

      const currentIndex = dataPoints.findIndex(
        (dp) => dp.id === activeDataPoint?.id
      );

      if (event.key === "ArrowUp" && currentIndex > 0) {
        event.preventDefault();
        const newDataPoint = dataPoints[currentIndex - 1];
        setActiveDataPointId(newDataPoint.id);
        // Start editing the value immediately if in datapoint extraction mode
        if (
          mode === TASK_MODE.DATAPOINT_EXTRACTION &&
          "match" in newDataPoint &&
          setEditingValue &&
          setEditingDataPointId
        ) {
          const activeProfilePoint = activeProfilePoints?.find(
            (profilePoint) => profilePoint.id === newDataPoint.profilePointId
          );
          if (activeProfilePoint?.datatype !== "valueset") {
            setEditingValue(newDataPoint.value?.toString() || "");
            setEditingDataPointId(newDataPoint.id);
          }
        }
      } else if (
        event.key === "ArrowDown" &&
        currentIndex < dataPoints.length - 1
      ) {
        event.preventDefault();
        const newDataPoint = dataPoints[currentIndex + 1];
        setActiveDataPointId(newDataPoint.id);
        // Start editing the value immediately if in datapoint extraction mode
        if (
          mode === TASK_MODE.DATAPOINT_EXTRACTION &&
          "match" in newDataPoint &&
          setEditingValue &&
          setEditingDataPointId
        ) {
          const activeProfilePoint = activeProfilePoints?.find(
            (profilePoint) => profilePoint.id === newDataPoint.profilePointId
          );
          if (activeProfilePoint?.datatype !== "valueset") {
            setEditingValue(newDataPoint.value?.toString() || "");
            setEditingDataPointId(newDataPoint.id);
          }
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey) {
        handleTextNavigation(event);
        return;
      }

      // Handle data point list navigation when Shift is not pressed
      if (!event.shiftKey) {
        handleDataPointListNavigation(event);
      }

      switch (event.key) {
        case "ArrowRight":
          arrowRight();
          break;
        case "ArrowLeft":
          arrowLeft();
          break;
        case "Enter":
          if (activeDataPoint && "match" in activeDataPoint) {
            updateDataPoint({
              ...activeDataPoint,
              value: activeDataPointValue || activeDataPoint.value,
              verified: true,
            });
            arrowRight();
          }
          break;
        case "Escape":
          setActiveDataPointId(undefined);
          setActiveTooltipId(undefined);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeDataPoint,
    dataPoints,
    activeDataPointValue,
    setActiveDataPointId,
    setActiveDataPointValue,
    activeTooltipId,
    setActiveTooltipId,
    texts,
    activeAnnotatedText,
    annotatedTexts,
    setActiveAnnotatedText,
    mode,
    activeProfilePoints,
    setEditingValue,
    setEditingDataPointId,
  ]);
};
