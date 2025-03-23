import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteProfilePoint } from "@/lib/db/crud";
import { TiDeleteOutline } from "react-icons/ti";
import { DataPointCardProps } from "@/app/types";

const DataPointCard = (props: DataPointCardProps) => {
  const {
    dataPoint,
    activeDataPoint,
    setActiveDataPoint,
    setCreatingNewDataPoint,
    "data-cy": dataCy,
  } = props;
  return (
    <Card
      key={dataPoint.id}
      className={`${
        activeDataPoint == dataPoint &&
        "bg-gray-100 shadow-lg border-black border-2"
      } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
      onClick={() => {
        setActiveDataPoint(dataPoint);
        setCreatingNewDataPoint(false);
      }}
      data-cy={dataCy}
    >
      <CardHeader className="flex flex-row">
        <CardTitle className="truncate">{dataPoint.name}</CardTitle>
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
};

export default DataPointCard;
