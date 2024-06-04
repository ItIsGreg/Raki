import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataPointListProps } from "../types";
import { useLiveQuery } from "dexie-react-hooks";
import { deleteProfilePoint, readProfilePointsByProfile } from "@/lib/db/crud";
import { TiDeleteOutline } from "react-icons/ti";

const DataPointList = (props: DataPointListProps) => {
  const { activeProfile, setActiveDataPoint, setCreatingNewDataPoint } = props;
  const dataPoints = useLiveQuery(
    () => readProfilePointsByProfile(activeProfile?.id),
    [activeProfile]
  );

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Data Points</CardTitle>
          <div className="flex-grow"></div>
          {activeProfile && (
            <Button
              onClick={() => {
                setActiveDataPoint(undefined);
                setCreatingNewDataPoint(true);
              }}
            >
              New
            </Button>
          )}
        </CardHeader>
        {dataPoints && (
          <CardContent className="flex flex-col gap-2">
            {dataPoints.map((dataPoint) => {
              return (
                <Card
                  key={dataPoint.id}
                  className="transition-transform hover:bg-gray-100 hover:shadow-lg hover:scale-105 transform"
                  onClick={() => {
                    setActiveDataPoint(dataPoint);
                    setCreatingNewDataPoint(false);
                  }}
                >
                  <CardHeader className="flex flex-row">
                    <CardTitle>{dataPoint.name}</CardTitle>
                    <div className="flex-grow"></div>
                    <TiDeleteOutline
                      className="hover:text-red-500 cursor-pointer"
                      size={24}
                      onClick={() => {
                        deleteProfilePoint(dataPoint.id);
                      }}
                    />
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{dataPoint.explanation}</CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default DataPointList;
