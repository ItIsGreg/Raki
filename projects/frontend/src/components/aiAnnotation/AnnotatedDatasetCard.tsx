import { useLiveQuery } from "dexie-react-hooks";
import {
  AnnotatedDataset,
  ProfilePoint,
  SegmentationProfilePoint,
} from "@/lib/db/db";
import {
  deleteAnnotatedDataset,
  readAllAnnotatedTexts,
  readAllDatasets,
  readAllProfiles,
  readAllTexts,
} from "@/lib/db/crud";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DeleteButton from "@/components/DeleteButton";
import EditButton from "@/components/EditButton";
import DownloadButton from "./DownloadButton";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { TaskMode } from "@/app/constants";

interface AnnotatedDatasetCardProps<
  T extends ProfilePoint | SegmentationProfilePoint
> {
  dataset: AnnotatedDataset;
  isActive: boolean;
  annotationState: "idle" | "regular" | "faulty";
  onSelect: () => void;
  onStart: () => void;
  onStop: () => void;
  onEdit: () => void;
  mode: TaskMode;
}

export const AnnotatedDatasetCard = <
  T extends ProfilePoint | SegmentationProfilePoint
>({
  dataset,
  isActive,
  annotationState,
  onSelect,
  onStart,
  onStop,
  onEdit,
  mode,
}: AnnotatedDatasetCardProps<T>) => {
  const dbProfiles = useLiveQuery(() => readAllProfiles());
  const dbDatasets = useLiveQuery(() => readAllDatasets());
  const dbTexts = useLiveQuery(() => readAllTexts());
  const dbAnnotatedTexts = useLiveQuery(() => readAllAnnotatedTexts());

  const getActionText = () => {
    if (annotationState === "idle") {
      return mode === "datapoint_extraction"
        ? "Start Annotation"
        : "Start Segmentation";
    }

    const actionType = annotationState === "faulty" ? "Faulty " : "";
    return mode === "datapoint_extraction"
      ? `Stop ${actionType}Annotation`
      : `Stop ${actionType}Segmentation`;
  };

  const getProgressText = () => {
    return mode === "datapoint_extraction"
      ? "Annotating texts..."
      : "Segmenting texts...";
  };

  const getFaultyText = () => {
    return mode === "datapoint_extraction"
      ? "Re-Annotating faulty texts..."
      : "Re-Segmenting faulty texts...";
  };

  return (
    <Card
      data-cy="annotated-dataset-card"
      className={`${
        isActive && "bg-gray-100 shadow-lg border-black border-2"
      } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
      onClick={onSelect}
    >
      <CardHeader className="flex flex-row gap-2">
        <CardTitle data-cy="dataset-title">{dataset.name}</CardTitle>
        <div className="flex-grow"></div>
        <EditButton data-cy="edit-dataset-button" onClick={onEdit} />
        <DownloadButton data-cy="download-dataset-button" dataset={dataset} />
        <DeleteButton
          data-cy="delete-dataset-button"
          onDelete={() => deleteAnnotatedDataset(dataset.id)}
          itemName={
            mode === "datapoint_extraction"
              ? "annotated dataset"
              : "segmentation dataset"
          }
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          {dbProfiles && (
            <CardDescription data-cy="profile-description">
              {mode === "datapoint_extraction"
                ? "Profile: "
                : "Segmentation Profile: "}
              {
                dbProfiles.find((profile) => profile.id === dataset.profileId)
                  ?.name
              }
            </CardDescription>
          )}
          <div className="flex-grow"></div>
          {dbDatasets && (
            <CardDescription data-cy="dataset-description">
              Dataset:{" "}
              {
                dbDatasets.find(
                  (dbDataset) => dbDataset.id === dataset.datasetId
                )?.name
              }
            </CardDescription>
          )}
          <div className="flex-grow"></div>
        </div>
        <CardDescription data-cy="dataset-description-text">
          Description: {dataset.description}
        </CardDescription>
        {dbTexts && dbAnnotatedTexts && (
          <>
            <CardDescription data-cy="annotated-texts-count">
              {mode === "datapoint_extraction" ? "Annotated" : "Segmented"}{" "}
              Texts:{" "}
              {
                dbAnnotatedTexts.filter(
                  (text) => text.annotatedDatasetId === dataset.id
                ).length
              }{" "}
              /{" "}
              {
                dbTexts.filter((text) => text.datasetId === dataset.datasetId)
                  .length
              }
            </CardDescription>
            <CardDescription data-cy="faulty-texts-count">
              Faulty{" "}
              {mode === "datapoint_extraction" ? "Annotations" : "Segments"}:{" "}
              {
                dbAnnotatedTexts.filter(
                  (text) =>
                    text.annotatedDatasetId === dataset.id &&
                    text.aiFaulty === true
                ).length
              }
            </CardDescription>
          </>
        )}
        {isActive &&
          dbTexts &&
          dbAnnotatedTexts &&
          annotationState === "regular" && (
            <Progress
              data-cy="annotation-progress"
              value={
                (dbAnnotatedTexts.filter(
                  (text) => text.annotatedDatasetId === dataset.id
                ).length /
                  dbTexts.filter((text) => text.datasetId === dataset.datasetId)
                    .length) *
                100
              }
              className="w-full bg-green-200"
            />
          )}
        {isActive && (
          <>
            {annotationState === "idle" ? (
              <Button data-cy="start-annotation-button" onClick={onStart}>
                {getActionText()}
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Button
                  data-cy="stop-annotation-button"
                  onClick={onStop}
                  className="w-full"
                >
                  {getActionText()}
                </Button>
                <div
                  className="flex items-center gap-2"
                  data-cy="annotation-status"
                >
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-500">
                    {annotationState === "regular"
                      ? getProgressText()
                      : getFaultyText()}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
