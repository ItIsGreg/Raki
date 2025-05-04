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
import { ChevronLeft, Trash2, Menu, HelpCircle } from "lucide-react";
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
import { useQuery } from "react-query";
import { getProfiles } from "@/lib/db/crud";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

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
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

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

  // Add effect to log activeDataPoint changes
  useEffect(() => {
    console.log("Parent component - activeDataPoint changed:", activeDataPoint);
  }, [activeDataPoint]);

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
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Drawer
          open={isTutorialOpen}
          onOpenChange={setIsTutorialOpen}
          modal={false}
        >
          <DrawerTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent>
            <Tabs defaultValue="getting-started" className="w-full">
              <TabsList className="w-full justify-start px-4">
                <TabsTrigger value="getting-started">
                  Getting Started
                </TabsTrigger>
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="annotation">Annotation</TabsTrigger>
                <TabsTrigger value="text-upload">Text Upload</TabsTrigger>
                <TabsTrigger value="ai-setup">AI Setup</TabsTrigger>
                <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
              </TabsList>
              <TabsContent value="getting-started" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>Welcome to Data Point Extraction</DrawerTitle>
                  <DrawerDescription>
                    Learn how to use the annotation tool effectively
                  </DrawerDescription>
                </DrawerHeader>
                <h3 className="font-semibold mb-2">Getting Started</h3>
                <ol className="list-decimal pl-4 space-y-2">
                  <li>Select a profile from the Profiles tab</li>
                  <li>Create data points for your profile</li>
                  <li>Upload texts in the Text Upload tab</li>
                  <li>
                    Start annotating your texts with the created data points
                  </li>
                </ol>
              </TabsContent>
              <TabsContent value="profiles" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>Working with Profiles</DrawerTitle>
                  <DrawerDescription>
                    Learn how to manage and use profiles effectively
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4">
                  <p>
                    Profiles are collections of data points that define what you
                    want to extract from your texts.
                  </p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      💡 Tip: Create specific profiles for different types of
                      data you want to extract.
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="annotation" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>Annotation Process</DrawerTitle>
                  <DrawerDescription>
                    Master the art of text annotation
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4">
                  <p>Learn how to effectively annotate your texts:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Select text spans to annotate</li>
                    <li>Choose the appropriate data point</li>
                    <li>Review and edit annotations</li>
                    <li>Save your progress</li>
                  </ul>
                </div>
              </TabsContent>
              <TabsContent value="text-upload" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>Text Upload</DrawerTitle>
                  <DrawerDescription>
                    Learn how to manage and upload your texts
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4">
                  <p>Upload and manage your texts for annotation:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Create a new dataset or select an existing one</li>
                    <li>Upload individual texts or bulk import</li>
                    <li>Organize texts within datasets</li>
                    <li>Preview and edit text content</li>
                  </ul>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      📁 Supported formats: TXT, CSV, JSON
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="ai-setup" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>AI Setup</DrawerTitle>
                  <DrawerDescription>
                    Configure AI assistance for your annotation workflow
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4">
                  <p>Enhance your annotation process with AI:</p>
                  <ul className="list-disc pl-4 space-y-2">
                    <li>Configure AI model settings</li>
                    <li>Set up automatic suggestions</li>
                    <li>Adjust confidence thresholds</li>
                    <li>Manage AI training data</li>
                  </ul>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      🤖 AI suggestions can help speed up your annotation
                      process
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="tips" className="p-4">
                <DrawerHeader>
                  <DrawerTitle>Tips & Tricks</DrawerTitle>
                  <DrawerDescription>
                    Pro tips to enhance your workflow
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4">
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      🎯 Use keyboard shortcuts for faster annotation
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">
                      📝 Keep your data points well-organized
                    </p>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm">🔄 Regularly save your work</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
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
