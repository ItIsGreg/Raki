import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDatasetForm } from "./AddDatasetForm";
import { AnnotatedDatasetCard } from "./AnnotatedDatasetCard";
import { useAnnotationState } from "./hooks/useAnnotationState";
import { AnnotatedDatasetListProps, LLMProvider } from "@/app/types";
import EntityForm from "@/components/EntityForm";
import { AnnotatedDataset } from "@/lib/db/db";
import { updateAnnotatedDataset } from "@/lib/db/crud";
import { UploadDatasetButton } from "./UploadDatasetButton";
import { AddButton } from "@/components/AddButton";
import SettingsMenu from "../llmSettings/SettingsMenu";
import SettingsButton from "../llmSettings/SettingsButton";

const AnnotatedDatasetList = (props: AnnotatedDatasetListProps) => {
  const {
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
  } = props;
  const [autoRerunFaulty, setAutoRerunFaulty] = useState<boolean>(true);
  const {
    addingDataset,
    setAddingDataset,
    annotationState,
    dbAnnotatedDatasets,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
  } = useAnnotationState({
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
    autoRerunFaulty,
  });

  const [editingDataset, setEditingDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);

  const handleSaveDataset = (dataset: AnnotatedDataset) => {
    updateAnnotatedDataset(dataset);
    setEditingDataset(undefined);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="overflow-y-scroll" data-cy="ai-annotate-datasets-container">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle>Annotated Datasets</CardTitle>
          <div className="flex-grow"></div>
          <SettingsButton
            data-cy="ai-annotate-settings-button"
            onClick={() => setIsSettingsOpen(true)}
          />
          <div className="w-4"></div>
          <AddButton
            data-cy="ai-annotate-add-dataset-button"
            onClick={() => setAddingDataset(true)}
            label="Dataset"
          />
          <div className="w-2"></div>
          <UploadDatasetButton data-cy="ai-annotate-upload-dataset-button" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {addingDataset && (
            <AddDatasetForm
              data-cy="ai-annotate-add-dataset-form"
              onClose={() => setAddingDataset(false)}
            />
          )}

          {editingDataset && (
            <EntityForm<AnnotatedDataset>
              data-cy="ai-annotate-edit-dataset-form"
              onCancel={() => setEditingDataset(undefined)}
              onSave={handleSaveDataset}
              existingEntity={editingDataset}
              entityType="Annotated Dataset"
            />
          )}

          <div data-cy="ai-annotate-datasets-list">
            {dbAnnotatedDatasets?.map((dataset) =>
              editingDataset && editingDataset.id === dataset.id ? (
                <EntityForm<AnnotatedDataset>
                  key={dataset.id}
                  data-cy="ai-annotate-edit-dataset-form"
                  onCancel={() => setEditingDataset(undefined)}
                  onSave={handleSaveDataset}
                  existingEntity={editingDataset}
                  entityType="Annotated Dataset"
                />
              ) : (
                <AnnotatedDatasetCard
                  key={dataset.id}
                  data-cy="ai-annotate-dataset-card"
                  dataset={dataset}
                  isActive={activeAnnotatedDataset === dataset}
                  annotationState={annotationState}
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
          </div>
        </CardContent>
      </Card>
      <SettingsMenu
        data-cy="ai-annotate-settings-menu"
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        autoRerunFaulty={autoRerunFaulty}
        setAutoRerunFaulty={setAutoRerunFaulty}
      />
    </div>
  );
};

export default AnnotatedDatasetList;
