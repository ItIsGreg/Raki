import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnotationDataPointListProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  deleteDataPoint,
  readDataPointsByAnnotatedText,
  updateDataPoint,
} from "@/lib/db/crud";
import { TiDeleteOutline } from "react-icons/ti";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          {/* <Button
            onClick={() => {
              if (dataPoints) {
                console.log("Datapoints:", dataPoints);
              } else {
                console.log("No datapoints available");
              }
            }}
            className="mt-2"
          >
            Log Datapoints
          </Button> */}
        </CardHeader>
        <CardContent className="flex flex-col gap-1">
          {dataPoints?.map((dataPoint) => {
            return (
              <TooltipProvider key={dataPoint.id} delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger>
                    <Card
                      onClick={() =>
                        setActiveDataPointId(
                          activeDataPointId === dataPoint.id
                            ? undefined
                            : dataPoint.id
                        )
                      }
                      className={`cursor-pointer ${
                        activeDataPointId === dataPoint.id &&
                        !dataPoint.verified
                          ? "bg-gray-100"
                          : activeDataPointId === dataPoint.id &&
                            dataPoint.verified
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
                        <CardTitle className="truncate">
                          {dataPoint.name}
                        </CardTitle>
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
                  </TooltipTrigger>
                  <TooltipContent>{dataPoint.name}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPointList;
