import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddDatasetForm } from "./AddDatasetForm";
import { AnnotatedDatasetCard } from "./AnnotatedDatasetCard";
import { useAnnotationState } from "./hooks/useAnnotationState";
import EntityForm from "@/components/EntityForm";
import {
  AnnotatedDataset,
  ProfilePoint,
  SegmentationProfilePoint,
} from "@/lib/db/db";
import { updateAnnotatedDataset } from "@/lib/db/crud";
import { UploadDatasetButton } from "./UploadDatasetButton";
import { AddButton } from "@/components/AddButton";
import SettingsMenu from "../llmSettings/SettingsMenu";
import SettingsButton from "../llmSettings/SettingsButton";
import { TaskMode } from "@/app/constants";

// Update the props interface to include the mode and make it generic
interface AnnotatedDatasetListProps<
  T extends ProfilePoint | SegmentationProfilePoint
> {
  activeAnnotatedDataset: AnnotatedDataset | null;
  activeProfilePoints: T[];
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | null) => void;
  setActiveProfilePoints: (points: T[]) => void;
  mode: TaskMode;
}

const AnnotatedDatasetList = <
  T extends ProfilePoint | SegmentationProfilePoint
>(
  props: AnnotatedDatasetListProps<T>
) => {
  const {
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
    mode,
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
  } = useAnnotationState<T>({
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
    autoRerunFaulty,
    mode,
  });

  const [editingDataset, setEditingDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);

  const handleSaveDataset = (dataset: AnnotatedDataset) => {
    updateAnnotatedDataset(dataset);
    setEditingDataset(undefined);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Filter annotated datasets based on mode
  const filteredDatasets = dbAnnotatedDatasets?.filter(
    (dataset) => dataset.mode === mode
  );

  return (
    <div className="overflow-y-scroll" data-cy="ai-annotate-datasets-container">
      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle>
            {mode === "datapoint_extraction"
              ? "Annotated Datasets"
              : "Segmentation Datasets"}
          </CardTitle>
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
              mode={mode}
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
            {filteredDatasets?.map((dataset) =>
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
                <AnnotatedDatasetCard<T>
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
                  mode={mode}
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
