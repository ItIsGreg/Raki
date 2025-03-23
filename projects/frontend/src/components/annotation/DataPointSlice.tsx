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
            data-cy="datapoint-badge"
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
          <Card data-cy="text-datapoint-card">
            <CardHeader className="flex flex-row gap-2">
              <CardTitle data-cy="datapoint-title">{dataPoint.name}</CardTitle>
              <div className="flex-grow"></div>
              <TiDeleteOutline
                data-cy="datapoint-delete-btn"
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
                  data-cy="profile-point-select"
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
                  <SelectTrigger data-cy="profile-point-select-trigger">
                    Select a profile Point
                  </SelectTrigger>
                  <SelectContent data-cy="profile-point-select-content">
                    <SelectGroup data-cy="profile-point-group">
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
                            data-cy="profile-point-option"
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
                <div
                  className="flex flex-col gap-2"
                  data-cy="valueset-container"
                >
                  <Select
                    data-cy="valueset-select"
                    onValueChange={(value: string) => {
                      // update the data point value
                      updateDataPoint({
                        ...dataPoint,
                        value: value as string,
                        verified: true,
                      });
                    }}
                  >
                    <SelectTrigger data-cy="valueset-trigger" autoFocus>
                      {dataPoint.value?.toString() ?? "Value"}
                    </SelectTrigger>
                    <SelectContent data-cy="valueset-content">
                      {activeProfilePoint?.valueset?.map((value) => (
                        <SelectItem key={value} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    data-cy="verify-button"
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
                <div
                  className="flex flex-col gap-2"
                  data-cy="value-input-container"
                >
                  <Input
                    data-cy="value-input"
                    value={activeDataPointValue}
                    onChange={(e) => setActiveDataPointValue(e.target.value)}
                    placeholder={dataPoint.value?.toString() ?? "Value"}
                    autoFocus
                  />
                  <div className="flex flex-row gap-1">
                    <Button
                      data-cy="update-value-btn"
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
                      data-cy="verify-value-btn"
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
