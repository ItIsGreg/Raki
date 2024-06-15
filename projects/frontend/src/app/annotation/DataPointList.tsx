import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnotationDataPointListProps } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import { readDataPointsByAnnotatedText } from "@/lib/db/crud";
import { Button } from "@/components/ui/button";
import { act } from "react";

const DataPointList = (props: AnnotationDataPointListProps) => {
  const {
    activeAnnotatedDataset,
    activeDataPoint,
    setActiveAnnotatedDataset,
    setActiveDataPoint,
    activeAnnotatedText,
  } = props;

  const dataPoints = useLiveQuery(
    () => readDataPointsByAnnotatedText(activeAnnotatedText?.id),
    [activeAnnotatedText]
  );

  return (
    <div className="col-span-1">
      <Card>
        <CardHeader>
          <CardTitle>Datapoints</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {dataPoints?.map((dataPoint) => {
            return (
              <Card
                key={dataPoint.id}
                onClick={() =>
                  setActiveDataPoint(
                    activeDataPoint === dataPoint ? undefined : dataPoint
                  )
                }
                className={`cursor-pointer ${
                  activeDataPoint?.id === dataPoint.id ? "bg-gray-100" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="truncate">{dataPoint.name}</CardTitle>
                </CardHeader>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPointList;
