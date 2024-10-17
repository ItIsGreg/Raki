import { useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { handleUploadAnnotatedDataset } from "./annotationUtils";
import { AddDatasetForm } from "./AddDatasetForm";
import { ApiKeyInput } from "./ApiKeyInput";
import { AnnotatedDatasetCard } from "./AnnotatedDatasetCard";
import { useAnnotationState } from "./hooks/useAnnotationState";
import { AnnotatedDatasetListProps } from "@/app/types";
import EntityForm from "@/components/EntityForm";
import { AnnotatedDataset } from "@/lib/db/db";
import { updateAnnotatedDataset } from "@/lib/db/crud";

const AnnotatedDatasetList = (props: AnnotatedDatasetListProps) => {
  const {
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
  } = props;

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
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await handleUploadAnnotatedDataset(file);
      // You might want to refresh the list of annotated datasets here
    } catch (error) {
      console.error("Error uploading annotated dataset:", error);
      // You might want to show an error message to the user here
    }
  };

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
        <CardHeader className="flex flex-row">
          <CardTitle>Annotated Datasets</CardTitle>
          <div className="flex-grow"></div>
          <ApiKeyInput />
          <div className="flex-grow"></div>
          <Button onClick={() => setAddingDataset(true)}>New Dataset</Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".json"
            onChange={handleFileUpload}
          />
          <Button onClick={handleUploadButtonClick}>Upload Dataset</Button>
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
