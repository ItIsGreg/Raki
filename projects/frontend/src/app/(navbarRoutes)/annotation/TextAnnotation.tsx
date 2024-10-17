import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TextAnnotationProps } from "../../types";
import { useState, useMemo } from "react";
import { useAnnotationData } from "./hooks/useAnnotationData";
import { useKeyboardNavigation } from "./hooks/useKeyboardNavigation";
import { generateHighlightedText } from "./utils/textAnnotationUtils";

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

  const handleLogHighlightedText = () => {
    console.log("Highlighted Text:", highlightedText);
  };

  return (
    <div className="col-span-4 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle>Annotation</CardTitle>
          <div className="p-4">
            <Button onClick={handleLogHighlightedText}>
              Log Highlighted Text
            </Button>
          </div>
        </CardHeader>
        <CardContent className="whitespace-pre-wrap">
          {highlightedText.map((element, index) => (
            <span key={index}>{element}</span>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default TextAnnotation;
