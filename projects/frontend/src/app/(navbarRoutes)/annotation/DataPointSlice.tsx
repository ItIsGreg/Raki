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
import { forwardRef, use, useEffect, useImperativeHandle, useRef } from "react";
import { FaCheck } from "react-icons/fa6";

interface DataPointSliceProps {
  dataPoint: DataPoint;
  dataPoints: DataPoint[];
  text: string;
  activeDataPoint: DataPoint | undefined;
  setActiveDataPoint: (dataPoint: DataPoint | undefined) => void;
  activeProfilePoints: ProfilePoint[] | undefined;
  activeProfilePoint: ProfilePoint | undefined;
  activeDataPointValue: string;
  setActiveDataPointValue: (value: string) => void;
}

const DataPointSlice = forwardRef<
  HTMLInputElement | HTMLButtonElement,
  DataPointSliceProps
>((props, ref) => {
  const {
    dataPoint,
    dataPoints,
    text,
    activeDataPoint,
    setActiveDataPoint,
    activeProfilePoints,
    activeProfilePoint,
    activeDataPointValue,
    setActiveDataPointValue,
  } = props;

  const localInputRef = useRef<HTMLInputElement>(null);
  const localSelectRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => {
    return localInputRef.current ?? localSelectRef.current;
  });

  return (
    <TooltipProvider>
      <Tooltip open={activeDataPoint === dataPoint}>
        <TooltipTrigger>
          <Badge
            onClick={() =>
              setActiveDataPoint(
                activeDataPoint === dataPoint ? undefined : dataPoint
              )
            }
            className={`mr-1 ${dataPoint.verified ? "bg-green-800" : ""}`}
          >
            {text.slice(dataPoint.match![0], dataPoint.match![1])}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <Card>
            <CardHeader>
              <CardTitle>{dataPoint.name}</CardTitle>
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
                    // delete the old placeholder point
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
                    <SelectTrigger>
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
                    ref={localInputRef}
                    type={
                      activeProfilePoint?.datatype === "number"
                        ? "number"
                        : "text"
                    }
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
});

DataPointSlice.displayName = "DataPointSlice";

export default DataPointSlice;
