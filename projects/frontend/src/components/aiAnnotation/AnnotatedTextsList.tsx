import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { reannotateFaultyText } from "./annotationUtils";
import { reannotateFaultySegmentationText } from "./segmentationAnnotationUtils";
import { useAnnotationState } from "./hooks/useAnnotationState";
import {
  AnnotatedDataset,
  ProfilePoint,
  SegmentationProfilePoint,
} from "@/lib/db/db";
import { TaskMode } from "@/app/constants";

interface AnnotatedTextsListProps<
  T extends ProfilePoint | SegmentationProfilePoint
> {
  activeAnnotatedDataset: AnnotatedDataset | null;
  activeProfilePoints: T[];
  setActiveAnnotatedDataset: (dataset: AnnotatedDataset | null) => void;
  setActiveProfilePoints: (points: T[]) => void;
  mode: TaskMode;
}

const AnnotatedTextsList = <T extends ProfilePoint | SegmentationProfilePoint>({
  activeAnnotatedDataset,
  activeProfilePoints,
  setActiveAnnotatedDataset,
  setActiveProfilePoints,
  mode,
}: AnnotatedTextsListProps<T>) => {
  const {
    dbApiKeys,
    dbAnnotatedTexts,
    dbTexts,
    dbBatchSize,
    dbLlmProvider,
    dbLlmModel,
    dbLlmUrl,
    dbMaxTokens,
  } = useAnnotationState<T>({
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
    autoRerunFaulty: true,
    mode,
  });

  const [rerunningTexts, setRerunningTexts] = useState<string[]>([]);

  const handleRerunFaultyText = async (annotatedText: any) => {
    setRerunningTexts([...rerunningTexts, annotatedText.id]);
    try {
      if (
        !activeAnnotatedDataset ||
        !activeProfilePoints ||
        !dbApiKeys ||
        !dbLlmProvider ||
        !dbLlmModel ||
        !dbLlmUrl ||
        !dbMaxTokens
      ) {
        throw new Error("Missing required parameters");
      }

      const reannotateFunction =
        mode === "datapoint_extraction"
          ? reannotateFaultyText
          : reannotateFaultySegmentationText;

      await reannotateFunction(
        annotatedText,
        activeProfilePoints as any, // Type assertion needed due to generic constraints
        dbLlmProvider[0].provider,
        dbLlmModel[0].name,
        dbLlmUrl[0].url,
        dbApiKeys[0].key,
        dbMaxTokens[0]?.value
      );
    } catch (error) {
      console.error("Error rerunning faulty text:", error);
      // You might want to show an error message to the user here
    } finally {
      setRerunningTexts(rerunningTexts.filter((id) => id !== annotatedText.id));
    }
  };

  // Add this sorting function
  const sortedAnnotatedTexts = dbAnnotatedTexts
    ?.filter(
      (annotatedText) =>
        annotatedText.annotatedDatasetId === activeAnnotatedDataset?.id
    )
    .sort((a, b) => {
      const filenameA =
        dbTexts?.find((text) => text.id === a.textId)?.filename || "";
      const filenameB =
        dbTexts?.find((text) => text.id === b.textId)?.filename || "";
      return filenameA.localeCompare(filenameB, undefined, {
        sensitivity: "base",
      });
    });

  const getListTitle = () => {
    switch (mode) {
      case "datapoint_extraction":
        return "Annotated Texts";
      case "text_segmentation":
        return "Segmented Texts";
      default:
        return "Texts";
    }
  };

  return (
    <div className="overflow-y-scroll" data-cy="annotated-texts-container">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle data-cy="annotated-texts-title">
              {getListTitle()}
            </CardTitle>
            <CardDescription data-cy="dataset-name">
              {activeAnnotatedDataset?.name}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {sortedAnnotatedTexts?.map((annotatedText) => {
            return (
              <Card key={annotatedText.id} data-cy="annotated-text-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle
                    className={annotatedText.aiFaulty ? "text-red-500" : ""}
                    data-cy="text-filename"
                  >
                    {
                      dbTexts?.find((text) => text.id === annotatedText.textId)
                        ?.filename
                    }
                  </CardTitle>
                  {annotatedText.aiFaulty &&
                    (rerunningTexts.includes(annotatedText.id) ? (
                      <Button disabled data-cy="rerunning-button">
                        <span className="animate-spin mr-2">&#9696;</span>
                        Rerunning...
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRerunFaultyText(annotatedText)}
                        data-cy="rerun-button"
                      >
                        Rerun
                      </Button>
                    ))}
                </CardHeader>
              </Card>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnnotatedTextsList;
