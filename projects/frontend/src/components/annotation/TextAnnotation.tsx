import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo } from "react";
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
  } = props;

  const [activeDataPointValue, setActiveDataPointValue] = useState<string>("");

  const {
    texts,
    dataPoints,
    activeDataPoint,
    activeProfilePoints,
    activeProfilePoint,
  } = useAnnotationData({
    activeAnnotatedDataset,
    activeAnnotatedText,
    activeDataPointId,
  });

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
