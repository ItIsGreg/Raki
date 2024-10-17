import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createDataset,
  deleteDataset,
  readAllDatasets,
  updateDataset,
} from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { DatasetListProps } from "../../types";
import EntityForm from "@/components/EntityForm";
import { Dataset } from "@/lib/db/db";
import DatasetCard from "./DatasetCard";

const DatasetList = (props: DatasetListProps) => {
  const { activeDataset, setActiveDataset } = props;

  const [addingDataset, setAddingDataset] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | undefined>(
    undefined
  );

  const dbDatasets = useLiveQuery(() => readAllDatasets());

  const handleCancelAddDataset = () => {
    setAddingDataset(false);
  };

  const handleSaveDataset = (dataset: Dataset) => {
    if (dataset.id) {
      updateDataset(dataset);
    } else {
      createDataset(dataset);
    }
    setAddingDataset(false);
    setEditingDataset(undefined);
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Datasets</CardTitle>
          <div className="flex-grow"></div>
          <Button onClick={() => setAddingDataset(true)}>New Dataset</Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {addingDataset && (
            <EntityForm<Dataset>
              onCancel={handleCancelAddDataset}
              onSave={handleSaveDataset}
              entityType="Dataset"
            />
          )}

          {dbDatasets?.map((dataset) => {
            if (editingDataset && editingDataset.id === dataset.id) {
              return (
                <EntityForm<Dataset>
                  key={dataset.id}
                  onCancel={() => setEditingDataset(undefined)}
                  onSave={handleSaveDataset}
                  existingEntity={editingDataset}
                  entityType="Dataset"
                />
              );
            }
            return (
              <DatasetCard
                key={dataset.id}
                dataset={dataset}
                activeDataset={activeDataset}
                setActiveDataset={setActiveDataset}
                setEditingDataset={setEditingDataset}
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetList;
