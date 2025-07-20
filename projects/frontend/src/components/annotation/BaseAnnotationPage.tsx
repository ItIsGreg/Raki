"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnnotationPageState } from "@/hooks/useAnnotationPageState";
import { BaseAnnotationPageProps, BaseProfilePoint } from "@/types/annotation";
import { AnnotationTab } from "./tabs/AnnotationTab";
import { ProfilesTab } from "./tabs/ProfilesTab";
import { TextUploadTab } from "./tabs/TextUploadTab";

export function BaseAnnotationPage<TProfilePoint extends BaseProfilePoint>({
  configuration,
}: BaseAnnotationPageProps<TProfilePoint>) {
  const {
    state,
    handlers,
    profiles,
    datasets,
    allTexts,
    userSettings,
    fileInputRef,
    annotationState,
    dbAnnotatedDatasets,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
  } = useAnnotationPageState(configuration);

  const containerDataCy =
    configuration.mode === "datapoint_extraction"
      ? "annotation-container"
      : "segmentation-container";

  const tabsDataCy =
    configuration.mode === "datapoint_extraction"
      ? "annotation-tabs"
      : "segmentation-tabs";

  const tabsListDataCy =
    configuration.mode === "datapoint_extraction"
      ? "annotation-tabs-list"
      : "segmentation-tabs-list";

  return (
    <div
      className="grid grid-cols-7 gap-4 h-full overflow-hidden"
      data-cy={containerDataCy}
    >
      {/* Left Panel - Mode-specific component */}
      <div className="col-span-4 flex flex-col h-full">
        <configuration.components.LeftPanel
          activeAnnotatedDataset={state.activeAnnotatedDataset}
          activeAnnotatedText={state.activeAnnotatedText}
          activeDataPointId={state.activeDataPointId}
          activeText={state.activeText}
          setActiveAnnotatedDataset={handlers.setActiveAnnotatedDataset}
          setActiveDataPointId={handlers.setActiveDataPointId}
          setActiveAnnotatedText={handlers.setActiveAnnotatedText}
          setActiveTab={handlers.setActiveTab}
          setActiveDataPoint={handlers.setActiveDataPoint}
          mode={state.displayMode}
          onUpdateSegment={configuration.crudOperations.updateProfilePoint}
          isReadOnly={state.activeTab === "text-upload"}
        />
      </div>

      {/* Right Panel - Tabbed Interface */}
      <Tabs
        defaultValue="annotation"
        className="col-span-3 h-full flex flex-col overflow-hidden"
        onValueChange={handlers.setActiveTab}
        value={state.activeTab}
        data-cy={tabsDataCy}
      >
        <TabsList className="w-full" data-cy={tabsListDataCy}>
          <TabsTrigger
            value="annotation"
            className="flex-1"
            data-cy="annotation-tab"
          >
            Annotation
          </TabsTrigger>
          <TabsTrigger
            value="profiles"
            className="flex-1"
            data-cy="profiles-tab"
          >
            Profiles
          </TabsTrigger>
          <TabsTrigger
            value="text-upload"
            className="flex-1"
            data-cy="text-upload-tab"
          >
            Text Upload
          </TabsTrigger>
        </TabsList>

        <AnnotationTab
          state={state}
          handlers={handlers}
          configuration={configuration}
          annotationState={annotationState}
          dbAnnotatedDatasets={dbAnnotatedDatasets}
          handleStart={handleStart}
          handleStop={handleStop}
          identifyActiveProfilePoints={identifyActiveProfilePoints}
        />

        <ProfilesTab
          state={state}
          handlers={handlers}
          configuration={configuration}
          profiles={profiles}
          fileInputRef={fileInputRef}
        />

        <TextUploadTab
          state={{
            activeDataset: state.activeDataset,
            addingDataset: state.addingDataset,
            showDeleteDialog: state.showDeleteDialog,
            activeText: state.activeText,
          }}
          handlers={{
            setActiveDataset: handlers.setActiveDataset,
            handleSaveDataset: handlers.handleSaveDataset,
            handleDeleteDataset: handlers.handleDeleteDataset,
            handleCancelAddDataset: handlers.handleCancelAddDataset,
            setShowDeleteDialog: handlers.setShowDeleteDialog,
            setAddingDataset: handlers.setAddingDataset,
            setActiveText: handlers.setActiveText,
          }}
          datasets={datasets}
        />
      </Tabs>
    </div>
  );
}
