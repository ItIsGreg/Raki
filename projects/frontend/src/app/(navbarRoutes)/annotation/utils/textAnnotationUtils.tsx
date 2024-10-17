import React from "react";
import { AnnotatedText, DataPoint, ProfilePoint } from "@/lib/db/db";
import TextSlice from "@/app/(navbarRoutes)/annotation/TextSlice";
import DataPointSlice from "@/app/(navbarRoutes)/annotation/DataPointSlice";

interface GenerateHighlightedTextProps {
  text: string;
  dataPoints: DataPoint[];
  activeAnnotatedText: AnnotatedText | undefined;
  setActiveDataPointId: (id: string | undefined) => void;
  activeDataPointId: string | undefined;
  activeProfilePoints: ProfilePoint[] | undefined;
  activeProfilePoint: ProfilePoint | undefined;
  activeDataPointValue: string;
  setActiveDataPointValue: (value: string) => void;
}

export const generateHighlightedText = ({
  text,
  dataPoints,
  activeAnnotatedText,
  setActiveDataPointId,
  activeDataPointId,
  activeProfilePoints,
  activeProfilePoint,
  activeDataPointValue,
  setActiveDataPointValue,
}: GenerateHighlightedTextProps) => {
  const matchedDataPoints = dataPoints.filter((dataPoint) => dataPoint.match);
  const sortedDataPoints = matchedDataPoints.sort(
    (a, b) => a.match![0] - b.match![0]
  );
  let highlightedText = [];
  let lastEnd = 0;
  sortedDataPoints.forEach((dataPoint) => {
    highlightedText.push(
      <TextSlice
        key={`text-${lastEnd}`}
        startIndex={lastEnd}
        text={text.slice(lastEnd, dataPoint.match![0])}
        annotatedTextId={activeAnnotatedText?.id}
        setActiveDataPointId={setActiveDataPointId}
        activeDataPointId={activeDataPointId}
      />
    );
    highlightedText.push(
      <DataPointSlice
        key={`datapoint-${dataPoint.id}`}
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
      key={`text-${lastEnd}`}
      startIndex={lastEnd}
      text={text.slice(lastEnd)}
      annotatedTextId={activeAnnotatedText?.id}
      setActiveDataPointId={setActiveDataPointId}
      activeDataPointId={activeDataPointId}
    />
  );
  return highlightedText;
};
