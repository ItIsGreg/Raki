import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TiEdit, TiDeleteOutline } from "react-icons/ti";
import { deleteDataset } from "@/lib/db/crud";
import { Dataset } from "@/lib/db/db";

interface DatasetCardProps {
  dataset: Dataset;
  activeDataset: Dataset | undefined;
  setActiveDataset: (dataset: Dataset) => void;
  setEditingDataset: (dataset: Dataset) => void;
}

const DatasetCard = (props: DatasetCardProps) => {
  const { dataset, activeDataset, setActiveDataset, setEditingDataset } = props;
  return (
    <Card
      key={dataset.id}
      className={`${
        activeDataset == dataset &&
        "bg-gray-100 shadow-lg border-black border-2"
      } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
      onClick={() => setActiveDataset(dataset)}
    >
      <CardHeader className="flex flex-row gap-3">
        <CardTitle>{dataset.name}</CardTitle>
        <div className="flex-grow"></div>
        <TiEdit
          className="hover:text-gray-500 cursor-pointer mr-2"
          size={24}
          onClick={(e) => {
            e.stopPropagation();
            setEditingDataset(dataset);
          }}
        />
        <TiDeleteOutline
          className="hover:text-red-500 cursor-pointer"
          size={24}
          onClick={(e) => {
            e.stopPropagation();
            deleteDataset(dataset.id);
          }}
        />
      </CardHeader>
      <CardContent>
        <CardDescription>{dataset.description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default DatasetCard;
