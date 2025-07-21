import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useMemo, useEffect } from "react";
import { useAnnotationData } from "../hooks/useAnnotationData";
import { useTextKeyboardNavigation } from "../hooks/useKeyboardNavigation";
import { generateHighlightedText } from "../utils/textAnnotationUtils";
import { TextAnnotationProps } from "@/app/types";
import { Button } from "@/components/ui/button";
import { updateProfile, readProfile } from "@/lib/db/crud";
import { Profile } from "@/lib/db/db";
import { TASK_MODE } from "@/app/constants";
import { RefreshCw, Menu, Settings, Home, FileText } from "lucide-react";
import { reannotateFaultyText } from "../utils/annotationUtils";
import { useAnnotationState } from "../hooks/useAnnotationState";
import { useSettings } from "@/contexts/SettingsContext";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TextAnnotation = (props: TextAnnotationProps) => {
  const {
    activeAnnotatedDataset,
    setActiveAnnotatedDataset,
    activeDataPointId,
    setActiveDataPointId,
    activeAnnotatedText,
    setActiveAnnotatedText,
    mode = "annotation",
    activeText,
    setActiveTab,
    setActiveDataPoint,
  } = props;

  const [activeDataPointValue, setActiveDataPointValue] = useState<string>("");
  const [activeTooltipId, setActiveTooltipId] = useState<string | undefined>(
    undefined
  );
  const [isReannotating, setIsReannotating] = useState(false);

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

  // Get LLM configuration from annotation state
  const { dbApiKeys, dbLlmProvider, dbLlmModel, dbLlmUrl, dbMaxTokens } =
    useAnnotationState({
      activeAnnotatedDataset: activeAnnotatedDataset || null,
      activeProfilePoints: activeProfilePoints || [],
      setActiveAnnotatedDataset: (dataset) =>
        setActiveAnnotatedDataset(dataset || undefined),
      setActiveProfilePoints: () => {}, // Not needed for this component
      autoRerunFaulty: true,
      mode: TASK_MODE.DATAPOINT_EXTRACTION,
    });

  const { setIsSettingsOpen } = useSettings();
  const router = useRouter();

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

  const handleReannotate = async () => {
    if (
      !activeAnnotatedText ||
      !activeProfilePoints ||
      !dbApiKeys ||
      !dbLlmProvider ||
      !dbLlmModel ||
      !dbLlmUrl ||
      !dbMaxTokens
    ) {
      return;
    }

    setIsReannotating(true);
    try {
      await reannotateFaultyText(
        activeAnnotatedText,
        activeProfilePoints,
        dbLlmProvider[0].provider,
        dbLlmModel[0].name,
        dbLlmUrl[0].url,
        dbApiKeys[0].key,
        dbMaxTokens[0]?.value
      );
    } catch (error) {
      console.error("Error reannotating text:", error);
    } finally {
      setIsReannotating(false);
    }
  };

  useTextKeyboardNavigation({
    texts,
    activeAnnotatedText,
    annotatedTexts,
    setActiveAnnotatedText,
    dataPoints,
    activeDataPoint,
    setActiveDataPointId,
    activeDataPointValue,
    setActiveDataPointValue,
    activeTooltipId,
    setActiveTooltipId,
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
        setActiveTab,
        setActiveDataPoint,
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
      setActiveTab,
      setActiveDataPoint,
    ]
  );

  if (mode === "display" && activeText) {
    return (
      <div
        className="col-span-4 overflow-y-auto"
        data-cy="text-display-container"
      >
        <Card>
          <CardHeader className="flex flex-row items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" data-cy="burger-menu">
                  <Menu className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" data-cy="burger-menu-content">
                <DropdownMenuItem
                  onClick={() => router.push("/")}
                  data-cy="menu-home"
                >
                  <Home className="mr-2 h-4 w-4" />
                  <span>Home</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/textSegmentation")}
                  data-cy="menu-text-segmentation"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Text Segmentation</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // Add delay to ensure DropdownMenu cleanup finishes first
                    setTimeout(() => setIsSettingsOpen(true), 100);
                  }}
                  data-cy="menu-setup"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Setup</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CardTitle
              data-cy="text-display-title"
              className="flex-1 text-center"
            >
              Text Display
            </CardTitle>
          </CardHeader>
          <CardContent
            className="whitespace-pre-wrap"
            data-cy="text-display-content"
          >
            {activeText.text}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="col-span-4 overflow-y-auto"
      data-cy="text-annotation-container"
    >
      <Card>
        <CardHeader className="flex flex-row items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" data-cy="burger-menu">
                <Menu className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" data-cy="burger-menu-content">
              <DropdownMenuItem
                onClick={() => router.push("/")}
                data-cy="menu-home"
              >
                <Home className="mr-2 h-4 w-4" />
                <span>Home</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/textSegmentation")}
                data-cy="menu-text-segmentation"
              >
                <FileText className="mr-2 h-4 w-4" />
                <span>Text Segmentation</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  // Add delay to ensure DropdownMenu cleanup finishes first
                  setTimeout(() => setIsSettingsOpen(true), 100);
                }}
                data-cy="menu-setup"
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Setup</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <CardTitle
            data-cy="text-annotation-title"
            className="flex-1 text-center"
          >
            Annotation
          </CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={handleSaveAsExample}
              variant="outline"
              disabled={
                !activeAnnotatedText || !activeAnnotatedDataset || !dataPoints
              }
              data-cy="save-example-button"
            >
              Save as Example
            </Button>
            <Button
              variant="outline"
              disabled={!activeAnnotatedText || isReannotating}
              data-cy="reannotate-button"
              size="icon"
              onClick={handleReannotate}
            >
              <RefreshCw
                className={`h-4 w-4 ${isReannotating ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
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
