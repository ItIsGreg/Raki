import { updateDataPoint } from "@/lib/db/crud";
import { DataPoint, Text, AnnotatedText, ProfilePoint, SegmentDataPoint } from "@/lib/db/db";
import { useEffect } from "react";
import { TASK_MODE, TaskMode } from "@/app/constants";

type AnyDataPoint = DataPoint | SegmentDataPoint;

interface UseDataPointKeyboardNavigationProps {
  dataPoints: AnyDataPoint[] | undefined;
  activeDataPoint: AnyDataPoint | undefined;
  setActiveDataPointId: (id: string | undefined) => void;
  activeDataPointValue: string;
  setActiveDataPointValue: (value: string) => void;
  activeTooltipId: string | undefined;
  setActiveTooltipId: (id: string | undefined) => void;
  mode: TaskMode;
  activeProfilePoints?: ProfilePoint[];
  setEditingValue?: (value: string) => void;
  setEditingDataPointId?: (id: string | undefined) => void;
  isSelectOpen: boolean;
  openSelectId: string | undefined;
  setOpenSelectId: (id: string | undefined) => void;
}

export const useDataPointKeyboardNavigation = ({
  dataPoints,
  activeDataPoint,
  setActiveDataPointId,
  activeDataPointValue,
  setActiveDataPointValue,
  activeTooltipId,
  setActiveTooltipId,
  mode,
  activeProfilePoints,
  setEditingValue,
  setEditingDataPointId,
  isSelectOpen,
  openSelectId,
  setOpenSelectId,
}: UseDataPointKeyboardNavigationProps) => {
  useEffect(() => {
    const handleDataPointListNavigation = (event: KeyboardEvent) => {
      // Don't handle navigation if a select is open
      if (openSelectId) return;

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
      // Don't handle any keyboard navigation if a select is open
      if (openSelectId) return;

      // Handle data point list navigation
      handleDataPointListNavigation(event);

      // Handle enter key for valueset inputs
      if (event.key === "Enter" && activeDataPoint && "match" in activeDataPoint) {
        const activeProfilePoint = activeProfilePoints?.find(
          (profilePoint) => profilePoint.id === activeDataPoint.profilePointId
        );
        if (activeProfilePoint?.datatype === "valueset") {
          event.preventDefault();
          setOpenSelectId(activeDataPoint.id);
        }
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
    mode,
    activeProfilePoints,
    setEditingValue,
    setEditingDataPointId,
    isSelectOpen,
    openSelectId,
    setOpenSelectId,
  ]);
};

interface UseTextKeyboardNavigationProps {
  texts: Text[] | undefined;
  activeAnnotatedText: AnnotatedText | undefined;
  annotatedTexts: AnnotatedText[] | undefined;
  setActiveAnnotatedText: (text: AnnotatedText) => void;
  dataPoints: AnyDataPoint[] | undefined;
  activeDataPoint: AnyDataPoint | undefined;
  setActiveDataPointId: (id: string | undefined) => void;
  activeDataPointValue: string;
  setActiveDataPointValue: (value: string) => void;
  activeTooltipId: string | undefined;
  setActiveTooltipId: (id: string | undefined) => void;
}

export const useTextKeyboardNavigation = ({
  texts,
  activeAnnotatedText,
  annotatedTexts,
  setActiveAnnotatedText,
  dataPoints,
  activeDataPoint,
  setActiveDataPointId,
  activeDataPointValue,
  setActiveDataPointValue,
  activeTooltipId,
  setActiveTooltipId,
}: UseTextKeyboardNavigationProps) => {
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

      // Only handle text navigation if Shift is pressed
      if (!event.shiftKey) return;

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

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle tooltip navigation
      if (event.key === "ArrowRight") {
        event.preventDefault();
        arrowRight();
        return;
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        arrowLeft();
        return;
      }

      // Handle text navigation
      handleTextNavigation(event);

      // Handle escape and enter keys
      switch (event.key) {
        case "Enter":
          if (activeDataPoint && "match" in activeDataPoint) {
            updateDataPoint({
              ...activeDataPoint,
              value: activeDataPointValue || activeDataPoint.value,
              verified: true,
            });
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
    texts,
    activeAnnotatedText,
    annotatedTexts,
    setActiveAnnotatedText,
    dataPoints,
    activeDataPoint,
    setActiveDataPointId,
    activeDataPointValue,
    setActiveDataPointValue,
    activeTooltipId,
    setActiveTooltipId,
  ]);
};
