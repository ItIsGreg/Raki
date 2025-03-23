import { useLiveQuery } from "dexie-react-hooks";
import {
  readDataPoint,
  readDataPointsByAnnotatedText,
  readProfile,
  readProfilePoint,
  readProfilePointsByProfile,
  readTextsByDataset,
} from "@/lib/db/crud";
import {
  AnnotatedDataset,
  AnnotatedText,
  DataPoint,
  Profile,
  ProfilePoint,
  Text,
} from "@/lib/db/db";

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
}

export const useAnnotationData = ({
  activeAnnotatedDataset,
  activeAnnotatedText,
  activeDataPointId,
}: UseAnnotationDataProps): AnnotationData => {
  const texts = useLiveQuery(
    () => readTextsByDataset(activeAnnotatedDataset?.datasetId),
    [activeAnnotatedDataset]
  );

  const dataPoints = useLiveQuery(
    () => readDataPointsByAnnotatedText(activeAnnotatedText?.id),
    [activeAnnotatedText]
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
    [activeAnnotatedDataset]
  );

  const activeDataPoint = useLiveQuery(
    () => readDataPoint(activeDataPointId),
    [activeDataPointId]
  );

  const activeProfilePoints = useLiveQuery(
    () => readProfilePointsByProfile(activeProfile?.id),
    [activeProfile]
  );

  const activeProfilePoint = useLiveQuery(
    () => readProfilePoint(activeDataPoint?.profilePointId),
    [activeDataPoint]
  );

  return {
    texts,
    dataPoints,
    activeProfile,
    activeDataPoint,
    activeProfilePoints,
    activeProfilePoint,
  };
};
