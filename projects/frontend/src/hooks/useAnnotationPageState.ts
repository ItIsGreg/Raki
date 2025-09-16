import { useState, useEffect, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { useCurrentDatabase } from "./useCurrentDatabase";
import { useStorage } from "@/contexts/StorageContext";
import {
  AnnotatedDataset,
  AnnotatedText,
  Profile,
  Dataset,
  Text,
} from "@/lib/db/db";
import {
  readProfilesByMode,
  readDatasetsByMode,
  readTextsByDataset,
  createProfile,
  deleteProfile,
  createDataset,
  deleteDataset,
  getUserSettings,
  updateUserSettings,
  readText,
} from "@/lib/db/crud";
import { useAnnotationState } from "@/components/annotation/hooks/useAnnotationState";
import { handleUploadAnnotatedDataset } from "@/components/annotation/utils/annotationUtils";
import {
  BaseProfilePoint,
  ModeConfiguration,
  SharedAnnotationState,
  SharedAnnotationHandlers,
} from "@/types/annotation";

export function useAnnotationPageState<TProfilePoint extends BaseProfilePoint>(
  configuration: ModeConfiguration<TProfilePoint>
) {
  // Get current database and storage context
  const currentDatabase = useCurrentDatabase();
  const { currentStorage } = useStorage();
  
  // Loading state
  const [isReady, setIsReady] = useState(false);
  
  // Core state
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
    TProfilePoint[]
  >([]);
  const [isDatasetListOpen, setIsDatasetListOpen] = useState(false);
  const [autoRerunFaulty, setAutoRerunFaulty] = useState(true);
  const [activeProfile, setActiveProfile] = useState<Profile | undefined>();

  // Clear active profile when storage changes
  useEffect(() => {
    setActiveProfile(undefined);
    setActiveAnnotatedDataset(undefined);
    setActiveAnnotatedText(undefined);
    setActiveDataPointId(undefined);
    setActiveProfilePoints([]);
  }, [currentStorage?.id]);
  const [activeDataPoint, setActiveDataPoint] = useState<
    TProfilePoint | undefined
  >(undefined);
  const [creatingNewDataPoint, setCreatingNewDataPoint] = useState<boolean>(false);
  const [addingProfile, setAddingProfile] = useState(false);
  const [pendingActiveProfile, setPendingActiveProfile] = useState<Profile | null>(null);
  const [activeDataset, setActiveDataset] = useState<Dataset | undefined>(undefined);
  const [addingDataset, setAddingDataset] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteProfileDialog, setShowDeleteProfileDialog] = useState(false);
  const [displayMode, setDisplayMode] = useState<"display" | "annotation">("annotation");
  const [activeTab, setActiveTab] = useState("annotation");
  const [activeText, setActiveText] = useState<Text | undefined>(undefined);
  const [isCardExpanded, setIsCardExpanded] = useState(true);
  const [editingDataset, setEditingDataset] = useState<
    AnnotatedDataset | undefined
  >(undefined);

  // File input ref for profile uploads
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get user settings from database
  const userSettings = useLiveQuery(() => getUserSettings(), [currentDatabase]);

  // Get profiles from database
  const profiles = useLiveQuery(() => readProfilesByMode(configuration.mode), [
    configuration.mode, 
    currentDatabase,
    // Include version for cloud storage to trigger refresh on changes
    currentDatabase && 'getVersion' in currentDatabase ? (currentDatabase as any).getVersion() : 0
  ]);
  
  // Get datasets from database
  const datasets = useLiveQuery(() => readDatasetsByMode(configuration.mode), [
    configuration.mode, 
    currentDatabase,
    // Include version for cloud storage to trigger refresh on changes
    currentDatabase && 'getVersion' in currentDatabase ? (currentDatabase as any).getVersion() : 0
  ]);
  
  // Get all texts for all datasets
  const allTexts = useLiveQuery(() => {
    if (!datasets) return [];
    return Promise.all(
      datasets.map((dataset) => readTextsByDataset(dataset.id))
    ).then((textArrays) => textArrays.flat());
  }, [datasets, currentDatabase]);

  // Get text content for display (mode-specific logic)
  const displayText = useLiveQuery<Text | undefined>(() => {
    // In text upload tab, use activeText directly
    if (activeTab === "text-upload" && activeText) {
      return Promise.resolve(activeText);
    }
    // In annotation tab, get text from activeAnnotatedText for segmentation mode
    if (configuration.mode === "text_segmentation" && activeAnnotatedText?.textId) {
      return readText(activeAnnotatedText.textId);
    }
    // For datapoint extraction, return undefined (uses TextAnnotation component differently)
    return Promise.resolve(undefined);
  }, [activeAnnotatedText?.textId, activeText, activeTab, configuration.mode, currentDatabase]);

  // Update display mode when tab changes
  useEffect(() => {
    setDisplayMode(activeTab === "text-upload" ? "display" : "annotation");
  }, [activeTab]);

  // Synchronize active profile with active annotated dataset
  useEffect(() => {
    if (activeAnnotatedDataset && profiles && profiles.length > 0) {
      const associatedProfile = profiles.find(
        (p) => p.id === activeAnnotatedDataset.profileId
      );
      if (associatedProfile) {
        setActiveProfile(associatedProfile);
      }
    } else if (profiles && profiles.length > 0 && !activeAnnotatedDataset) {
      // If we have profiles but no active dataset, clear the active profile
      // This prevents the "all profiles selected" issue when switching storage
      if (activeProfile && !profiles.find(p => p.id === activeProfile.id)) {
        setActiveProfile(undefined);
      }
    }
  }, [activeAnnotatedDataset, profiles, activeProfile]);

  // Handle pending active profile when it appears in the list
  useEffect(() => {
    if (pendingActiveProfile && profiles && profiles.length > 0) {
      console.log('Checking for pending profile:', pendingActiveProfile.id);
      console.log('Available profile IDs:', profiles.map(p => p.id));
      const profileInList = profiles.find(p => p.id === pendingActiveProfile.id);
      if (profileInList) {
        console.log('Pending profile found in list, setting as active:', profileInList);
        setActiveProfile(profileInList);
        setPendingActiveProfile(null);
      } else {
        console.log('Pending profile not found in list yet');
      }
    }
  }, [profiles, pendingActiveProfile]);



  // Reset ready state when component mounts (for tab navigation)
  useEffect(() => {
    setIsReady(false);
  }, []);

  // Set component as ready when essential data is loaded
  useEffect(() => {
    // Check if all essential data is loaded
    const essentialDataLoaded = profiles !== undefined && 
                               datasets !== undefined && 
                               userSettings !== undefined;
    
    if (essentialDataLoaded && !isReady) {
      // Add a small delay to ensure all components are rendered
      const delay = 100; // Small delay for rendering
      
      const timer = setTimeout(() => {
        setIsReady(true);
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [profiles, datasets, userSettings, isReady]);

  // Wrapper functions to handle type conversion
  const handleSetActiveAnnotatedDataset = (dataset: AnnotatedDataset | null) => {
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
  } = useAnnotationState<TProfilePoint>({
    activeAnnotatedDataset: activeAnnotatedDataset || null,
    setActiveAnnotatedDataset: handleSetActiveAnnotatedDataset,
    activeProfilePoints,
    setActiveProfilePoints,
    autoRerunFaulty,
    mode: configuration.mode,
  });

  // Handlers
  const handleCancelAddProfile = () => {
    setAddingProfile(false);
  };

  const handleSaveProfile = (profile: Profile) => {
    const profileWithMode = { ...profile, mode: configuration.mode };
    createProfile(profileWithMode).then((newProfile) => {
      console.log('Profile created:', newProfile);
      console.log('Current profiles before setting active:', profiles);
      
      // Set as pending active profile - will be activated when it appears in the list
      setPendingActiveProfile(newProfile);
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
    const datasetWithMode = { ...dataset, mode: configuration.mode };
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

  const handleUpdateSegment = async (segment: any) => {
    if (configuration.crudOperations.updateProfilePoint) {
      await configuration.crudOperations.updateProfilePoint(segment);
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

  const handleUploadProfile = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const fileContent = await file.text();
      const uploadedData = JSON.parse(fileContent);

      // Validate the structure of the uploaded data
      if (!uploadedData.profile || !uploadedData.profilePoints) {
        throw new Error("Invalid file structure");
      }

      // Create the new profile
      const newProfile = await createProfile({
        ...uploadedData.profile,
        mode: uploadedData.profile.mode || configuration.mode,
      });

      // Create new profile points using the configuration's CRUD operations
      for (const profilePoint of uploadedData.profilePoints) {
        await configuration.crudOperations.createProfilePoint({
          ...profilePoint,
          profileId: newProfile.id,
        });
      }

      // Set the new profile as active
      setActiveProfile(newProfile);

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error uploading profile:", error);
      alert("Error uploading profile. Please check the file format.");
    }
  };

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleDownloadProfile = async () => {
    if (!activeProfile) return;

    try {
      // Fetch profile points using configuration's CRUD operations
      const profilePoints = await configuration.crudOperations.readProfilePoints(
        activeProfile.id
      );

      // Create the complete profile data
      const profileData = {
        profile: {
          name: activeProfile.name,
          description: activeProfile.description,
          mode: activeProfile.mode,
          example: activeProfile.example,
        },
        profilePoints: profilePoints.map((point) => {
          const { id, profileId, ...rest } = point as any;
          return rest;
        }),
      };

      // Convert to JSON and download
      const jsonData = JSON.stringify(profileData, null, 2);
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${activeProfile.name}_profile.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading profile:", error);
    }
  };

  // Compose state object
  const state: SharedAnnotationState<TProfilePoint> = {
    activeAnnotatedDataset,
    activeAnnotatedText,
    activeProfile,
    activeDataset,
    activeText,
    activeDataPoint,
    activeDataPointId,
    activeProfilePoints,
    isDatasetListOpen,
    autoRerunFaulty,
    creatingNewDataPoint,
    addingProfile,
    addingDataset,
    showDeleteDialog,
    showDeleteProfileDialog,
    displayMode,
    activeTab,
    isCardExpanded,
    editingDataset,
  };

  // Compose handlers object
  const handlers: SharedAnnotationHandlers<TProfilePoint> = {
    setActiveAnnotatedDataset,
    handleDeleteAnnotatedDataset,
    handleUploadDataset,
    setActiveAnnotatedText,
    setActiveText,
    setActiveProfile,
    handleSaveProfile,
    handleDeleteProfile,
    handleUploadProfile,
    handleDownloadProfile,
    handleUploadButtonClick,
    setActiveDataset,
    handleSaveDataset,
    handleDeleteDataset,
    setActiveDataPoint,
    setActiveDataPointId,
    setActiveProfilePoints,
    setCreatingNewDataPoint,
    setAddingProfile,
    setAddingDataset,
    setShowDeleteDialog,
    setShowDeleteProfileDialog,
    setDisplayMode,
    setActiveTab,
    setIsCardExpanded,
    setEditingDataset,
    setIsDatasetListOpen,
    setAutoRerunFaulty,
    handleCancelAddProfile,
    handleCancelAddDataset,
    handleUpdateSegment,
  };

  return {
    state,
    handlers,
    // Additional data needed by components
    profiles,
    datasets,
    allTexts,
    userSettings,
    fileInputRef,
    displayText,
    // Annotation state hook data
    annotationState,
    dbAnnotatedDatasets,
    handleStart,
    handleStop,
    identifyActiveProfilePoints,
    // Loading state
    isReady,
  };
} 