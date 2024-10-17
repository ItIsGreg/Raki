import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDatasetForm } from "./AddDatasetForm";
import { ApiKeyInput } from "./ApiKeyInput";
import { BatchSizeInput } from "./BatchSizeInput";
import { AnnotatedDatasetCard } from "./AnnotatedDatasetCard";
import { useAnnotationState } from "./hooks/useAnnotationState";
import { AnnotatedDatasetListProps } from "@/app/types";
import EntityForm from "@/components/EntityForm";
import { AnnotatedDataset } from "@/lib/db/db";
import { updateAnnotatedDataset } from "@/lib/db/crud";
import { UploadDatasetButton } from "./UploadDatasetButton";
import { AddButton } from "@/components/AddButton";

const AnnotatedDatasetList = (props: AnnotatedDatasetListProps) => {
  const {
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
  } = props;
  const [batchSize, setBatchSize] = useState<number>(10);

  const {
    addingDataset,
    setAddingDataset,
    isRunning,
    dbAnnotatedDatasets,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
  } = useAnnotationState({
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
    batchSize,
  });

  const [editingDataset, setEditingDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);

  const handleSaveDataset = (dataset: AnnotatedDataset) => {
    updateAnnotatedDataset(dataset);
    setEditingDataset(undefined);
  };

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle>Annotated Datasets</CardTitle>
          <div className="flex-grow"></div>
          <ApiKeyInput />
          <div className="w-4"></div> {/* Add a small gap */}
          <BatchSizeInput batchSize={batchSize} setBatchSize={setBatchSize} />
          <div className="flex-grow"></div>
          <AddButton onClick={() => setAddingDataset(true)} label="Dataset" />
          <div className="w-2"></div> {/* Add a small gap */}
          <UploadDatasetButton />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {addingDataset && (
            <AddDatasetForm onClose={() => setAddingDataset(false)} />
          )}

          {editingDataset && (
            <EntityForm<AnnotatedDataset>
              onCancel={() => setEditingDataset(undefined)}
              onSave={handleSaveDataset}
              existingEntity={editingDataset}
              entityType="Annotated Dataset"
            />
          )}

          {dbAnnotatedDatasets?.map((dataset) =>
            editingDataset && editingDataset.id === dataset.id ? (
              <EntityForm<AnnotatedDataset>
                key={dataset.id}
                onCancel={() => setEditingDataset(undefined)}
                onSave={handleSaveDataset}
                existingEntity={editingDataset}
                entityType="Annotated Dataset"
              />
            ) : (
              <AnnotatedDatasetCard
                key={dataset.id}
                dataset={dataset}
                isActive={activeAnnotatedDataset === dataset}
                isRunning={isRunning}
                onSelect={() => {
                  identifyActiveProfilePoints(dataset.profileId);
                  setActiveAnnotatedDataset(dataset);
                }}
                onStart={() => {
                  identifyActiveProfilePoints(dataset.profileId);
                  setActiveAnnotatedDataset(dataset);
                  handleStart();
                }}
                onStop={handleStop}
                onEdit={() => setEditingDataset(dataset)}
              />
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotatedDatasetList;
