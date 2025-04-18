import { TiDeleteOutline } from "react-icons/ti";
import CompactCard from "@/components/CompactCard";

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

  const handleClick = () => {
    setActiveDataPoint(dataPoint);
    setCreatingNewDataPoint(false);
  };

  return (
    <CompactCard
      key={dataPoint.id}
      title={(dataPoint as any).name || "Unnamed"}
      isActive={activeDataPoint?.id === dataPoint.id}
      tooltipContent={(dataPoint as any).name || "Unnamed"}
      onClick={handleClick}
      rightIcon={
        <TiDeleteOutline
          className="delete-button hover:text-red-500 cursor-pointer"
          size={20}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteDataPoint(dataPoint.id).catch((error) => {
              console.error("Error deleting data point:", error);
            });
          }}
        />
      }
      data-cy={dataCy}
    />
  );
};

export default DataPointCard;
