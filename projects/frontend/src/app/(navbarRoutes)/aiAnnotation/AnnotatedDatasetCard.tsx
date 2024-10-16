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
import { TiDeleteOutline, TiDownloadOutline } from "react-icons/ti";
import { downloadAnnotatedDataset } from "./annotationUtils";

interface AnnotatedDatasetCardProps {
  dataset: AnnotatedDataset;
  isActive: boolean;
  isRunning: boolean;
  onSelect: () => void;
  onStart: () => void;
  onStop: () => void;
}

export const AnnotatedDatasetCard = ({
  dataset,
  isActive,
  isRunning,
  onSelect,
  onStart,
  onStop,
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
        <TiDownloadOutline
          className="hover:text-gray-500 cursor-pointer mr-2"
          size={24}
          onClick={(e) => {
            e.stopPropagation();
            downloadAnnotatedDataset(dataset);
          }}
        />
        <TiDeleteOutline
          className="hover:text-red-500 cursor-pointer"
          size={24}
          onClick={(e) => {
            e.stopPropagation();
            deleteAnnotatedDataset(dataset.id);
          }}
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
        )}
        {!isRunning ? (
          <Button onClick={onStart}>Start Annotation</Button>
        ) : (
          <Button onClick={onStop}>Stop Annotation</Button>
        )}
      </CardContent>
    </Card>
  );
};
