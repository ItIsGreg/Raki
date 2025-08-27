import { TaskMode } from "@/app/constants";
import {
  AnnotatedDataset,
  AnnotatedText,
  Profile,
  ProfilePoint,
  SegmentationProfilePoint,
  Dataset,
  Text,
} from "@/lib/db/db";
import { ReactNode } from "react";

// Generic profile point type constraint
export type BaseProfilePoint = ProfilePoint | SegmentationProfilePoint;

// CRUD operations interface
export interface CrudOperations<TProfilePoint extends BaseProfilePoint> {
  readProfilePoints: (profileId: string | undefined) => Promise<TProfilePoint[]>;
  createProfilePoint: (point: any) => Promise<TProfilePoint>;
  updateProfilePoint?: (point: any) => Promise<void>;
}

// Component props interfaces
export interface LeftPanelProps {
  activeAnnotatedDataset?: AnnotatedDataset;
  activeAnnotatedText?: AnnotatedText;
  activeDataPointId?: string;
  activeText?: Text;
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | undefined) => void;
  setActiveDataPointId: (id: string | undefined) => void;
  setActiveAnnotatedText: (text: AnnotatedText | undefined) => void;
  setActiveTab: (tab: string) => void;
  setActiveDataPoint: (point: any) => void;
  mode: "display" | "annotation";
  onUpdateSegment?: (segment: any) => Promise<void>;
  isReadOnly?: boolean;
}

export interface DataPointEditorProps<TProfilePoint extends BaseProfilePoint> {
  activeProfile?: Profile;
  activeDataPoint?: TProfilePoint;
  setActiveDataPoint: (point: TProfilePoint | undefined) => void;
  creatingNewDataPoint: boolean;
  setCreatingNewDataPoint: (creating: boolean) => void;
}

// Mode configuration interface
export interface ModeConfiguration<TProfilePoint extends BaseProfilePoint> {
  mode: TaskMode;
  crudOperations: CrudOperations<TProfilePoint>;
  components: {
    LeftPanel: React.ComponentType<LeftPanelProps>;
    DataPointEditor: React.ComponentType<DataPointEditorProps<TProfilePoint>>;
  };
  identifiers: {
    activeDataPointKey: "activeDataPointId" | "activeSegmentId";
  };
}

// Shared state interface
export interface SharedAnnotationState<TProfilePoint extends BaseProfilePoint> {
  // Core entities
  activeAnnotatedDataset?: AnnotatedDataset;
  activeAnnotatedText?: AnnotatedText;
  activeProfile?: Profile;
  activeDataset?: Dataset;
  activeText?: Text;
  activeDataPoint?: TProfilePoint;
  
  // IDs and selections
  activeDataPointId?: string;
  activeProfilePoints: TProfilePoint[];
  
  // UI state
  isDatasetListOpen: boolean;
  autoRerunFaulty: boolean;
  creatingNewDataPoint: boolean;
  addingProfile: boolean;
  addingDataset: boolean;
  showDeleteDialog: boolean;
  showDeleteProfileDialog: boolean;
  displayMode: "display" | "annotation";
  activeTab: string;
  isCardExpanded: boolean;
  editingDataset?: AnnotatedDataset;
  isTutorialOpen: boolean;
  tutorialCompleted: boolean;
  isFeedbackOpen: boolean;
}

// Shared handlers interface
export interface SharedAnnotationHandlers<TProfilePoint extends BaseProfilePoint> {
  // Dataset handlers
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | undefined) => void;
  handleDeleteAnnotatedDataset: () => void;
  handleUploadDataset: (file: File) => Promise<void>;
  
  // Text handlers
  setActiveAnnotatedText: (text: AnnotatedText | undefined) => void;
  setActiveText: (text: Text | undefined) => void;
  
  // Profile handlers
  setActiveProfile: (profile: Profile | undefined) => void;
  handleSaveProfile: (profile: Profile) => void;
  handleDeleteProfile: () => void;
  handleUploadProfile: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDownloadProfile: () => Promise<void>;
  handleUploadButtonClick: () => void;
  
  // Dataset handlers
  setActiveDataset: (dataset: Dataset | undefined) => void;
  handleSaveDataset: (dataset: Dataset) => void;
  handleDeleteDataset: () => void;
  
  // DataPoint handlers
  setActiveDataPoint: (point: TProfilePoint | undefined) => void;
  setActiveDataPointId: (id: string | undefined) => void;
  setActiveProfilePoints: (points: TProfilePoint[]) => void;
  
  // UI handlers
  setCreatingNewDataPoint: (creating: boolean) => void;
  setAddingProfile: (adding: boolean) => void;
  setAddingDataset: (adding: boolean) => void;
  setShowDeleteDialog: (show: boolean) => void;
  setShowDeleteProfileDialog: (show: boolean) => void;
  setDisplayMode: (mode: "display" | "annotation") => void;
  setActiveTab: (tab: string) => void;
  setIsCardExpanded: (expanded: boolean) => void;
  setEditingDataset: (dataset: AnnotatedDataset | undefined) => void;
  setIsDatasetListOpen: (open: boolean) => void;
  setAutoRerunFaulty: (auto: boolean) => void;
  
  // Form handlers
  handleCancelAddProfile: () => void;
  handleCancelAddDataset: () => void;
  
  // Mode-specific handlers
  handleUpdateSegment?: (segment: any) => Promise<void>;
  setIsTutorialOpen: (open: boolean) => void;
  handleTutorialComplete: (completed: boolean) => Promise<void>;
  setIsFeedbackOpen: (open: boolean) => void;
  handleFeedbackSubmit: (feedback: { title: string; text: string }) => Promise<void>;
}

// Base annotation page props
export interface BaseAnnotationPageProps<TProfilePoint extends BaseProfilePoint> {
  configuration: ModeConfiguration<TProfilePoint>;
}

// Tab component props
export interface AnnotationTabProps<TProfilePoint extends BaseProfilePoint> {
  state: SharedAnnotationState<TProfilePoint>;
  handlers: SharedAnnotationHandlers<TProfilePoint>;
  configuration: ModeConfiguration<TProfilePoint>;
  annotationState: any; // From useAnnotationState hook
  dbAnnotatedDatasets: AnnotatedDataset[] | undefined;
  handleStart: () => void;
  handleStop: () => void;
  identifyActiveProfilePoints: (profileId: string) => void;
}

export interface ProfilesTabProps<TProfilePoint extends BaseProfilePoint> {
  state: SharedAnnotationState<TProfilePoint>;
  handlers: SharedAnnotationHandlers<TProfilePoint>;
  configuration: ModeConfiguration<TProfilePoint>;
  profiles: Profile[] | undefined;
  fileInputRef: React.RefObject<HTMLInputElement>;
}

export interface TextUploadTabProps {
  state: Pick<SharedAnnotationState<any>, 'activeDataset' | 'addingDataset' | 'showDeleteDialog' | 'activeText'>;
  handlers: Pick<SharedAnnotationHandlers<any>, 'setActiveDataset' | 'handleSaveDataset' | 'handleDeleteDataset' | 'handleCancelAddDataset' | 'setShowDeleteDialog' | 'setAddingDataset' | 'setActiveText'>;
  datasets: Dataset[] | undefined;
} 