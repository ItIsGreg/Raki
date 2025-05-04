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
import { Trash2 } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface ExtendedDataPointSliceProps extends DataPointSliceProps {
  activeTooltipId: string | undefined;
  setActiveTooltipId: (id: string | undefined) => void;
  setActiveTab?: (tab: string) => void;
  setActiveDataPoint?: (dataPoint: ProfilePoint | undefined) => void;
}

const DataPointSlice = (props: ExtendedDataPointSliceProps) => {
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
    activeTooltipId,
    setActiveTooltipId,
    setActiveTab,
    setActiveDataPoint,
  } = props;

  const tooltipRef = useRef<HTMLDivElement>(null);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeTooltipId === dataPoint.id &&
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        // Don't close if clicking on a select dropdown
        !(event.target as Element).closest('[role="listbox"]')
      ) {
        setActiveTooltipId(undefined);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeTooltipId, dataPoint.id, setActiveTooltipId]);

  const handleClick = () => {
    setActiveDataPointId(dataPoint.id);
    setActiveTooltipId(dataPoint.id);
  };

  const handleTooltipClose = () => {
    setActiveTooltipId(undefined);
  };

  return (
    <TooltipProvider>
      <Tooltip open={activeTooltipId === dataPoint.id}>
        <TooltipTrigger>
          <Badge
            data-cy="datapoint-badge"
            onClick={handleClick}
            className={`mr-1 ${dataPoint.verified ? "bg-green-800" : ""} ${
              activeDataPointId === dataPoint.id
                ? "ring-2 ring-blue-500 ring-offset-2"
                : ""
            }`}
          >
            <div className="flex flex-col items-center w-full">
              <span>
                {text.slice(dataPoint.match![0], dataPoint.match![1])}
              </span>
              <span className="text-[10px] opacity-75 text-center w-full">
                {dataPoint.name}
                {dataPoint.value && (
                  <span className="ml-1">({dataPoint.value})</span>
                )}
              </span>
            </div>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" ref={tooltipRef}>
          <Card data-cy="text-datapoint-card">
            <CardHeader className="flex flex-row gap-2">
              <CardTitle data-cy="datapoint-title">{dataPoint.name}</CardTitle>
              <div className="flex-grow"></div>
              {dataPoint.profilePointId && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 mr-2"
                        data-cy="open-profile-point-btn"
                        onClick={() => {
                          if (setActiveTab) {
                            setActiveTab("profiles");
                          }
                          if (setActiveDataPoint && dataPoint.profilePointId) {
                            const profilePoint = activeProfilePoints?.find(
                              (pp) => pp.id === dataPoint.profilePointId
                            );
                            if (profilePoint) {
                              setActiveDataPoint(profilePoint);
                            }
                          }
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open Profile Point</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 mr-2 hover:text-red-500"
                data-cy="datapoint-delete-btn"
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
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                data-cy="close-datapoint-dialog-btn"
                onClick={handleTooltipClose}
              >
                ✕
              </Button>
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
                        .sort((a, b) => (a.order || 0) - (b.order || 0))
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
                    <SelectTrigger data-cy="valueset-trigger">
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
                    value={activeDataPointValue}
                    onChange={(e) => setActiveDataPointValue(e.target.value)}
                    placeholder={dataPoint.value?.toString() ?? "Value"}
                  />
                  <div className="flex flex-row gap-1">
                    <div className="flex-grow"></div>
                    <Button
                      data-cy="verify-value-btn"
                      className="bg-green-800"
                      onClick={() => {
                        // verify the data point
                        updateDataPoint({
                          ...dataPoint,
                          value: activeDataPointValue,
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
