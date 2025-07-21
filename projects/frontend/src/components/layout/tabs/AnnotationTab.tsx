"use client";

import { TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";
import { AddButton } from "@/components/shared/AddButton";
import { UploadDatasetButton } from "@/components/annotation/ai/UploadDatasetButton";
import { AddDatasetForm } from "@/components/annotation/ai/AddDatasetForm";
import { AnnotatedDatasetCard } from "@/components/annotation/ai/AnnotatedDatasetCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DataPointList from "@/components/annotation/DataPointList";
import AnnotatedTextList from "@/components/annotation/AnnotatedTextList";
import { AnnotationTabProps, BaseProfilePoint } from "@/types/annotation";

export function AnnotationTab<TProfilePoint extends BaseProfilePoint>({
  state,
  handlers,
  configuration,
  annotationState,
  dbAnnotatedDatasets,
  handleStart,
  handleStop,
  identifyActiveProfilePoints,
}: AnnotationTabProps<TProfilePoint>) {
  return (
    <TabsContent
      value="annotation"
      className="flex-1 min-h-0 mt-0 overflow-hidden"
      data-cy="annotation-tab-content"
    >
      <div className="h-full overflow-y-auto">
        <div className="flex flex-col gap-4 p-4">
          <div className="flex gap-4 items-center">
            <Select
              value={state.activeAnnotatedDataset?.id}
              onValueChange={(value) => {
                const dataset = dbAnnotatedDatasets?.find(
                  (d) => d.id === value
                );
                handlers.setActiveAnnotatedDataset(dataset || undefined);
              }}
              data-cy="annotation-dataset-select"
            >
              <SelectTrigger
                className="w-full"
                data-cy="annotation-dataset-select-trigger"
              >
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent
                data-cy="annotated-dataset-select-content"
                position="popper"
                sideOffset={5}
              >
                {dbAnnotatedDatasets?.map((dataset) => (
                  <SelectItem
                    key={dataset.id}
                    value={dataset.id}
                    data-cy={`dataset-option-${dataset.id}`}
                  >
                    {dataset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <AddButton
              onClick={() => handlers.setAddingDataset(true)}
              label="Dataset"
              data-cy="add-dataset-button"
            />
            <UploadDatasetButton
              data-cy="upload-dataset-button"
              onUpload={handlers.handleUploadDataset}
            />
          </div>
          {state.addingDataset && (
            <AddDatasetForm
              data-cy="add-dataset-form"
              onClose={() => handlers.setAddingDataset(false)}
              mode={configuration.mode}
              onDatasetCreated={(newDataset) => {
                handlers.setActiveAnnotatedDataset(newDataset);
                identifyActiveProfilePoints(newDataset.profileId);
              }}
            />
          )}
          {state.activeAnnotatedDataset && (
            <Collapsible
              open={state.isCardExpanded}
              onOpenChange={handlers.setIsCardExpanded}
              className="w-full"
              data-cy="dataset-details-collapsible"
            >
              <CollapsibleTrigger
                className="w-full flex items-center justify-between p-2 bg-gray-100 rounded-t-lg hover:bg-gray-200"
                data-cy="dataset-details-trigger"
              >
                <span className="font-medium">Details</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    state.isCardExpanded ? "rotate-180" : ""
                  }`}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <AnnotatedDatasetCard
                  dataset={state.activeAnnotatedDataset}
                  isActive={true}
                  annotationState={annotationState}
                  onSelect={() => {}}
                  onStart={() => {
                    identifyActiveProfilePoints(
                      state.activeAnnotatedDataset!.profileId
                    );
                    handleStart();
                  }}
                  onStop={handleStop}
                  onEdit={() =>
                    handlers.setEditingDataset(state.activeAnnotatedDataset)
                  }
                  onDelete={handlers.handleDeleteAnnotatedDataset}
                  mode={configuration.mode}
                />
              </CollapsibleContent>
            </Collapsible>
          )}
          <div className="grid grid-cols-2 gap-4 h-[calc(100vh-8rem)]">
            <div
              className="col-span-1 overflow-y-auto"
              data-cy="datapoint-list-container"
            >
              <DataPointList
                data-cy="data-point-list"
                activeAnnotatedDataset={state.activeAnnotatedDataset}
                activeDataPointId={state.activeDataPointId}
                setActiveAnnotatedDataset={handlers.setActiveAnnotatedDataset}
                setActiveDataPointId={handlers.setActiveDataPointId}
                activeAnnotatedText={state.activeAnnotatedText}
                mode={configuration.mode}
                isDatasetListOpen={state.isDatasetListOpen}
                activeProfilePoints={state.activeProfilePoints as any}
              />
            </div>
            <div
              className="col-span-1 overflow-y-auto"
              data-cy="annotated-text-list-container"
            >
              <AnnotatedTextList
                data-cy="annotated-text-list"
                activeAnnotatedDataset={state.activeAnnotatedDataset}
                activeAnnotatedText={state.activeAnnotatedText}
                setActiveAnnotatedText={handlers.setActiveAnnotatedText}
                setActiveAnnotatedDataset={handlers.setActiveAnnotatedDataset}
                mode={configuration.mode}
              />
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
