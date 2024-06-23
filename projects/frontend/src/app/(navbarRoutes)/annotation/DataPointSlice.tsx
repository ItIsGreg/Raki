import { DataPointSliceProps } from "@/app/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteDataPoint, updateDataPoint } from "@/lib/db/crud";
import { DataPoint, ProfilePoint } from "@/lib/db/db";
import { FaCheck } from "react-icons/fa6";
import { TiDeleteOutline } from "react-icons/ti";

const DataPointSlice = (props: DataPointSliceProps) => {
  const {
    dataPoint,
    dataPoints,
    text,
    activeDataPointId,
    setActiveDataPointId,
    activeProfilePoints,
    activeProfilePoint,
    activeDataPointValue,
    setActiveDataPointValue,
  } = props;

  return (
    <TooltipProvider>
      <Tooltip open={activeDataPointId === dataPoint.id}>
        <TooltipTrigger>
          <Badge
            onClick={() =>
              setActiveDataPointId(
                activeDataPointId === dataPoint.id ? undefined : dataPoint.id
              )
            }
            className={`mr-1 ${dataPoint.verified ? "bg-green-800" : ""}`}
          >
            {text.slice(dataPoint.match![0], dataPoint.match![1])}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <Card>
            <CardHeader className="flex flex-row gap-2">
              <CardTitle>{dataPoint.name}</CardTitle>
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
            <CardContent>
              {!dataPoint.profilePointId ? (
                <Select
                  onValueChange={(value: string) => {
                    // update the placeholder data point
                    const placeholderDataPoint = dataPoints.find(
                      (dp) => dp.profilePointId === value
                    );
                    if (placeholderDataPoint) {
                      deleteDataPoint(placeholderDataPoint.id);
                    }
                    updateDataPoint({
                      ...dataPoint,
                      name:
                        activeProfilePoints?.find(
                          (profilePoint) => profilePoint.id === value
                        )?.name ?? "Unknown",
                      profilePointId: value,
                    });
                  }}
                >
                  <SelectTrigger>Select a profile Point</SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {activeProfilePoints
                        ?.filter((profilePoint) => {
                          return (
                            dataPoints.find((dp) => {
                              return (
                                dp.profilePointId === profilePoint.id &&
                                dp.match
                              );
                            }) === undefined
                          );
                        })
                        .map((profilePoint) => (
                          <SelectItem
                            key={profilePoint.id}
                            value={profilePoint.id}
                          >
                            {profilePoint.name}
                          </SelectItem>
                        ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              ) : null}

              {dataPoint.profilePointId &&
              activeProfilePoint?.datatype === "valueset" ? (
                <div className="flex flex-col gap-2">
                  <Select
                    onValueChange={(value: string) => {
                      // update the data point value
                      updateDataPoint({
                        ...dataPoint,
                        value: value as string,
                        verified: true,
                      });
                    }}
                  >
                    <SelectTrigger autoFocus>
                      {dataPoint.value?.toString() ?? "Value"}
                    </SelectTrigger>
                    <SelectContent>
                      {activeProfilePoint?.valueset?.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    className="bg-green-800"
                    onClick={() => {
                      // verify the data point
                      updateDataPoint({
                        ...dataPoint,
                        verified: true,
                      });
                    }}
                  >
                    <FaCheck size={24} />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    value={activeDataPointValue}
                    onChange={(e) => setActiveDataPointValue(e.target.value)}
                    placeholder={dataPoint.value?.toString() ?? "Value"}
                    autoFocus
                  />
                  <div className="flex flex-row gap-1">
                    <Button
                      onClick={() => {
                        // update the data point value
                        updateDataPoint({
                          ...dataPoint,
                          value: activeDataPointValue,
                          verified: true,
                        });
                      }}
                    >
                      Update
                    </Button>
                    <div className="flex-grow"></div>
                    <Button
                      className="bg-green-800"
                      onClick={() => {
                        // verify the data point
                        updateDataPoint({
                          ...dataPoint,
                          verified: true,
                        });
                      }}
                    >
                      <FaCheck size={24} />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DataPointSlice;
