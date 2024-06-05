import {
  AnnotatedDataset,
  Dataset,
  Profile,
  ProfilePoint,
  Text,
} from "@/lib/db/db";
import LLMAnnotation from "./llmAnnotation/page";

export interface ProfileListProps {
  activeProfile: Profile | undefined;
  setActiveProfile: (profile: Profile) => void;
}

export interface DataPointListProps {
  activeProfile: Profile | undefined;
  setActiveDataPoint: (dataPoint: ProfilePoint | undefined) => void;
  setCreatingNewDataPoint: (creating: boolean) => void;
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
}

export interface LLMAnnotationAnnotatedDatasetListProps {
  activeAnnotatedDataset: AnnotatedDataset | undefined;
  setActiveAnnotatedDataset: (
    annotatedDataset: AnnotatedDataset | undefined
  ) => void;
}

export interface LLMAnnotationAnnotatedTextsListProps {
  activeAnnotatedDataset: AnnotatedDataset | undefined;
}
