import { TASK_MODE } from "@/app/constants";
import { ProfilePoint, ProfilePointCreate } from "@/lib/db/db";
import { readProfilePointsByProfile, createProfilePoint } from "@/lib/db/crud";
import TextAnnotation from "@/components/annotation/TextAnnotation";
import DataPointEditor from "@/components/profiles/DataPointEditor";
import {
  ModeConfiguration,
  LeftPanelProps,
  DataPointEditorProps,
} from "@/types/annotation";

// Wrapper components to adapt existing components to generic interfaces
const TextAnnotationWrapper = (props: LeftPanelProps) => {
  return (
    <TextAnnotation
      activeAnnotatedDataset={props.activeAnnotatedDataset!}
      activeDataPointId={props.activeDataPointId}
      setActiveAnnotatedDataset={props.setActiveAnnotatedDataset}
      setActiveDataPointId={props.setActiveDataPointId}
      activeAnnotatedText={props.activeAnnotatedText}
      setActiveAnnotatedText={props.setActiveAnnotatedText}
      mode={props.mode}
      activeText={props.activeText}
      setActiveTab={props.setActiveTab}
      setActiveDataPoint={props.setActiveDataPoint}
    />
  );
};

const DataPointEditorWrapper = (props: DataPointEditorProps<ProfilePoint>) => {
  return (
    <DataPointEditor
      activeProfile={props.activeProfile!}
      activeDataPoint={props.activeDataPoint!}
      setActiveDataPoint={props.setActiveDataPoint}
      creatingNewDataPoint={props.creatingNewDataPoint}
      setCreatingNewDataPoint={props.setCreatingNewDataPoint}
    />
  );
};

export const dataPointExtractionConfig: ModeConfiguration<ProfilePoint> = {
  mode: TASK_MODE.DATAPOINT_EXTRACTION,
  crudOperations: {
    readProfilePoints: (profileId: string | undefined) =>
      profileId ? readProfilePointsByProfile(profileId) : Promise.resolve([]),
    createProfilePoint: (point: ProfilePointCreate) =>
      createProfilePoint(point),
  },
  components: {
    LeftPanel: TextAnnotationWrapper,
    DataPointEditor: DataPointEditorWrapper,
  },
  identifiers: {
    activeDataPointKey: "activeDataPointId",
  },
};
