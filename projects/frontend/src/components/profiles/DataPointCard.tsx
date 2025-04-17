import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TiDeleteOutline } from "react-icons/ti";

export interface GenericDataPointCardProps<T> {
  dataPoint: T;
  activeDataPoint: T | undefined;
  setActiveDataPoint: (dataPoint: T | undefined) => void;
  setCreatingNewDataPoint: (creating: boolean) => void;
  deleteDataPoint: (id: string) => Promise<void>;
  "data-cy"?: string;
}

const DataPointCard = <T extends { id: string }>(
  props: GenericDataPointCardProps<T>
) => {
  const {
    dataPoint,
    activeDataPoint,
    setActiveDataPoint,
    setCreatingNewDataPoint,
    deleteDataPoint,
    "data-cy": dataCy,
  } = props;

  return (
    <Card
      key={dataPoint.id}
      className={`${
        activeDataPoint?.id === dataPoint.id &&
        "bg-gray-100 shadow-lg border-black border-2"
      } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
      onClick={(e) => {
        if (!(e.target as HTMLElement).closest(".delete-button")) {
          setActiveDataPoint(dataPoint);
          setCreatingNewDataPoint(false);
        }
      }}
      data-cy={dataCy}
    >
      <CardHeader className="flex flex-row">
        <CardTitle className="truncate">
          {(dataPoint as any).name || "Unnamed"}
        </CardTitle>
        <div className="flex-grow"></div>
        <TiDeleteOutline
          className="delete-button hover:text-red-500 cursor-pointer"
          size={24}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteDataPoint(dataPoint.id).catch((error) => {
              console.error("Error deleting data point:", error);
            });
          }}
        />
      </CardHeader>
      <CardContent>
        <CardDescription>
          {(dataPoint as any).explanation || ""}
        </CardDescription>
      </CardContent>
    </Card>
  );
};

export default DataPointCard;
