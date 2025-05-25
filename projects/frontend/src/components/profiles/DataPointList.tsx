import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdDownload, MdUpload } from "react-icons/md";
import { useLiveQuery } from "dexie-react-hooks";
import SortableDataPointCard from "./SortableDataPointCard";
import { useRef, useState } from "react";
import ProfileChatButton from "./profileChat/ProfileChatButton";
import ProfileChatView from "./profileChat/ProfileChatView";
import { Profile } from "@/lib/db/db";
import {
  deleteProfilePoint,
  deleteSegmentationProfilePoint,
} from "@/lib/db/crud";
import { TASK_MODE } from "@/app/constants";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { reorderPoint } from "@/lib/db/ordering";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical } from "lucide-react";
import { AddButton } from "@/components/AddButton";

export interface DataPointListProps<T> {
  activeProfile: Profile | undefined;
  activeDataPoint: T | undefined;
  setActiveDataPoint: (dataPoint: T | undefined) => void;
  setCreatingNewDataPoint: (creating: boolean) => void;
  readPointsByProfile: (profileId: string | undefined) => Promise<T[]>;
  createPoint: (point: any) => Promise<any>;
  "data-cy"?: string;
}

const DataPointList = <T extends { id: string; profileId: string }>(
  props: DataPointListProps<T>
) => {
  const {
    activeProfile,
    activeDataPoint,
    setActiveDataPoint,
    setCreatingNewDataPoint,
    readPointsByProfile,
    createPoint,
    "data-cy": dataCy,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const dataPoints = useLiveQuery(
    () => readPointsByProfile(activeProfile?.id),
    [activeProfile, readPointsByProfile]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px of movement before starting drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !dataPoints || !activeProfile) {
      return;
    }

    if (active.id !== over.id) {
      const oldIndex = dataPoints.findIndex((point) => point.id === active.id);
      const newIndex = dataPoints.findIndex((point) => point.id === over.id);

      // Get the points in their new positions
      const movedPoint = dataPoints[oldIndex];

      // Calculate the new position's neighbors
      let newPrevPoint = null;
      let newNextPoint = null;

      if (newIndex === 0) {
        // Moving to first position
        newNextPoint = dataPoints[0];
      } else if (newIndex === dataPoints.length - 1) {
        // Moving to last position
        newPrevPoint = dataPoints[dataPoints.length - 1];
      } else {
        // Moving to middle position
        if (oldIndex < newIndex) {
          // Moving down
          newPrevPoint = dataPoints[newIndex];
          newNextPoint =
            newIndex + 1 < dataPoints.length ? dataPoints[newIndex + 1] : null;
        } else {
          // Moving up
          newPrevPoint = newIndex > 0 ? dataPoints[newIndex - 1] : null;
          newNextPoint = dataPoints[newIndex];
        }
      }

      try {
        await reorderPoint(
          movedPoint,
          newPrevPoint,
          newNextPoint,
          activeProfile.mode === TASK_MODE.TEXT_SEGMENTATION
        );
      } catch (error) {
        console.error("Error reordering points:", error);
      }
    }
  };

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleDownloadDatapoints = () => {
    // remove ids from dataPoints
    if (!dataPoints) return;
    const data = JSON.stringify(
      dataPoints.map((dataPoint) => {
        const { id, profileId, ...rest } = dataPoint;
        return rest;
      })
    );

    // start download
    const element = document.createElement("a");
    const file = new Blob([data], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${activeProfile?.name}_data_points.json`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  const handleUploadDatapoints = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file && activeProfile) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const uploadDataPoints = JSON.parse(content);

          for (const dataPoint of uploadDataPoints) {
            await createPoint({
              ...dataPoint,
              profileId: activeProfile.id,
            });
          }
          alert("Data Points uploading successful!");
        } catch (error) {
          console.error("Error uploading data points: ", error);
          alert("Error uploading data points. Please check the file format");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDeleteDataPoint = async (id: string) => {
    if (!activeProfile) {
      return;
    }

    try {
      if (activeProfile.mode === TASK_MODE.TEXT_SEGMENTATION) {
        await deleteSegmentationProfilePoint(id);
      } else {
        await deleteProfilePoint(id);
      }

      if (activeDataPoint && activeDataPoint.id === id) {
        setActiveDataPoint(undefined);
      }
    } catch (error) {
      console.error("Error in handleDeleteDataPoint:", error);
    }
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <CardTitle>Data Points</CardTitle>
            {activeProfile && (
              <div className="flex flex-wrap gap-3 items-center">
                <AddButton
                  onClick={() => {
                    setActiveDataPoint(undefined);
                    setCreatingNewDataPoint(true);
                  }}
                  label="Data Point"
                  data-cy="new-datapoint-button"
                />
                <ProfileChatButton
                  onClick={() => setIsChatOpen(true)}
                  data-cy="profile-chat-button"
                />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      data-cy="more-options-button"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={handleUploadButtonClick}
                      data-cy="upload-datapoints-button"
                    >
                      <MdUpload className="mr-2 h-4 w-4" />
                      Upload
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDownloadDatapoints}
                      data-cy="download-datapoints-button"
                    >
                      <MdDownload className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".json"
                  onChange={handleUploadDatapoints}
                  data-cy="upload-datapoints-input"
                />
              </div>
            )}
          </div>
        </CardHeader>
        {dataPoints && (
          <CardContent
            className="flex flex-col gap-2"
            data-cy="datapoints-container"
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={dataPoints
                  .sort(
                    (a, b) => ((a as any).order || 0) - ((b as any).order || 0)
                  )
                  .map((point) => point.id)}
                strategy={verticalListSortingStrategy}
              >
                {dataPoints
                  .sort(
                    (a, b) => ((a as any).order || 0) - ((b as any).order || 0)
                  )
                  .map((dataPoint) => {
                    return (
                      <SortableDataPointCard
                        key={dataPoint.id}
                        dataPoint={dataPoint}
                        activeDataPoint={activeDataPoint}
                        setActiveDataPoint={setActiveDataPoint}
                        setCreatingNewDataPoint={setCreatingNewDataPoint}
                        deleteDataPoint={handleDeleteDataPoint}
                        data-cy="datapoint-card"
                      />
                    );
                  })}
              </SortableContext>
            </DndContext>
          </CardContent>
        )}
      </Card>
      <ProfileChatView
        isOpen={isChatOpen}
        setIsOpen={setIsChatOpen}
        activeProfile={activeProfile}
        data-cy="profile-chat-view"
      />
    </div>
  );
};

export default DataPointList;
