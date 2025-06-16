"use client";

import { useState, useEffect, useRef } from "react";
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
import TextList from "@/components/datasets/TextList";
import { TASK_MODE } from "@/app/constants";
import { Button } from "@/components/ui/button";
import { Trash2, ChevronDown } from "lucide-react";
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
  getUserSettings,
  updateUserSettings,
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
import TutorialDrawer from "@/components/tutorial/TutorialDrawer";
import { AnnotatedDatasetCard } from "@/components/aiAnnotation/AnnotatedDatasetCard";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AddDatasetForm } from "@/components/aiAnnotation/AddDatasetForm";
import { UploadDatasetButton } from "@/components/aiAnnotation/UploadDatasetButton";
import { handleUploadAnnotatedDataset } from "@/components/aiAnnotation/annotationUtils";

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
  const [isDatasetListOpen, setIsDatasetListOpen] = useState(false);
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
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const [editingDataset, setEditingDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);

  // Get user settings from database
  const userSettings = useLiveQuery(() => getUserSettings(), []);

  // Update tutorial completed state when user settings change
  useEffect(() => {
    if (userSettings) {
      setTutorialCompleted(userSettings.tutorialCompleted);
    }
  }, [userSettings]);

  // Handle tutorial completion
  const handleTutorialComplete = async (completed: boolean) => {
    setTutorialCompleted(completed);
    await updateUserSettings({ tutorialCompleted: completed });
    // Close the drawer when tutorial is marked as completed
    if (completed) {
      setIsTutorialOpen(false);
    }
  };

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

  const handleDeleteAnnotatedDataset = () => {
    if (activeAnnotatedDataset) {
      setActiveAnnotatedDataset(undefined);
    }
  };

  const handleUploadDataset = async (file: File) => {
    try {
      const newDataset = await handleUploadAnnotatedDataset(file);
      setActiveAnnotatedDataset(newDataset);
    } catch (error) {
      console.error("Error uploading dataset:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div
      className="grid grid-cols-7 gap-4 h-full overflow-hidden"
      data-cy="annotation-container"
    >
      <TutorialDrawer
        isOpen={isTutorialOpen}
        onOpenChange={setIsTutorialOpen}
        data-cy="tutorial-drawer"
      />
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
        setActiveTab={setActiveTab}
        setActiveDataPoint={setActiveDataPoint}
      />
      <Tabs
        defaultValue="annotation"
        className="col-span-3 h-full flex flex-col overflow-hidden"
        onValueChange={setActiveTab}
        value={activeTab}
        data-cy="annotation-tabs"
      >
        <TabsList className="w-full" data-cy="annotation-tabs-list">
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
        <TabsContent
          value="annotation"
          className="flex-1 min-h-0 mt-0 overflow-hidden"
          data-cy="annotation-tab-content"
        >
          <div className="h-full overflow-y-auto">
            <div className="flex flex-col gap-4 p-4">
              <div className="flex gap-4 items-center">
                <Select
                  value={activeAnnotatedDataset?.id}
                  onValueChange={(value) => {
                    const dataset = dbAnnotatedDatasets?.find(
                      (d) => d.id === value
                    );
                    setActiveAnnotatedDataset(dataset || undefined);
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
                  onClick={() => setAddingDataset(true)}
                  label="Dataset"
                  data-cy="add-dataset-button"
                />
                <UploadDatasetButton
                  data-cy="upload-dataset-button"
                  onUpload={handleUploadDataset}
                />
              </div>
              {addingDataset && (
                <AddDatasetForm
                  data-cy="add-dataset-form"
                  onClose={() => setAddingDataset(false)}
                  mode={mode}
                  onDatasetCreated={(newDataset) => {
                    setActiveAnnotatedDataset(newDataset);
                    identifyActiveProfilePoints(newDataset.profileId);
                  }}
                />
              )}
              {activeAnnotatedDataset && (
                <Collapsible
                  open={isCardExpanded}
                  onOpenChange={setIsCardExpanded}
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
                        isCardExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <AnnotatedDatasetCard
                      dataset={activeAnnotatedDataset}
                      isActive={true}
                      annotationState={annotationState}
                      onSelect={() => {}}
                      onStart={() => {
                        identifyActiveProfilePoints(
                          activeAnnotatedDataset.profileId
                        );
                        handleStart();
                      }}
                      onStop={handleStop}
                      onEdit={() => setEditingDataset(activeAnnotatedDataset)}
                      onDelete={handleDeleteAnnotatedDataset}
                      mode={mode}
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
                <div
                  className="col-span-1 overflow-y-auto"
                  data-cy="annotated-text-list-container"
                >
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
                  data-cy="profile-select"
                >
                  <SelectTrigger
                    className="w-full"
                    data-cy="profile-select-trigger"
                  >
                    <SelectValue placeholder="Select a profile" />
                  </SelectTrigger>
                  <SelectContent data-cy="profile-select-content">
                    {profiles?.map((profile) => (
                      <SelectItem
                        key={profile.id}
                        value={profile.id}
                        data-cy={`profile-option-${profile.id}`}
                      >
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
                data-cy="delete-profile-dialog"
              >
                <AlertDialogContent data-cy="delete-profile-dialog-content">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the profile and all associated data points.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-cy="delete-profile-cancel">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteProfile}
                      className="bg-red-600 hover:bg-red-700"
                      data-cy="delete-profile-confirm"
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
                <div
                  className="col-span-2 overflow-y-auto"
                  data-cy="datapoint-editor-container"
                >
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
                <div
                  className="col-span-1 overflow-y-auto"
                  data-cy="profile-datapoint-list-container"
                >
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
              <div className="flex flex-col gap-4">
                <Select
                  value={activeDataset?.id}
                  onValueChange={(value) => {
                    const dataset = datasets?.find((d) => d.id === value);
                    setActiveDataset(dataset);
                  }}
                  data-cy="text-dataset-select"
                >
                  <SelectTrigger
                    className="w-full"
                    data-cy="text-dataset-select-trigger"
                  >
                    <SelectValue placeholder="Select a text set" />
                  </SelectTrigger>
                  <SelectContent data-cy="text-dataset-select-content">
                    {datasets?.map((dataset) => (
                      <SelectItem
                        key={dataset.id}
                        value={dataset.id}
                        data-cy={`text-dataset-option-${dataset.id}`}
                      >
                        {dataset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={() => setAddingDataset(true)}
                  className="w-full"
                  data-cy="add-dataset-button"
                >
                  New Text Set
                </Button>
              </div>
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
              <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                data-cy="delete-dataset-dialog"
              >
                <AlertDialogContent data-cy="delete-dataset-dialog-content">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the dataset and all associated texts.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel data-cy="delete-dataset-cancel">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteDataset}
                      className="bg-red-600 hover:bg-red-700"
                      data-cy="delete-dataset-confirm"
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
    </div>
  );
};

export default Annotation;
