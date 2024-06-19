import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TextAnnotationProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readDataPointsByAnnotatedText,
  readProfile,
  readProfilePoint,
  readProfilePointsByProfile,
  readTextsByDataset,
} from "@/lib/db/crud";
import { DataPoint } from "@/lib/db/db";
import { useEffect, useState } from "react";
import TextSlice from "./TextSlice";
import DataPointSlice from "./DataPointSlice";

const TextAnnotation = (props: TextAnnotationProps) => {
  const {
    activeAnnotatedDataset,
    setActiveAnnotatedDataset,
    activeDataPoint,
    setActiveDataPoint,
    activeAnnotatedText,
  } = props;

  const texts = useLiveQuery(
    () => readTextsByDataset(activeAnnotatedDataset?.datasetId),
    [activeAnnotatedDataset]
  );

  const dataPoints = useLiveQuery(
    () => readDataPointsByAnnotatedText(activeAnnotatedText?.id),
    [activeAnnotatedText]
  );

  const activeProfile = useLiveQuery(
    () => readProfile(activeAnnotatedDataset?.profileId),
    [activeAnnotatedDataset]
  );
  const activeProfilePoints = useLiveQuery(
    () => readProfilePointsByProfile(activeProfile?.id),
    [activeProfile]
  );
  const activeProfilePoint = useLiveQuery(
    () => readProfilePoint(activeDataPoint?.profilePointId),
    [activeDataPoint]
  );
  const [activeDataPointSliceRef, setActiveDataPointSliceRef] =
    useState<HTMLDivElement | null>(null);

  const [activeDataPointValue, setActiveDataPointValue] = useState<string>("");

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "ArrowRight":
        // find the next data point by index
        if (!dataPoints?.length) return;
        if (!activeDataPoint) {
          setActiveDataPoint(dataPoints[0]);
          return;
        }
        const nextDataPoint = dataPoints?.find(
          (dataPoint) =>
            dataPoint.match && dataPoint.match![0] > activeDataPoint?.match![0]
        );
        setActiveDataPoint(nextDataPoint ? nextDataPoint : undefined);

        break;
      case "ArrowLeft":
        console.log("ArrowLeft");
        // find the previous data point by index
        if (!dataPoints?.length) return;
        if (!activeDataPoint) {
          setActiveDataPoint(dataPoints[0]);
          return;
        }
        const previousDataPoint = dataPoints
          ?.slice()
          .reverse()
          .find(
            (dataPoint) =>
              dataPoint.match && dataPoint.match[0] < activeDataPoint?.match![0]
          );
        setActiveDataPoint(
          previousDataPoint ? previousDataPoint : dataPoints[0]
        );
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // Add event listener for keydown
    window.addEventListener("keydown", handleKeyDown);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeDataPoint, dataPoints]);

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
        />
      );
      highlightedText.push(
        <DataPointSlice
          dataPoint={dataPoint}
          dataPoints={dataPoints}
          text={text}
          activeDataPoint={activeDataPoint}
          setActiveDataPoint={setActiveDataPoint}
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
