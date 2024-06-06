import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MdDownload } from "react-icons/md";
import { DataPointListProps } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import { readProfilePointsByProfile } from "@/lib/db/crud";
import DataPointCard from "./DataPointCard";

const DataPointList = (props: DataPointListProps) => {
  const {
    activeProfile,
    activeDataPoint,
    setActiveDataPoint,
    setCreatingNewDataPoint,
  } = props;
  const dataPoints = useLiveQuery(
    () => readProfilePointsByProfile(activeProfile?.id),
    [activeProfile]
  );

  const handleDownloadDatapoints = () => {
    console.log("Download");
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

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Data Points</CardTitle>
          <div className="flex-grow"></div>
          {activeProfile && (
            <div className="flex flex-row gap-3 justify-center items-center">
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
