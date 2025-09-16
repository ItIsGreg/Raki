"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnnotationPageState } from "@/hooks/useAnnotationPageState";
import { useComponentReady } from "@/hooks/useComponentReady";
import { BaseAnnotationPageProps, BaseProfilePoint } from "@/types/annotation";
import { AnnotationTab } from "./tabs/AnnotationTab";
import { ProfilesTab } from "./tabs/ProfilesTab";
import { TextUploadTab } from "./tabs/TextUploadTab";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { useEffect } from "react";

export function BaseAnnotationPage<TProfilePoint extends BaseProfilePoint>({
  configuration,
}: BaseAnnotationPageProps<TProfilePoint>) {
  const { markComponentReady } = useComponentReady();
  
  const {
    state,
    handlers,
    profiles,
    datasets,
    allTexts,
    userSettings,
    fileInputRef,
    displayText,
    annotationState,
    dbAnnotatedDatasets,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
    isReady,
  } = useAnnotationPageState(configuration);

  // Signal when the component is ready (when data is actually loaded)
  useEffect(() => {
    if (isReady) {
      markComponentReady();
    }
  }, [isReady, markComponentReady]);

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
    <div className="h-full overflow-hidden" data-cy={containerDataCy}>
      <PanelGroup
        direction="horizontal"
        className="h-full"
        autoSaveId={`annotation-layout-${configuration.mode}`}
      >
        {/* Left Panel - Text Display/Annotation */}
        <Panel
          defaultSize={60}
          minSize={30}
          maxSize={80}
          className="flex flex-col"
        >
          <configuration.components.LeftPanel
            activeAnnotatedDataset={state.activeAnnotatedDataset}
            activeAnnotatedText={state.activeAnnotatedText}
            activeDataPointId={state.activeDataPointId}
            activeText={displayText}
            setActiveAnnotatedDataset={handlers.setActiveAnnotatedDataset}
            setActiveDataPointId={handlers.setActiveDataPointId}
            setActiveAnnotatedText={handlers.setActiveAnnotatedText}
            setActiveTab={handlers.setActiveTab}
            setActiveDataPoint={handlers.setActiveDataPoint}
            mode={state.displayMode}
            onUpdateSegment={handlers.handleUpdateSegment}
            isReadOnly={state.activeTab === "text-upload"}
          />
        </Panel>

        {/* Resize Handle */}
        <PanelResizeHandle className="w-2 bg-border hover:bg-border/80 transition-colors flex items-center justify-center group">
          <div className="w-1 h-8 bg-border/50 rounded-full group-hover:bg-border transition-colors" />
        </PanelResizeHandle>

        {/* Right Panel - Tabbed Interface */}
        <Panel
          defaultSize={40}
          minSize={20}
          maxSize={70}
          className="flex flex-col"
        >
          <Tabs
            defaultValue="annotation"
            className="h-full flex flex-col overflow-hidden"
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
        </Panel>
      </PanelGroup>
    </div>
  );
}
