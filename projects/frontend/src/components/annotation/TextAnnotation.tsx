import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { useAnnotationData } from "./hooks/useAnnotationData";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { generateHighlightedText } from "./utils/textAnnotationUtils";
import { TextAnnotationProps } from "@/app/types";

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

  // Handle keyboard navigation between texts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!texts || !activeAnnotatedText || !annotatedTexts) return;

      // Sort annotated texts alphabetically by filename, matching AnnotatedTextList's order
      const sortedAnnotatedTexts = annotatedTexts
        .map((annotatedText) => ({
          ...annotatedText,
          filename:
            texts.find((text) => text.id === annotatedText.textId)?.filename ||
            "",
        }))
        .sort((a, b) =>
          a.filename.localeCompare(b.filename, undefined, {
            sensitivity: "base",
          })
        );

      const currentIndex = sortedAnnotatedTexts.findIndex(
        (at) => at.id === activeAnnotatedText.id
      );

      if (event.key === "ArrowUp" && currentIndex > 0) {
        event.preventDefault();
        setActiveAnnotatedText(sortedAnnotatedTexts[currentIndex - 1]);
      } else if (
        event.key === "ArrowDown" &&
        currentIndex < sortedAnnotatedTexts.length - 1
      ) {
        event.preventDefault();
        setActiveAnnotatedText(sortedAnnotatedTexts[currentIndex + 1]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [texts, activeAnnotatedText, annotatedTexts, setActiveAnnotatedText]);

  useKeyboardNavigation({
    dataPoints,
    activeDataPoint,
    setActiveDataPointId,
    activeDataPointValue,
    setActiveDataPointValue,
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
    ]
  );

  return (
    <div
      className="col-span-4 overflow-y-auto"
      data-cy="text-annotation-container"
    >
      <Card>
        <CardHeader>
          <CardTitle data-cy="text-annotation-title">Annotation</CardTitle>
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
