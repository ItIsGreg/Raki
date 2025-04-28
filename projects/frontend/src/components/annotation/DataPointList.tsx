import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveQuery } from "dexie-react-hooks";
import {
  deleteDataPoint,
  readDataPointsByAnnotatedText,
  updateDataPoint,
  deleteSegmentDataPoint,
  readSegmentDataPointsByAnnotatedText,
  updateSegmentDataPoint,
} from "@/lib/db/crud";
import { TiDeleteOutline } from "react-icons/ti";
import CompactCard from "@/components/CompactCard";
import { AnnotationDataPointListProps } from "@/app/types";
import { DataPoint, SegmentDataPoint, ProfilePoint } from "@/lib/db/db";
import { TASK_MODE, TaskMode } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { BugIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { FaCheck } from "react-icons/fa6";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useDataPointKeyboardNavigation } from "./hooks/useKeyboardNavigation";

type AnyDataPoint = DataPoint | SegmentDataPoint;

interface GenericDataPointListProps {
  activeAnnotatedDataset: any;
  activeDataPointId: string | undefined;
  setActiveAnnotatedDataset: (dataset: any) => void;
  setActiveDataPointId: (id: string | undefined) => void;
  activeAnnotatedText: any;
  mode: TaskMode;
  isDatasetListOpen: boolean;
  activeProfilePoints?: ProfilePoint[];
}

const DataPointList = (props: GenericDataPointListProps) => {
  const {
    activeAnnotatedDataset,
    activeDataPointId,
    setActiveAnnotatedDataset,
    setActiveDataPointId,
    activeAnnotatedText,
    mode,
    isDatasetListOpen,
    activeProfilePoints,
  } = props;

  const [editingValue, setEditingValue] = useState<string>("");
  const [editingDataPointId, setEditingDataPointId] = useState<
    string | undefined
  >(undefined);
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const dataPoints = useLiveQuery<AnyDataPoint[]>(() => {
    if (mode === TASK_MODE.DATAPOINT_EXTRACTION) {
      return readDataPointsByAnnotatedText(activeAnnotatedText?.id);
    } else {
      return readSegmentDataPointsByAnnotatedText(activeAnnotatedText?.id);
    }
  }, [activeAnnotatedText, mode])?.sort((a, b) => {
    if (mode === TASK_MODE.DATAPOINT_EXTRACTION) {
      const dpA = a as DataPoint;
      const dpB = b as DataPoint;
      if (dpA.match && dpB.match) {
        return dpA.match[0] - dpB.match[0];
      } else if (dpA.match) {
        return -1;
      } else if (dpB.match) {
        return 1;
      }
    } else {
      const dpA = a as SegmentDataPoint;
      const dpB = b as SegmentDataPoint;
      if (dpA.beginMatch && dpB.beginMatch) {
        return dpA.beginMatch[0] - dpB.beginMatch[0];
      } else if (dpA.beginMatch) {
        return -1;
      } else if (dpB.beginMatch) {
        return 1;
      }
    }
    return 0;
  });

  const handleDelete = (dataPoint: AnyDataPoint, e: React.MouseEvent) => {
    e.stopPropagation();
    if (mode === TASK_MODE.DATAPOINT_EXTRACTION && "match" in dataPoint) {
      if (!dataPoint.profilePointId) {
        deleteDataPoint(dataPoint.id);
      } else {
        updateDataPoint({
          ...dataPoint,
          match: undefined,
          value: undefined,
        });
      }
    } else if (
      mode === TASK_MODE.TEXT_SEGMENTATION &&
      "beginMatch" in dataPoint
    ) {
      if (!dataPoint.profilePointId) {
        deleteSegmentDataPoint(dataPoint.id);
      } else {
        updateSegmentDataPoint({
          ...dataPoint,
          beginMatch: undefined,
          endMatch: undefined,
        });
      }
    }
  };

  const getCardClassName = (dataPoint: AnyDataPoint) => {
    if (mode === TASK_MODE.DATAPOINT_EXTRACTION && "match" in dataPoint) {
      return `
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
      `;
    } else if (
      mode === TASK_MODE.TEXT_SEGMENTATION &&
      "beginMatch" in dataPoint
    ) {
      return `
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
        ${!dataPoint.beginMatch && !dataPoint.endMatch ? "text-gray-400" : ""}
      `;
    }
    return "";
  };

  const handleValueEdit = (dataPoint: AnyDataPoint) => {
    if (mode === TASK_MODE.DATAPOINT_EXTRACTION && "match" in dataPoint) {
      const activeProfilePoint = getActiveProfilePoint(dataPoint);
      if (activeProfilePoint?.datatype !== "valueset") {
        setEditingValue(dataPoint.value?.toString() || "");
        setEditingDataPointId(dataPoint.id);
      }
    }
  };

  const handleValueChange = (dataPoint: AnyDataPoint, value: string) => {
    if (mode === TASK_MODE.DATAPOINT_EXTRACTION && "match" in dataPoint) {
      updateDataPoint({
        ...dataPoint,
        value: value,
        verified: true,
      });
    }
  };

  const handleValuesetUpdate = (dataPoint: AnyDataPoint, value: string) => {
    if (mode === TASK_MODE.DATAPOINT_EXTRACTION && "match" in dataPoint) {
      updateDataPoint({
        ...dataPoint,
        value: value,
        verified: true,
      });
    }
  };

  const getActiveProfilePoint = (dataPoint: AnyDataPoint) => {
    if (mode === TASK_MODE.DATAPOINT_EXTRACTION && "match" in dataPoint) {
      return activeProfilePoints?.find(
        (profilePoint) => profilePoint.id === dataPoint.profilePointId
      );
    }
    return undefined;
  };

  const handleDataPointClick = (dataPointId: string) => {
    setActiveDataPointId(dataPointId);
    // Start editing the value immediately
    const dataPoint = dataPoints?.find((dp) => dp.id === dataPointId);
    if (
      dataPoint &&
      mode === TASK_MODE.DATAPOINT_EXTRACTION &&
      "match" in dataPoint
    ) {
      const activeProfilePoint = getActiveProfilePoint(dataPoint);
      if (activeProfilePoint?.datatype !== "valueset") {
        setEditingValue(dataPoint.value?.toString() || "");
        setEditingDataPointId(dataPointId);
      }
    }
  };

  useDataPointKeyboardNavigation({
    dataPoints,
    activeDataPoint: dataPoints?.find((dp) => dp.id === activeDataPointId),
    setActiveDataPointId,
    activeDataPointValue: editingValue,
    setActiveDataPointValue: setEditingValue,
    activeTooltipId: undefined,
    setActiveTooltipId: () => {},
    mode,
    activeProfilePoints,
    setEditingValue,
    setEditingDataPointId,
    isSelectOpen,
  });

  // Focus the input field when editingDataPointId changes
  useEffect(() => {
    if (editingDataPointId) {
      const input = document.querySelector(
        `[data-cy="value-input"]`
      ) as HTMLInputElement;
      if (input) {
        input.focus();
      }
    }
  }, [editingDataPointId]);

  return (
    <div
      className={`overflow-y-scroll ${
        isDatasetListOpen ? "col-span-1" : "col-span-2"
      }`}
      data-cy="datapoint-list-container"
    >
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle data-cy="datapoint-list-title">
            {mode === TASK_MODE.DATAPOINT_EXTRACTION
              ? "Datapoints"
              : "Segments"}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              console.log("Current Datapoints:", {
                dataPoints,
              });
            }}
            data-cy="debug-datapoints"
          >
            <BugIcon className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent
          className="flex flex-col gap-1"
          data-cy="datapoint-list-content"
        >
          {dataPoints?.map((dataPoint) => {
            const value =
              mode === TASK_MODE.DATAPOINT_EXTRACTION
                ? (dataPoint as DataPoint).value?.toString()
                : undefined;
            const activeProfilePoint = getActiveProfilePoint(dataPoint);

            return (
              <CompactCard
                key={dataPoint.id}
                data-cy={`datapoint-card-${dataPoint.id}`}
                title={
                  <div className="flex items-center gap-2 w-full">
                    {mode === TASK_MODE.DATAPOINT_EXTRACTION && (
                      <div className="w-24 flex-shrink-0">
                        {activeProfilePoint?.datatype === "valueset" ? (
                          <Select
                            value={value}
                            onValueChange={(value) =>
                              handleValuesetUpdate(dataPoint, value)
                            }
                            onOpenChange={setIsSelectOpen}
                            data-cy="valueset-select"
                          >
                            <SelectTrigger className="h-6 text-sm">
                              {value || "Select value"}
                            </SelectTrigger>
                            <SelectContent>
                              {activeProfilePoint.valueset?.map((value) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : editingDataPointId === dataPoint.id ? (
                          <Input
                            value={editingValue}
                            onChange={(e) => {
                              setEditingValue(e.target.value);
                              handleValueChange(dataPoint, e.target.value);
                            }}
                            className="h-6 text-sm"
                            data-cy="value-input"
                            onBlur={() => setEditingDataPointId(undefined)}
                            autoFocus
                          />
                        ) : (
                          <span
                            className="text-sm text-gray-500 truncate block cursor-pointer hover:text-gray-700"
                            onClick={() => handleValueEdit(dataPoint)}
                            data-cy="value-display"
                          >
                            {value}
                          </span>
                        )}
                      </div>
                    )}
                    <span className="truncate flex-1">{dataPoint.name}</span>
                  </div>
                }
                onClick={() => handleDataPointClick(dataPoint.id)}
                isActive={activeDataPointId === dataPoint.id}
                tooltipContent={dataPoint.name}
                className={getCardClassName(dataPoint)}
                rightIcon={
                  <TiDeleteOutline
                    className="hover:text-red-500 cursor-pointer"
                    data-cy={`datapoint-delete-${dataPoint.id}`}
                    size={20}
                    onClick={(e) => handleDelete(dataPoint, e)}
                  />
                }
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DataPointList;
