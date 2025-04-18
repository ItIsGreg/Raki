import { updateDataPoint } from "@/lib/db/crud";
import { DataPoint } from "@/lib/db/db";
import { useEffect } from "react";

interface UseKeyboardNavigationProps {
  dataPoints: DataPoint[] | undefined;
  activeDataPoint: DataPoint | undefined;
  setActiveDataPointId: (id: string | undefined) => void;
  activeDataPointValue: string;
  setActiveDataPointValue: (value: string) => void;
}

export const useKeyboardNavigation = ({
  dataPoints,
  activeDataPoint,
  setActiveDataPointId,
  activeDataPointValue,
  setActiveDataPointValue,
}: UseKeyboardNavigationProps) => {
  useEffect(() => {
    const arrowRight = () => {
      setActiveDataPointValue("");
      if (!dataPoints?.length) return;
      if (!activeDataPoint) {
        setActiveDataPointId(dataPoints[0].id);
        return;
      }
      const nextDataPoint = dataPoints?.find(
        (dataPoint) =>
          dataPoint.match && dataPoint.match![0] > activeDataPoint?.match![0]
      );
      setActiveDataPointId(nextDataPoint ? nextDataPoint.id : undefined);
    };

    const arrowLeft = () => {
      setActiveDataPointValue("");
      if (!dataPoints?.length) return;
      if (!activeDataPoint) {
        setActiveDataPointId(dataPoints[0].id);
        return;
      }
      const previousDataPoint = dataPoints
        ?.slice()
        .reverse()
        .find(
          (dataPoint) =>
            dataPoint.match && dataPoint.match[0] < activeDataPoint?.match![0]
        );
      setActiveDataPointId(
        previousDataPoint ? previousDataPoint.id : dataPoints[0].id
      );
    };

    const handleKeyDown = (event: KeyboardEvent) => {
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
  ]);
};
