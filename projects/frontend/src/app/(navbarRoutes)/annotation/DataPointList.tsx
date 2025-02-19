import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnotationDataPointListProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  deleteDataPoint,
  readDataPointsByAnnotatedText,
  updateDataPoint,
} from "@/lib/db/crud";
import { TiDeleteOutline } from "react-icons/ti";
import CompactCard from "@/components/CompactCard";

const DataPointList = (props: AnnotationDataPointListProps) => {
  const {
    activeAnnotatedDataset,
    activeDataPointId,
    setActiveAnnotatedDataset,
    setActiveDataPointId,
    activeAnnotatedText,
  } = props;

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
  return (
    <div className="col-span-1 overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row justify-between">
          <CardTitle>Datapoints</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {dataPoints?.map((dataPoint) => (
            <CompactCard
              key={dataPoint.id}
              title={dataPoint.name}
              onClick={() =>
                setActiveDataPointId(
                  activeDataPointId === dataPoint.id ? undefined : dataPoint.id
                )
              }
              isActive={activeDataPointId === dataPoint.id}
              tooltipContent={dataPoint.name}
              className={`
                ${
                  activeDataPointId === dataPoint.id && !dataPoint.verified
                    ? "bg-gray-100"
                    : activeDataPointId === dataPoint.id && dataPoint.verified
                    ? "bg-green-100"
                    : !dataPoint.profilePointId
                    ? "bg-red-100"
                    : ""
                }
                ${dataPoint.verified ? "text-green-800" : ""}
                ${!dataPoint.match ? "text-gray-400" : ""}
              `}
              rightIcon={
                <TiDeleteOutline
                  className="hover:text-red-500 cursor-pointer"
                  size={20}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!dataPoint.profilePointId) {
                      deleteDataPoint(dataPoint.id);
                    } else {
                      updateDataPoint({
                        ...dataPoint,
                        match: undefined,
                        value: undefined,
                      });
                    }
                  }}
                />
              }
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPointList;
