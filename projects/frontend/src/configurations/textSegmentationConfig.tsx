import { TASK_MODE } from "@/app/constants";
import {
  SegmentationProfilePoint,
  SegmentationProfilePointCreate,
} from "@/lib/db/db";
import {
  readSegmentationProfilePointsByProfile,
  createSegmentationProfilePoint,
  updateSegmentDataPoint,
} from "@/lib/db/crud";
import { TextDisplay } from "@/components/annotation/core/SegmentationTextDisplay";
import DataPointEditorSegmentation from "@/components/profiles/DataPointEditorSegmentation";
import {
  ModeConfiguration,
  LeftPanelProps,
  DataPointEditorProps,
} from "@/types/annotation";

// Wrapper components to adapt existing components to generic interfaces
const TextDisplayWrapper = (props: LeftPanelProps) => {
  return (
    <TextDisplay
      text={props.activeText?.text || ""}
      activeAnnotatedText={props.activeAnnotatedText}
      activeSegmentId={props.activeDataPointId}
      activeAnnotatedDataset={props.activeAnnotatedDataset}
      setActiveSegmentId={props.setActiveDataPointId}
      onUpdateSegment={props.onUpdateSegment}
      isReadOnly={props.isReadOnly || false}
    />
  );
};

const DataPointEditorSegmentationWrapper = (
  props: DataPointEditorProps<SegmentationProfilePoint>
) => {
  return (
    <DataPointEditorSegmentation
      activeProfile={props.activeProfile!}
      activeDataPoint={props.activeDataPoint!}
      setActiveDataPoint={props.setActiveDataPoint}
      creatingNewDataPoint={props.creatingNewDataPoint}
      setCreatingNewDataPoint={props.setCreatingNewDataPoint}
    />
  );
};

export const textSegmentationConfig: ModeConfiguration<SegmentationProfilePoint> =
  {
    mode: TASK_MODE.TEXT_SEGMENTATION,
    crudOperations: {
      readProfilePoints: (profileId: string | undefined) =>
        profileId
          ? readSegmentationProfilePointsByProfile(profileId)
          : Promise.resolve([]),
      createProfilePoint: (point: SegmentationProfilePointCreate) =>
        createSegmentationProfilePoint(point),
      updateProfilePoint: updateSegmentDataPoint,
    },
    components: {
      LeftPanel: TextDisplayWrapper,
      DataPointEditor: DataPointEditorSegmentationWrapper,
    },
    identifiers: {
      activeDataPointKey: "activeSegmentId",
    },
  };
