import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MdDownload, MdUpload } from "react-icons/md";
import { DataPointListProps } from "../../types";
import { useLiveQuery } from "dexie-react-hooks";
import {
  createProfile,
  createProfilePoint,
  readProfilePointsByProfile,
} from "@/lib/db/crud";
import DataPointCard from "./DataPointCard";
import { useRef } from "react";

const DataPointList = (props: DataPointListProps) => {
  const {
    activeProfile,
    activeDataPoint,
    setActiveDataPoint,
    setCreatingNewDataPoint,
  } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataPoints = useLiveQuery(
    () => readProfilePointsByProfile(activeProfile?.id),
    [activeProfile]
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
            await createProfilePoint({
              ...dataPoint,
              profileId: activeProfile.id,
            });
          }
          alert("Data Points uploading successfull!");
        } catch (error) {
          console.error("Error uploading data points: ", error);
          alert("Error uploading data points. Please check the file format");
        }
      };
      reader.readAsText(file);
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
              />
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleUploadDatapoints}
              />
              <MdDownload
                size={26}
                className="hover:text-blue-500 cursor-pointer"
                onClick={handleDownloadDatapoints}
              />
              <Button
                onClick={() => {
                  setActiveDataPoint(undefined);
                  setCreatingNewDataPoint(true);
                }}
              >
                New
              </Button>
            </div>
          )}
        </CardHeader>
        {dataPoints && (
          <CardContent className="flex flex-col gap-2">
            {dataPoints.map((dataPoint) => {
              return (
                <DataPointCard
                  key={dataPoint.id}
                  dataPoint={dataPoint}
                  activeDataPoint={activeDataPoint}
                  setActiveDataPoint={setActiveDataPoint}
                  setCreatingNewDataPoint={setCreatingNewDataPoint}
                />
              );
            })}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DataPointList;
