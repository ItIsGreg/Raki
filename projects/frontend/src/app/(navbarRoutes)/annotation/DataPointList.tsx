import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnotationDataPointListProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  deleteDataPoint,
  readDataPointsByAnnotatedText,
  updateDataPoint,
} from "@/lib/db/crud";
import { TiDeleteOutline } from "react-icons/ti";

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
                  activeDataPoint?.id === dataPoint.id && !dataPoint.verified
                    ? "bg-gray-100"
                    : activeDataPoint?.id === dataPoint.id && dataPoint.verified
                    ? "bg-green-100"
                    : !dataPoint.profilePointId
                    ? "bg-red-100"
                    : ""
                }
                ${dataPoint.verified ? "text-green-800" : ""}
                ${!dataPoint.match ? "text-gray-400" : ""}
                `}
              >
                <CardHeader className="flex flex-row gap-1">
                  <CardTitle className="truncate">{dataPoint.name}</CardTitle>
                  <div className="flex-grow"></div>
                  <TiDeleteOutline
                    className="hover:text-red-500 cursor-pointer"
                    size={24}
                    onClick={() => {
                      if (!dataPoint.profilePointId) {
                        deleteDataPoint(dataPoint.id);
                      } else {
                        // reset the data point
                        updateDataPoint({
                          ...dataPoint,
                          match: undefined,
                          value: undefined,
                        });
                      }
                    }}
                  />
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
