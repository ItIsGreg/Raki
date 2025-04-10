import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MdDownload, MdUpload } from "react-icons/md";
import { useLiveQuery } from "dexie-react-hooks";
import DataPointCard from "./DataPointCard";
import { useRef, useState } from "react";
import ProfileChatButton from "./profileChat/ProfileChatButton";
import ProfileChatView from "./profileChat/ProfileChatView";
import { Profile } from "@/lib/db/db";
import {
  deleteProfilePoint,
  deleteSegmentationProfilePoint,
} from "@/lib/db/crud";
import { TASK_MODE } from "@/app/constants";

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
    if (!activeProfile) return;

    if (activeProfile.mode === TASK_MODE.TEXT_SEGMENTATION) {
      await deleteSegmentationProfilePoint(id);
    } else {
      await deleteProfilePoint(id);
    }

    if (activeDataPoint && activeDataPoint.id === id) {
      setActiveDataPoint(undefined);
    }
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Data Points</CardTitle>
          <div className="flex-grow"></div>
          {activeProfile && (
            <div className="flex flex-row gap-3 justify-center items-center">
              <MdUpload
                size={26}
                className="hover:text-blue-500 cursor-pointer"
                onClick={handleUploadButtonClick}
                data-cy="upload-datapoints-button"
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleUploadDatapoints}
                data-cy="upload-datapoints-input"
              />
              <MdDownload
                size={26}
                className="hover:text-blue-500 cursor-pointer"
                onClick={handleDownloadDatapoints}
                data-cy="download-datapoints-button"
              />
              <ProfileChatButton
                onClick={() => setIsChatOpen(true)}
                data-cy="profile-chat-button"
              />
              <Button
                onClick={() => {
                  setActiveDataPoint(undefined);
                  setCreatingNewDataPoint(true);
                }}
                data-cy="new-datapoint-button"
              >
                New
              </Button>
            </div>
          )}
        </CardHeader>
        {dataPoints && (
          <CardContent
            className="flex flex-col gap-2"
            data-cy="datapoints-container"
          >
            {dataPoints.map((dataPoint) => {
              return (
                <DataPointCard
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
