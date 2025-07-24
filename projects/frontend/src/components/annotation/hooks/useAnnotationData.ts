import { useLiveQuery } from "dexie-react-hooks";
import {
  readDataPoint,
  readDataPointsByAnnotatedText,
  readProfile,
  readProfilePoint,
  readProfilePointsByProfile,
  readTextsByDataset,
  readAnnotatedTextsByAnnotatedDataset,
} from "@/lib/db/crud";
import {
  AnnotatedDataset,
  AnnotatedText,
  DataPoint,
  Profile,
  ProfilePoint,
  Text,
} from "@/lib/db/db";
import { useWorkspaceIntegration } from "@/hooks/useWorkspaceIntegration";

interface UseAnnotationDataProps {
  activeAnnotatedDataset: AnnotatedDataset | undefined;
  activeAnnotatedText: AnnotatedText | undefined;
  activeDataPointId: string | undefined;
}

interface AnnotationData {
  texts: Text[] | undefined;
  dataPoints: DataPoint[] | undefined;
  activeProfile: Profile | undefined;
  activeDataPoint: DataPoint | undefined;
  activeProfilePoints: ProfilePoint[] | undefined;
  activeProfilePoint: ProfilePoint | undefined;
  annotatedTexts: AnnotatedText[] | undefined;
}

export const useAnnotationData = ({
  activeAnnotatedDataset,
  activeAnnotatedText,
  activeDataPointId,
}: UseAnnotationDataProps): AnnotationData => {
  // Get workspace integration to be aware of workspace changes
  const { activeWorkspace } = useWorkspaceIntegration();
  
  const texts = useLiveQuery(
    () => readTextsByDataset(activeAnnotatedDataset?.datasetId),
    [activeAnnotatedDataset, activeWorkspace?.id]
  );

  const annotatedTexts = useLiveQuery(
    () => readAnnotatedTextsByAnnotatedDataset(activeAnnotatedDataset?.id),
    [activeAnnotatedDataset, activeWorkspace?.id]
  );

  const dataPoints = useLiveQuery(
    () => readDataPointsByAnnotatedText(activeAnnotatedText?.id),
    [activeAnnotatedText, activeWorkspace?.id]
  )?.sort((a, b) => {
    if (a.match && b.match) {
      return a.match[0] - b.match[0];
    } else if (a.match) {
      return -1;
    } else if (b.match) {
      return 1;
    }
    return 0;
  });

  const activeProfile = useLiveQuery(
    () => readProfile(activeAnnotatedDataset?.profileId),
    [activeAnnotatedDataset, activeWorkspace?.id]
  );

  const activeDataPoint = useLiveQuery(
    () => readDataPoint(activeDataPointId),
    [activeDataPointId, activeWorkspace?.id]
  );

  const activeProfilePoints = useLiveQuery(
    () => readProfilePointsByProfile(activeProfile?.id),
    [activeProfile, activeWorkspace?.id]
  );

  const activeProfilePoint = useLiveQuery(
    () => readProfilePoint(activeDataPoint?.profilePointId),
    [activeDataPoint, activeWorkspace?.id]
  );

  return {
    texts,
    dataPoints,
    activeProfile,
    activeDataPoint,
    activeProfilePoints,
    activeProfilePoint,
    annotatedTexts,
  };
};
