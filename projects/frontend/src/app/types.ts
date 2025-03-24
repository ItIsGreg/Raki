import {
  AnnotatedDataset,
  AnnotatedText,
  DataPoint,
  Dataset,
  Profile,
  ProfilePoint,
  Text,
  SegmentationProfilePoint,
  ProfilePointCreate,
  SegmentationProfilePointCreate,
} from "@/lib/db/db";
import { TaskMode } from "./constants";

export interface ProfileListProps {
  activeProfile: Profile | undefined;
  setActiveProfile: (profile: Profile) => void;
  mode: TaskMode;
}

export interface ProfileCardProps {
  profile: Profile;
  activeProfile: Profile | undefined;
  setActiveProfile: (profile: Profile) => void;
  setEditingProfile: (profile: Profile | undefined) => void;
  "data-cy": string;
}

export interface DataPointCardProps {
  dataPoint: ProfilePoint;
  activeDataPoint: ProfilePoint | undefined;
  setActiveDataPoint: (dataPoint: ProfilePoint | undefined) => void;
  setCreatingNewDataPoint: (creating: boolean) => void;
  "data-cy": string;
}

export interface DataPointListProps {
  activeProfile: Profile | undefined;
  activeDataPoint: ProfilePoint | SegmentationProfilePoint | undefined;
  setActiveDataPoint: (dataPoint: ProfilePoint | SegmentationProfilePoint | undefined) => void;
  setCreatingNewDataPoint: (creating: boolean) => void;
  readPointsByProfile: (profileId: string | undefined) => Promise<(ProfilePoint | SegmentationProfilePoint)[]>;
  createPoint: (point: ProfilePointCreate | SegmentationProfilePointCreate) => Promise<ProfilePoint | SegmentationProfilePoint>;
}

export interface DataPointEditorProps {
  activeDataPoint: ProfilePoint | undefined;
  setActiveDataPoint: (dataPoint: ProfilePoint | undefined) => void;
  creatingNewDataPoint: boolean;
  setCreatingNewDataPoint: (creating: boolean) => void;
  activeProfile: Profile | undefined;
}

export interface TextListProps {
  activeText: Text | undefined;
  setActiveText: (text: Text) => void;
  activeDataset: Dataset | undefined;
}

export interface TextDisplayProps {
  activeText: Text | undefined;
}

export interface DatasetListProps {
  activeDataset: Dataset | undefined;
  setActiveDataset: (dataset: Dataset) => void;
  mode: TaskMode;
}

export interface AnnotatedTextsListProps {
  activeAnnotatedDataset: AnnotatedDataset | null;
  activeProfilePoints: ProfilePoint[];
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | null) => void;
  setActiveProfilePoints: (points: ProfilePoint[]) => void;
}


export interface ReqProfilePoint {
  name: string;
  explanation: string;
  synonyms: string[];
  datatype: string;
  valueset: string[] | undefined;
  unit: string | undefined;
}

export interface ResDataPoint {
  name: string;
  value: string | number | undefined;
  match: number[] | undefined;
}

export interface TextAnnotationProps {
  activeAnnotatedDataset: AnnotatedDataset | undefined;
  setActiveAnnotatedDataset: (
    annotatedDataset: AnnotatedDataset | undefined
  ) => void;
  activeDataPointId: string | undefined;
  setActiveDataPointId: (dataPointId: string | undefined) => void;
  activeAnnotatedText: AnnotatedText | undefined;
}

export interface AnnotationDataPointListProps {
  activeAnnotatedDataset: AnnotatedDataset | undefined;
  setActiveAnnotatedDataset: (
    annotatedDataset: AnnotatedDataset | undefined
  ) => void;
  activeDataPointId: string | undefined;
  setActiveDataPointId: (dataPointId: string | undefined) => void;
  activeAnnotatedText: AnnotatedText | undefined;
  setActiveAnnotatedText: (annotatedText: AnnotatedText | undefined) => void;
}

export interface AnnotationDatasetListProps {
  activeAnnotatedDataset: AnnotatedDataset | undefined;
  setActiveAnnotatedDataset: (
    annotatedDataset: AnnotatedDataset | undefined
  ) => void;
}

export interface AnnotatedTextListProps {
  activeAnnotatedDataset: AnnotatedDataset | undefined;
  setActiveAnnotatedDataset: (
    annotatedDataset: AnnotatedDataset | undefined
  ) => void;
  activeAnnotatedText: AnnotatedText | undefined;
  setActiveAnnotatedText: (annotatedText: AnnotatedText | undefined) => void;
}

export interface TextSliceProps {
  text: string;
  startIndex: number;
  annotatedTextId: string | undefined;
  setActiveDataPointId: (dataPointId: string | undefined) => void;
  activeDataPointId: string | undefined;
}

export interface DataPointSliceProps {
  dataPoint: DataPoint;
  dataPoints: DataPoint[];
  text: string;
  activeDataPointId: string | undefined;
  setActiveDataPointId: (dataPointId: string | undefined) => void;
  activeProfilePoints: ProfilePoint[] | undefined;
  activeProfilePoint: ProfilePoint | undefined;
  activeDataPointValue: string;
  setActiveDataPointValue: (value: string) => void;
}

export interface LLMProviderSelectProps {
  provider: LLMProvider;
  setProvider: (provider: LLMProvider) => void;
}

export type LLMProvider = "openai" | "azure" | "custom";
