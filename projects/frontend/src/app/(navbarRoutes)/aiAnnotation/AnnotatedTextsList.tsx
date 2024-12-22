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
import { useAnnotationState } from "./hooks/useAnnotationState";
import { AnnotatedTextsListProps } from "@/app/types";

const AnnotatedTextsList = ({
  activeAnnotatedDataset,
  activeProfilePoints,
  setActiveAnnotatedDataset,
  setActiveProfilePoints,
}: AnnotatedTextsListProps) => {
  const {
    dbApiKeys,
    dbAnnotatedTexts,
    dbTexts,
    dbBatchSize,
    dbLlmProvider,
    dbLlmModel,
    dbLlmUrl,
    dbMaxTokens,
  } = useAnnotationState({
    activeAnnotatedDataset,
    activeProfilePoints,
    setActiveAnnotatedDataset,
    setActiveProfilePoints,
    autoRerunFaulty: true,
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
      await reannotateFaultyText(
        annotatedText,
        activeProfilePoints,
        dbLlmProvider[0].provider,
        dbLlmModel[0].name,
        dbLlmUrl[0].url,
        dbApiKeys[0].key,
        dbMaxTokens[0].value
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

  return (
    <div className="overflow-y-scroll">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Annotated Texts</CardTitle>
            <CardDescription>{activeAnnotatedDataset?.name}</CardDescription>
          </div>
          {/*           <Button onClick={() => console.log("Rerun Faulty Texts")}>
            Rerun Faulty Texts
          </Button> */}
        </CardHeader>
        <CardContent>
          {sortedAnnotatedTexts?.map((annotatedText) => {
            return (
              <Card key={annotatedText.id}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle
                    className={annotatedText.aiFaulty ? "text-red-500" : ""}
                  >
                    {
                      dbTexts?.find((text) => text.id === annotatedText.textId)
                        ?.filename
                    }
                  </CardTitle>
                  {annotatedText.aiFaulty &&
                    (rerunningTexts.includes(annotatedText.id) ? (
                      <Button disabled>
                        <span className="animate-spin mr-2">&#9696;</span>
                        Rerunning...
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRerunFaultyText(annotatedText)}
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
