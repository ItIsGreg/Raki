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
import { UploadDatasetButton } from "@/components/annotation/datasets/UploadDatasetButton";
import { AddDatasetForm } from "@/components/annotation/datasets/AddDatasetForm";
import { AnnotatedDatasetCard } from "@/components/annotation/datasets/AnnotatedDatasetCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import DataPointList from "@/components/annotation/core/DataPointList";
import AnnotatedTextList from "@/components/annotation/core/AnnotatedTextList";
import { AnnotationTabProps, BaseProfilePoint } from "@/types/annotation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

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
                data-cy="annotation-dataset-select-content"
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
          <PanelGroup direction="horizontal">
            <Panel defaultSize={50} minSize={30}>
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
            </Panel>
            <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors flex items-center justify-center group">
              <div className="w-1 h-8 bg-border/50 rounded-full group-hover:bg-border transition-colors" />
            </PanelResizeHandle>
            <Panel defaultSize={50} minSize={30}>
              <AnnotatedTextList
                data-cy="annotated-text-list"
                activeAnnotatedDataset={state.activeAnnotatedDataset}
                activeAnnotatedText={state.activeAnnotatedText}
                setActiveAnnotatedText={handlers.setActiveAnnotatedText}
                setActiveAnnotatedDataset={handlers.setActiveAnnotatedDataset}
                mode={configuration.mode}
              />
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </TabsContent>
  );
}
