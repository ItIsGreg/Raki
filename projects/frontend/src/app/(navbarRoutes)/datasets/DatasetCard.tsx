import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { deleteDataset } from "@/lib/db/crud";
import { Dataset } from "@/lib/db/db";
import DeleteButton from "@/components/DeleteButton";
import EditButton from "@/components/EditButton";

interface DatasetCardProps {
  dataset: Dataset;
  activeDataset: Dataset | undefined;
  setActiveDataset: (dataset: Dataset) => void;
  setEditingDataset: (dataset: Dataset) => void;
  "data-cy": string;
}

const DatasetCard = (props: DatasetCardProps) => {
  const {
    dataset,
    activeDataset,
    setActiveDataset,
    setEditingDataset,
    "data-cy": dataCy,
  } = props;

  return (
    <Card
      key={dataset.id}
      className={`${
        activeDataset == dataset &&
        "bg-gray-100 shadow-lg border-black border-2"
      } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
      onClick={() => setActiveDataset(dataset)}
      data-cy={dataCy}
    >
      <CardHeader className="flex flex-row gap-3">
        <CardTitle className="truncate">{dataset.name}</CardTitle>
        <div className="flex-grow"></div>
        <EditButton
          onClick={(e) => {
            e.stopPropagation();
            setEditingDataset(dataset);
          }}
          data-cy="edit-dataset-button"
        />
        <DeleteButton
          onDelete={() => deleteDataset(dataset.id)}
          itemName="dataset"
          data-cy="delete-dataset-button"
        />
      </CardHeader>
      <CardContent>
        <CardDescription>{dataset.description}</CardDescription>
      </CardContent>
    </Card>
  );
};

export default DatasetCard;
