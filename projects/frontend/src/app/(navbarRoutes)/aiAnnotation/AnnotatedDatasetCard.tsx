import { useLiveQuery } from "dexie-react-hooks";
import { AnnotatedDataset } from "@/lib/db/db";
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

interface AnnotatedDatasetCardProps {
  dataset: AnnotatedDataset;
  isActive: boolean;
  annotationState: "idle" | "regular" | "faulty";
  onSelect: () => void;
  onStart: () => void;
  onStop: () => void;
  onEdit: () => void;
}

export const AnnotatedDatasetCard = ({
  dataset,
  isActive,
  annotationState,
  onSelect,
  onStart,
  onStop,
  onEdit,
}: AnnotatedDatasetCardProps) => {
  const dbProfiles = useLiveQuery(() => readAllProfiles());
  const dbDatasets = useLiveQuery(() => readAllDatasets());
  const dbTexts = useLiveQuery(() => readAllTexts());
  const dbAnnotatedTexts = useLiveQuery(() => readAllAnnotatedTexts());

  return (
    <Card
      className={`${
        isActive && "bg-gray-100 shadow-lg border-black border-2"
      } transition-transform hover:bg-gray-100 hover:shadow-lg transform`}
      onClick={onSelect}
    >
      <CardHeader className="flex flex-row gap-2">
        <CardTitle>{dataset.name}</CardTitle>
        <div className="flex-grow"></div>
        <EditButton onClick={onEdit} />
        <DownloadButton dataset={dataset} />
        <DeleteButton
          onDelete={() => deleteAnnotatedDataset(dataset.id)}
          itemName="annotated dataset"
        />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-row gap-2">
          {dbProfiles && (
            <CardDescription>
              Profile:{" "}
              {
                dbProfiles.find((profile) => profile.id === dataset.profileId)
                  ?.name
              }
            </CardDescription>
          )}
          <div className="flex-grow"></div>
          {dbDatasets && (
            <CardDescription>
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
        <CardDescription>Description: {dataset.description}</CardDescription>
        {dbTexts && dbAnnotatedTexts && (
          <>
            <CardDescription>
              Annotated Texts:{" "}
              {
                dbAnnotatedTexts.filter((text) => {
                  return text.annotatedDatasetId === dataset.id;
                }).length
              }{" "}
              /{" "}
              {
                dbTexts.filter((text) => {
                  return text.datasetId === dataset.datasetId;
                }).length
              }
            </CardDescription>
            <CardDescription>
              Faulty Texts:{" "}
              {
                dbAnnotatedTexts.filter((text) => {
                  return (
                    text.annotatedDatasetId === dataset.id &&
                    text.aiFaulty === true
                  );
                }).length
              }
            </CardDescription>
          </>
        )}
        {isActive &&
          dbTexts &&
          dbAnnotatedTexts &&
          annotationState === "regular" && (
            <Progress
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
              <Button onClick={onStart}>Start Annotation</Button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Button onClick={onStop} className="w-full">
                  Stop {annotationState === "faulty" ? "Faulty " : ""}Annotation
                </Button>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-gray-500">
                    {annotationState === "regular"
                      ? "Annotating texts..."
                      : "Re-Annotating faulty texts..."}
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
