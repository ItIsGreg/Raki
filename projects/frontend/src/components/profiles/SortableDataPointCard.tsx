import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DataPointCard from "./DataPointCard";
import { useEffect } from "react";

interface SortableDataPointCardProps<T> {
  dataPoint: T;
  activeDataPoint: T | undefined;
  setActiveDataPoint: (dataPoint: T | undefined) => void;
  setCreatingNewDataPoint: (creating: boolean) => void;
  deleteDataPoint: (id: string) => Promise<void>;
  "data-cy"?: string;
}

const SortableDataPointCard = <T extends { id: string }>(
  props: SortableDataPointCardProps<T>
) => {
  const {
    dataPoint,
    activeDataPoint,
    setActiveDataPoint,
    setCreatingNewDataPoint,
    deleteDataPoint,
    "data-cy": dataCy,
  } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dataPoint.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <DataPointCard
        dataPoint={dataPoint}
        activeDataPoint={activeDataPoint}
        setActiveDataPoint={setActiveDataPoint}
        setCreatingNewDataPoint={setCreatingNewDataPoint}
        deleteDataPoint={deleteDataPoint}
        data-cy={dataCy}
      />
    </div>
  );
};

export default SortableDataPointCard;
