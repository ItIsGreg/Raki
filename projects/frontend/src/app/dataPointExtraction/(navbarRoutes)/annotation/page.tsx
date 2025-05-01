"use client";

import { useState } from "react";
import {
  AnnotatedDataset,
  AnnotatedText,
  Profile,
  ProfilePoint,
  ProfilePointCreate,
  SegmentationProfilePoint,
} from "@/lib/db/db";
import TextAnnotation from "@/components/annotation/TextAnnotation";
import DataPointList from "@/components/annotation/DataPointList";
import AnnotatedTextList from "@/components/annotation/AnnotatedTextList";
import AnnotatedDatasetList from "@/components/aiAnnotation/AnnotatedDatasetList";
import { TASK_MODE } from "@/app/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useAnnotationState } from "@/components/aiAnnotation/hooks/useAnnotationState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileDataPointList from "@/components/profiles/DataPointList";
import DataPointEditor from "@/components/profiles/DataPointEditor";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readProfilesByMode,
  readProfilePointsByProfile,
  createProfilePoint,
} from "@/lib/db/crud";

const Annotation = () => {
  // Since this is in the dataPointExtraction directory, we set the mode accordingly
  const mode = TASK_MODE.DATAPOINT_EXTRACTION;

  const [activeAnnotatedDataset, setActiveAnnotatedDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);
  const [activeAnnotatedText, setActiveAnnotatedText] = useState<
    AnnotatedText | undefined
  >(undefined);
  const [activeDataPointId, setActiveDataPointId] = useState<
    string | undefined
  >(undefined);
  const [activeProfilePoints, setActiveProfilePoints] = useState<
    ProfilePoint[]
  >([]);
  const [isDatasetListOpen, setIsDatasetListOpen] = useState(true);
  const [autoRerunFaulty, setAutoRerunFaulty] = useState(true);
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>();
  const [activeDataPoint, setActiveDataPoint] = useState<
    ProfilePoint | SegmentationProfilePoint | undefined
  >(undefined);
  const [creatingNewDataPoint, setCreatingNewDataPoint] =
    useState<boolean>(false);

  // Get profiles from database
  const profiles = useLiveQuery(() => readProfilesByMode(mode), [mode]);

  // Wrapper functions to handle type conversion
  const handleSetActiveAnnotatedDataset = (
    dataset: AnnotatedDataset | null
  ) => {
    setActiveAnnotatedDataset(dataset || undefined);
  };

  // Use the annotation state hook
  const {
    addingDataset,
    setAddingDataset,
    annotationState,
    dbAnnotatedDatasets,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
  } = useAnnotationState<ProfilePoint>({
    activeAnnotatedDataset: activeAnnotatedDataset || null,
    setActiveAnnotatedDataset: handleSetActiveAnnotatedDataset,
    activeProfilePoints,
    setActiveProfilePoints,
    autoRerunFaulty,
    mode,
  });

  return (
    <div
      className="grid grid-cols-7 gap-4 h-full overflow-hidden"
      data-cy="annotation-container"
    >
      <TextAnnotation
        data-cy="text-annotation"
        activeAnnotatedDataset={activeAnnotatedDataset}
        activeDataPointId={activeDataPointId}
        setActiveAnnotatedDataset={setActiveAnnotatedDataset}
        setActiveDataPointId={setActiveDataPointId}
        activeAnnotatedText={activeAnnotatedText}
        setActiveAnnotatedText={setActiveAnnotatedText}
      />
      <Tabs
        defaultValue="annotation"
        className="col-span-3 h-full flex flex-col overflow-hidden"
      >
        <TabsList className="w-full">
          <TabsTrigger value="annotation" className="flex-1">
            Annotation
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex-1">
            Profiles
          </TabsTrigger>
          <TabsTrigger value="scrolling" className="flex-1">
            Scrolling
          </TabsTrigger>
        </TabsList>
        <TabsContent value="annotation" className="h-[calc(100%-3rem)] mt-0">
          <div className="grid grid-cols-2 gap-4 h-full">
            <div className="col-span-1">
              <DataPointList
                data-cy="data-point-list"
                activeAnnotatedDataset={activeAnnotatedDataset}
                activeDataPointId={activeDataPointId}
                setActiveAnnotatedDataset={setActiveAnnotatedDataset}
                setActiveDataPointId={setActiveDataPointId}
                activeAnnotatedText={activeAnnotatedText}
                mode={mode}
                isDatasetListOpen={isDatasetListOpen}
                activeProfilePoints={activeProfilePoints}
              />
            </div>
            <div className="col-span-1">
              <AnnotatedTextList
                data-cy="annotated-text-list"
                activeAnnotatedDataset={activeAnnotatedDataset}
                activeAnnotatedText={activeAnnotatedText}
                setActiveAnnotatedText={setActiveAnnotatedText}
                setActiveAnnotatedDataset={setActiveAnnotatedDataset}
                mode={mode}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="profiles"
          className="flex-1 min-h-0 mt-0 overflow-hidden"
        >
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <Select
                value={activeProfile?.id}
                onValueChange={(value) => {
                  const profile = profiles?.find((p) => p.id === value);
                  setActiveProfile(profile);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a profile" />
                </SelectTrigger>
                <SelectContent>
                  {profiles?.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-4 h-[calc(100vh-12rem)]">
                <div className="col-span-1 overflow-y-auto">
                  <ProfileDataPointList
                    data-cy="profile-datapoint-list"
                    activeProfile={activeProfile}
                    activeDataPoint={activeDataPoint}
                    setActiveDataPoint={setActiveDataPoint}
                    setCreatingNewDataPoint={setCreatingNewDataPoint}
                    readPointsByProfile={readProfilePointsByProfile}
                    createPoint={(point) =>
                      createProfilePoint(point as ProfilePointCreate)
                    }
                  />
                </div>
                <div className="col-span-1 overflow-y-auto">
                  <DataPointEditor
                    data-cy="profile-datapoint-editor"
                    activeProfile={activeProfile}
                    activeDataPoint={
                      activeDataPoint as ProfilePoint | undefined
                    }
                    setActiveDataPoint={setActiveDataPoint}
                    creatingNewDataPoint={creatingNewDataPoint}
                    setCreatingNewDataPoint={setCreatingNewDataPoint}
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="scrolling"
          className="flex-1 min-h-0 mt-0 overflow-hidden"
        >
          <div className="h-full overflow-y-auto">
            <div className="p-4 space-y-4">
              {Array.from({ length: 50 }).map((_, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg shadow-sm bg-white"
                >
                  <h3 className="text-lg font-semibold mb-2">
                    Item {index + 1}
                  </h3>
                  <p className="text-gray-600">
                    This is a dummy content item to test scrolling
                    functionality. Each item has some text content to create
                    enough height for scrolling. You should be able to scroll
                    through all 50 items in this list.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <Sheet open={isDatasetListOpen} onOpenChange={setIsDatasetListOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
            data-cy="toggle-dataset-list"
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${
                isDatasetListOpen ? "rotate-180" : "rotate-0"
              }`}
            />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0 w-[400px]">
          <div className="h-full overflow-y-auto">
            <AnnotatedDatasetList<ProfilePoint>
              data-cy="dataset-list"
              activeAnnotatedDataset={activeAnnotatedDataset || null}
              activeProfilePoints={activeProfilePoints}
              setActiveAnnotatedDataset={handleSetActiveAnnotatedDataset}
              setActiveProfilePoints={setActiveProfilePoints}
              mode={mode}
              addingDataset={addingDataset}
              setAddingDataset={setAddingDataset}
              annotationState={annotationState}
              handleStart={handleStart}
              handleStop={handleStop}
              identifyActiveProfilePoints={identifyActiveProfilePoints}
              isOpen={isDatasetListOpen}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Annotation;
