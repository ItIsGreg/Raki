import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { useAnnotationData } from "./hooks/useAnnotationData";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { generateHighlightedText } from "./utils/textAnnotationUtils";
import { TextAnnotationProps } from "@/app/types";
import { Button } from "@/components/ui/button";
import { updateProfile, readProfile } from "@/lib/db/crud";
import { Profile } from "@/lib/db/db";

const TextAnnotation = (props: TextAnnotationProps) => {
  const {
    activeAnnotatedDataset,
    setActiveAnnotatedDataset,
    activeDataPointId,
    setActiveDataPointId,
    activeAnnotatedText,
    setActiveAnnotatedText,
  } = props;

  const [activeDataPointValue, setActiveDataPointValue] = useState<string>("");
  const [activeTooltipId, setActiveTooltipId] = useState<string | undefined>(
    undefined
  );

  const {
    texts,
    dataPoints,
    activeDataPoint,
    activeProfilePoints,
    activeProfilePoint,
    annotatedTexts,
  } = useAnnotationData({
    activeAnnotatedDataset,
    activeAnnotatedText,
    activeDataPointId,
  });

  const handleSaveAsExample = async () => {
    if (!activeAnnotatedText || !activeAnnotatedDataset || !dataPoints) return;

    const currentText = texts?.find(
      (text) => text.id === activeAnnotatedText.textId
    );
    if (!currentText) return;

    const exampleOutput: Record<string, string> = {};
    dataPoints.forEach((dp) => {
      if (dp.match) {
        // Extract the substring from the text using the match indices
        const [start, end] = dp.match;
        exampleOutput[dp.name] = currentText.text.slice(start, end);
      }
    });

    const profile = await readProfile(activeAnnotatedDataset.profileId);
    if (!profile) return;

    const updatedProfile: Profile = {
      ...profile,
      example: {
        text: currentText.text,
        output: exampleOutput,
      },
    };

    await updateProfile(updatedProfile);
  };

  useKeyboardNavigation({
    dataPoints,
    activeDataPoint,
    setActiveDataPointId,
    activeDataPointValue,
    setActiveDataPointValue,
    activeTooltipId,
    setActiveTooltipId,
    texts,
    activeAnnotatedText,
    annotatedTexts,
    setActiveAnnotatedText,
  });

  const highlightedText = useMemo(
    () =>
      generateHighlightedText({
        text:
          texts?.find((text) => text.id === activeAnnotatedText?.textId)
            ?.text ?? "",
        dataPoints: dataPoints ?? [],
        activeAnnotatedText,
        setActiveDataPointId,
        activeDataPointId,
        activeProfilePoints,
        activeProfilePoint,
        activeDataPointValue,
        setActiveDataPointValue,
        activeTooltipId,
        setActiveTooltipId,
      }),
    [
      texts,
      dataPoints,
      activeAnnotatedText,
      activeDataPointId,
      activeProfilePoints,
      activeProfilePoint,
      activeDataPointValue,
      setActiveDataPointId,
      activeTooltipId,
      setActiveTooltipId,
    ]
  );

  return (
    <div
      className="col-span-4 overflow-y-auto"
      data-cy="text-annotation-container"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle data-cy="text-annotation-title">Annotation</CardTitle>
          <Button
            onClick={handleSaveAsExample}
            variant="outline"
            disabled={
              !activeAnnotatedText || !activeAnnotatedDataset || !dataPoints
            }
          >
            Save as Example
          </Button>
        </CardHeader>
        <CardContent
          className="whitespace-pre-wrap"
          data-cy="text-annotation-content"
        >
          {highlightedText.map((element, index) => (
            <span key={index} data-cy="text-annotation-span">
              {element}
            </span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextAnnotation;
