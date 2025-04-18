import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createDataset,
  readDatasetsByMode,
  updateDataset,
} from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { DatasetListProps } from "../../app/types";
import EntityForm from "@/components/EntityForm";
import { Dataset } from "@/lib/db/db";
import DatasetCard from "./DatasetCard";
import { AddButton } from "@/components/AddButton";

const DatasetList = (props: DatasetListProps) => {
  const { activeDataset, setActiveDataset, mode } = props;

  const [addingDataset, setAddingDataset] = useState(false);
  const [editingDataset, setEditingDataset] = useState<Dataset | undefined>(
    undefined
  );

  const dbDatasets = useLiveQuery(() => readDatasetsByMode(mode), [mode]);

  const handleCancelAddDataset = () => {
    setAddingDataset(false);
  };

  const handleSaveDataset = (dataset: Dataset) => {
    const datasetWithMode = { ...dataset, mode };

    if (datasetWithMode.id) {
      updateDataset(datasetWithMode);
    } else {
      createDataset(datasetWithMode);
    }
    setAddingDataset(false);
    setEditingDataset(undefined);
  };

  return (
    <div className="overflow-y-scroll" data-cy="dataset-list-container">
      <Card>
        <CardHeader className="flex flex-row">
          <CardTitle>Datasets</CardTitle>
          <div className="flex-grow"></div>
          <AddButton
            onClick={() => setAddingDataset(true)}
            label="Dataset"
            data-cy="add-dataset-button"
          />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {addingDataset && (
            <EntityForm<Dataset>
              onCancel={handleCancelAddDataset}
              onSave={handleSaveDataset}
              entityType="Dataset"
              data-cy="new-dataset-form"
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
                  data-cy="edit-dataset-form"
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
                data-cy="dataset-card"
              />
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default DatasetList;
