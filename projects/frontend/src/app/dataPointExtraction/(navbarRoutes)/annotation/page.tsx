"use client";

import { useState, useEffect } from "react";
import {
  AnnotatedDataset,
  AnnotatedText,
  Profile,
  ProfilePoint,
  ProfilePointCreate,
  SegmentationProfilePoint,
  Dataset,
  Text,
} from "@/lib/db/db";
import TextAnnotation from "@/components/annotation/TextAnnotation";
import DataPointList from "@/components/annotation/DataPointList";
import AnnotatedTextList from "@/components/annotation/AnnotatedTextList";
import AnnotatedDatasetList from "@/components/aiAnnotation/AnnotatedDatasetList";
import TextList from "@/components/datasets/TextList";
import { TASK_MODE } from "@/app/constants";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Trash2 } from "lucide-react";
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
  createProfile,
  deleteProfile,
  readDatasetsByMode,
  createDataset,
  deleteDataset,
  readTextsByDataset,
} from "@/lib/db/crud";
import { AddButton } from "@/components/AddButton";
import EntityForm from "@/components/EntityForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [addingProfile, setAddingProfile] = useState(false);
  const [activeDataset, setActiveDataset] = useState<Dataset | undefined>(
    undefined
  );
  const [addingDataset, setAddingDataset] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteProfileDialog, setShowDeleteProfileDialog] = useState(false);
  const [displayMode, setDisplayMode] = useState<"display" | "annotation">(
    "annotation"
  );
  const [activeTab, setActiveTab] = useState("annotation");
  const [activeText, setActiveText] = useState<Text | undefined>(undefined);

  // Get profiles from database
  const profiles = useLiveQuery(() => readProfilesByMode(mode), [mode]);
  // Get datasets from database
  const datasets = useLiveQuery(() => readDatasetsByMode(mode), [mode]);
  // Get all texts for all datasets
  const allTexts = useLiveQuery(() => {
    if (!datasets) return [];
    return Promise.all(
      datasets.map((dataset) => readTextsByDataset(dataset.id))
    ).then((textArrays) => textArrays.flat());
  }, [datasets]);

  // Update display mode when tab changes
  useEffect(() => {
    setDisplayMode(activeTab === "text-upload" ? "display" : "annotation");
  }, [activeTab]);

  // Synchronize active profile with active annotated dataset
  useEffect(() => {
    if (activeAnnotatedDataset && profiles) {
      const associatedProfile = profiles.find(
        (p) => p.id === activeAnnotatedDataset.profileId
      );
      if (associatedProfile) {
        setActiveProfile(associatedProfile);
      }
    }
  }, [activeAnnotatedDataset, profiles]);

  // Wrapper functions to handle type conversion
  const handleSetActiveAnnotatedDataset = (
    dataset: AnnotatedDataset | null
  ) => {
    setActiveAnnotatedDataset(dataset || undefined);
  };

  // Use the annotation state hook
  const {
    addingDataset: annotationAddingDataset,
    setAddingDataset: setAnnotationAddingDataset,
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

  const handleCancelAddProfile = () => {
    setAddingProfile(false);
  };

  const handleSaveProfile = (profile: Profile) => {
    const profileWithMode = { ...profile, mode };
    createProfile(profileWithMode).then((newProfile) => {
      setActiveProfile(newProfile);
      setAddingProfile(false);
    });
  };

  const handleDeleteProfile = () => {
    if (activeProfile) {
      deleteProfile(activeProfile.id);
      setActiveProfile(undefined);
      setShowDeleteProfileDialog(false);
    }
  };

  const handleCancelAddDataset = () => {
    setAddingDataset(false);
  };

  const handleSaveDataset = (dataset: Dataset) => {
    const datasetWithMode = { ...dataset, mode };
    createDataset(datasetWithMode).then((newDataset) => {
      setActiveDataset(newDataset);
      setAddingDataset(false);
    });
  };

  const handleDeleteDataset = () => {
    if (activeDataset) {
      deleteDataset(activeDataset.id);
      setActiveDataset(undefined);
      setShowDeleteDialog(false);
    }
  };

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
        mode={displayMode}
        activeText={activeText}
      />
      <Tabs
        defaultValue="annotation"
        className="col-span-3 h-full flex flex-col overflow-hidden"
        onValueChange={setActiveTab}
      >
        <TabsList className="w-full">
          <TabsTrigger value="annotation" className="flex-1">
            Annotation
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex-1">
            Profiles
          </TabsTrigger>
          <TabsTrigger value="text-upload" className="flex-1">
            Text Upload
          </TabsTrigger>
        </TabsList>
        <TabsContent
          value="annotation"
          className="flex-1 min-h-0 mt-0 overflow-hidden"
        >
          <div className="h-full overflow-y-auto">
            <div className="grid grid-cols-2 gap-4 h-[calc(100vh-8rem)] p-4">
              <div className="col-span-1 overflow-y-auto">
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
              <div className="col-span-1 overflow-y-auto">
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
          </div>
        </TabsContent>
        <TabsContent
          value="profiles"
          className="flex-1 min-h-0 mt-0 overflow-hidden"
        >
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <div className="flex gap-4 items-center">
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
                <AddButton
                  onClick={() => setAddingProfile(true)}
                  label="Profile"
                  data-cy="add-profile-button"
                />
                {activeProfile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteProfileDialog(true)}
                    data-cy="delete-profile-button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <AlertDialog
                open={showDeleteProfileDialog}
                onOpenChange={setShowDeleteProfileDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the profile and all associated data points.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProfile}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {addingProfile && (
                <EntityForm<Profile>
                  onCancel={handleCancelAddProfile}
                  onSave={handleSaveProfile}
                  entityType="Profile"
                  data-cy="new-profile-form"
                />
              )}
              <div className="grid grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
                <div className="col-span-2 overflow-y-auto">
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
              </div>
            </div>
          </div>
        </TabsContent>
        <TabsContent
          value="text-upload"
          className="flex-1 min-h-0 mt-0 overflow-hidden"
        >
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <div className="flex gap-4 items-center">
                <Select
                  value={activeDataset?.id}
                  onValueChange={(value) => {
                    const dataset = datasets?.find((d) => d.id === value);
                    setActiveDataset(dataset);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets?.map((dataset) => (
                      <SelectItem key={dataset.id} value={dataset.id}>
                        {dataset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AddButton
                  onClick={() => setAddingDataset(true)}
                  label="Dataset"
                  data-cy="add-dataset-button"
                />
                {activeDataset && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowDeleteDialog(true)}
                    data-cy="delete-dataset-button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the dataset and all associated texts.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteDataset}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              {addingDataset && (
                <EntityForm<Dataset>
                  onCancel={handleCancelAddDataset}
                  onSave={handleSaveDataset}
                  entityType="Dataset"
                  data-cy="new-dataset-form"
                />
              )}
              <TextList
                activeText={activeText}
                activeDataset={activeDataset}
                setActiveText={setActiveText}
                data-cy="text-list"
              />
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
              addingDataset={annotationAddingDataset}
              setAddingDataset={setAnnotationAddingDataset}
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
