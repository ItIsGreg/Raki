import { useState, useEffect, useRef } from "react";
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
import {
  updateAnnotatedDataset,
  readAllAnnotatedDatasets,
} from "@/lib/db/crud";
import { UploadDatasetButton } from "./UploadDatasetButton";
import { AddButton } from "@/components/AddButton";
import SettingsMenu from "../llmSettings/SettingsMenu";
import SettingsButton from "../llmSettings/SettingsButton";
import { TaskMode } from "@/app/constants";
import { useLiveQuery } from "dexie-react-hooks";

// Update the props interface to include the mode and make it generic
interface AnnotatedDatasetListProps<
  T extends ProfilePoint | SegmentationProfilePoint
> {
  activeAnnotatedDataset: AnnotatedDataset | null;
  activeProfilePoints: T[];
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | null) => void;
  setActiveProfilePoints: (points: T[]) => void;
  mode: TaskMode;
  addingDataset: boolean;
  setAddingDataset: (adding: boolean) => void;
  annotationState: "idle" | "regular" | "faulty";
  handleStart: () => void;
  handleStop: () => void;
  identifyActiveProfilePoints: (profileId: string) => void;
  isOpen: boolean;
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
    addingDataset,
    setAddingDataset,
    annotationState,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
    isOpen,
  } = props;

  const [editingDataset, setEditingDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);
  const activeDatasetRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  const handleSaveDataset = (dataset: AnnotatedDataset) => {
    updateAnnotatedDataset(dataset);
    setEditingDataset(undefined);
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [autoRerunFaulty, setAutoRerunFaulty] = useState<boolean>(true);

  // Get annotated datasets from the database
  const dbAnnotatedDatasets = useLiveQuery(() => readAllAnnotatedDatasets());

  // Filter annotated datasets based on mode
  const filteredDatasets = dbAnnotatedDatasets?.filter(
    (dataset) => dataset.mode === mode
  );

  // Scroll active dataset into view when sheet opens or active dataset changes
  useEffect(() => {
    if (activeAnnotatedDataset && isOpen) {
      // Reset the scroll state when the sheet opens
      hasScrolledRef.current = false;

      // Use a small delay to ensure the DOM is ready after sheet opens
      const timeoutId = setTimeout(() => {
        if (activeDatasetRef.current) {
          activeDatasetRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          hasScrolledRef.current = true;
        } else {
          // If ref is still not available, try again after a longer delay
          setTimeout(() => {
            if (activeDatasetRef.current) {
              activeDatasetRef.current.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              hasScrolledRef.current = true;
            }
          }, 500);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [activeAnnotatedDataset, isOpen]);

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
            {filteredDatasets?.map((dataset) => {
              const isActive = activeAnnotatedDataset?.id === dataset.id;

              return editingDataset && editingDataset.id === dataset.id ? (
                <EntityForm<AnnotatedDataset>
                  key={dataset.id}
                  data-cy="ai-annotate-edit-dataset-form"
                  onCancel={() => setEditingDataset(undefined)}
                  onSave={handleSaveDataset}
                  existingEntity={editingDataset}
                  entityType="Annotated Dataset"
                />
              ) : (
                <div
                  key={dataset.id}
                  ref={isActive ? activeDatasetRef : undefined}
                >
                  <AnnotatedDatasetCard<T>
                    data-cy="ai-annotate-dataset-card"
                    dataset={dataset}
                    isActive={isActive}
                    annotationState={annotationState}
                    onSelect={() => {
                      hasScrolledRef.current = false;
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
                </div>
              );
            })}
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
