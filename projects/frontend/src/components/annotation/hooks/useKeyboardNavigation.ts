import { updateDataPoint } from "@/lib/db/crud";
import { DataPoint, Text, AnnotatedText } from "@/lib/db/db";
import { useEffect } from "react";

interface UseKeyboardNavigationProps {
  dataPoints: DataPoint[] | undefined;
  activeDataPoint: DataPoint | undefined;
  setActiveDataPointId: (id: string | undefined) => void;
  activeDataPointValue: string;
  setActiveDataPointValue: (value: string) => void;
  activeTooltipId: string | undefined;
  setActiveTooltipId: (id: string | undefined) => void;
  texts: Text[] | undefined;
  activeAnnotatedText: AnnotatedText | undefined;
  annotatedTexts: AnnotatedText[] | undefined;
  setActiveAnnotatedText: (text: AnnotatedText) => void;
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
          dataPoint.match && dataPoint.match![0] > activeDataPoint?.match![0]
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
            dataPoint.match && dataPoint.match[0] < activeDataPoint?.match![0]
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

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey) {
        handleTextNavigation(event);
        return;
      }

      switch (event.key) {
        case "ArrowRight":
          arrowRight();
          break;
        case "ArrowLeft":
          arrowLeft();
          break;
        case "Enter":
          if (activeDataPoint) {
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
  ]);
};
