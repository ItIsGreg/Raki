import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TextAnnotationProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readDataPoint,
  readDataPointsByAnnotatedText,
  readProfile,
  readProfilePoint,
  readProfilePointsByProfile,
  readTextsByDataset,
  updateDataPoint,
} from "@/lib/db/crud";
import { DataPoint } from "@/lib/db/db";
import { useEffect, useRef, useState } from "react";
import TextSlice from "./TextSlice";
import DataPointSlice from "./DataPointSlice";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import test from "node:test";
import next from "next";

const TextAnnotation = (props: TextAnnotationProps) => {
  const {
    activeAnnotatedDataset,
    setActiveAnnotatedDataset,
    activeDataPointId,
    setActiveDataPointId,
    activeAnnotatedText,
  } = props;

  const texts = useLiveQuery(
    () => readTextsByDataset(activeAnnotatedDataset?.datasetId),
    [activeAnnotatedDataset]
  );

  const dataPoints = useLiveQuery(
    () => readDataPointsByAnnotatedText(activeAnnotatedText?.id),
    [activeAnnotatedText]
  )?.sort((a, b) => {
    if (a.match && b.match) {
      return a.match[0] - b.match[0];
    } else if (a.match) {
      return -1;
    } else if (b.match) {
      return 1;
    }
    return 0;
  });

  const activeProfile = useLiveQuery(
    () => readProfile(activeAnnotatedDataset?.profileId),
    [activeAnnotatedDataset]
  );
  const activeDataPoint = useLiveQuery(
    () => readDataPoint(activeDataPointId),
    [activeDataPointId]
  );
  const activeProfilePoints = useLiveQuery(
    () => readProfilePointsByProfile(activeProfile?.id),
    [activeProfile]
  );
  const activeProfilePoint = useLiveQuery(
    () => readProfilePoint(activeDataPoint?.profilePointId),
    [activeDataPoint]
  );

  const [activeDataPointValue, setActiveDataPointValue] = useState<string>("");

  useEffect(() => {
    const arrowRight = () => {
      // reset the active data point value
      setActiveDataPointValue("");
      // find the next data point by index
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
      // reset the active data point value
      setActiveDataPointValue("");
      // find the previous data point by index
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
          if (activeDataPointValue === "") {
            updateDataPoint({
              ...activeDataPoint!,
              verified: true,
            });
          } else {
            updateDataPoint({
              ...activeDataPoint!,
              value: activeDataPointValue,
              verified: true,
            });
          }
          arrowRight();
          break;
        default:
          break;
      }
    };

    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDataPoint, dataPoints, activeDataPointValue]);

  // create a representation of the text and the data points
  // where the data points are highlighted
  const generateHighlightedText = (text: string, dataPoints: DataPoint[]) => {
    const matchedDataPoints = dataPoints.filter((dataPoint) => dataPoint.match);
    const sortedDataPoints = matchedDataPoints.sort(
      (a, b) => a.match![0] - b.match![0]
    );
    let highlightedText = [];
    let lastEnd = 0;
    sortedDataPoints.forEach((dataPoint) => {
      highlightedText.push(
        <TextSlice
          startIndex={lastEnd}
          text={text.slice(lastEnd, dataPoint.match![0])}
          annotatedTextId={activeAnnotatedText?.id}
          setActiveDataPointId={setActiveDataPointId}
          activeDataPointId={activeDataPointId}
        />
      );
      highlightedText.push(
        <DataPointSlice
          dataPoint={dataPoint}
          dataPoints={dataPoints}
          text={text}
          activeDataPointId={activeDataPointId}
          setActiveDataPointId={setActiveDataPointId}
          activeProfilePoints={activeProfilePoints}
          activeProfilePoint={activeProfilePoint}
          activeDataPointValue={activeDataPointValue}
          setActiveDataPointValue={setActiveDataPointValue}
        />
      );
      lastEnd = dataPoint.match![1];
    });
    highlightedText.push(
      <TextSlice
        startIndex={lastEnd}
        text={text.slice(lastEnd)}
        annotatedTextId={activeAnnotatedText?.id}
        setActiveDataPointId={setActiveDataPointId}
      />
    );
    return highlightedText;
  };

  return (
    <div className="col-span-4">
      <Card>
        <CardHeader>
          <CardTitle>Annotation</CardTitle>
        </CardHeader>
        <CardContent>
          {generateHighlightedText(
            texts?.find((text) => text.id === activeAnnotatedText?.textId)
              ?.text ?? "",
            dataPoints ?? []
          ).map((element, index) => (
            <span key={index}>{element}</span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextAnnotation;
