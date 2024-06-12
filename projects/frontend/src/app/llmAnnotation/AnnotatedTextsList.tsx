import { useLiveQuery } from "dexie-react-hooks";
import { LLMAnnotationAnnotatedTextsListProps } from "../types";
import {
  createAnnotatedDataset,
  readAllAnnotatedDatasets,
  readAnnotatedTextsByAnnotatedDataset,
  readTextsByIds,
} from "@/lib/db/crud";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const AnnotatedTextsList = (props: LLMAnnotationAnnotatedTextsListProps) => {
  const { activeAnnotatedDataset } = props;
  const annotatedTexts = useLiveQuery(
    () => readAnnotatedTextsByAnnotatedDataset(activeAnnotatedDataset?.id),
    [activeAnnotatedDataset]
  );
  const texts = useLiveQuery(
    () => readTextsByIds(annotatedTexts?.map((at) => at.textId) || []),
    [annotatedTexts]
  );

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Annotated Texts</CardTitle>
          <CardDescription>{activeAnnotatedDataset?.name}</CardDescription>
        </CardHeader>
        <CardContent>
          {annotatedTexts?.map((annotatedText) => {
            return (
              <Card key={annotatedText.id}>
                <CardHeader>
                  <CardTitle>
                    {
                      texts?.find((text) => text.id === annotatedText.textId)
                        ?.filename
                    }
                  </CardTitle>
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
