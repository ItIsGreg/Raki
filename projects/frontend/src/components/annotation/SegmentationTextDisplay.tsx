import { useMemo, useCallback, useState } from "react";
import { SegmentDataPoint } from "@/lib/db/db";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { v4 as uuidv4 } from "uuid";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface TextDisplayProps {
  isMarkdownEnabled: boolean;
  text: string;
  segments: SegmentDataPoint[];
  activeSegmentId?: string;
  setActiveSegmentId: (id: string | undefined) => void;
  onUpdateSegment?: (segment: SegmentDataPoint) => void;
}

export const TextDisplay = ({
  isMarkdownEnabled,
  text,
  segments,
  activeSegmentId,
  setActiveSegmentId,
  onUpdateSegment,
}: TextDisplayProps) => {
  const [selectionInfo, setSelectionInfo] = useState<{
    startIndex: number;
    endIndex: number;
    text: string;
  } | null>(null);

  const handleTextSelection = useCallback(() => {
    console.log("Text selection event triggered");
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      console.log("No valid selection found");
      return;
    }

    const selectedText = selection.toString().trim();
    console.log("Selected text:", selectedText);

    // Find the position of the selected text in the source text
    const startIndex = text.indexOf(selectedText);
    if (startIndex === -1) {
      console.log("Selected text not found in source text");
      return;
    }
    const endIndex = startIndex + selectedText.length;

    console.log("Calculated indices:", { startIndex, endIndex });

    // Check if selection overlaps with any existing segment
    const overlappingSegment = segments.find((segment) => {
      const segmentStart = segment.beginMatch?.[0] || 0;
      const segmentEnd = (segment.endMatch?.[1] || 0) + 1;
      const overlaps =
        (startIndex >= segmentStart && startIndex < segmentEnd) ||
        (endIndex > segmentStart && endIndex <= segmentEnd) ||
        (startIndex <= segmentStart && endIndex >= segmentEnd);
      return overlaps;
    });

    if (overlappingSegment && onUpdateSegment) {
      console.log("Updating existing segment:", overlappingSegment.id);
      onUpdateSegment({
        ...overlappingSegment,
        beginMatch: [startIndex],
        endMatch: [endIndex],
      });
    } else {
      console.log("Creating new segment with selection info:", {
        startIndex,
        endIndex,
        text: selectedText,
      });
      setSelectionInfo({
        startIndex,
        endIndex,
        text: selectedText,
      });
    }
  }, [segments, onUpdateSegment, text]);

  const handleSegmentSelect = (segmentId: string) => {
    console.log("Segment selected:", segmentId);
    if (selectionInfo && onUpdateSegment) {
      const selectedSegment = segments.find((s) => s.id === segmentId);
      if (selectedSegment) {
        console.log("Updating segment with new selection:", {
          segmentId,
          selectionInfo,
        });
        onUpdateSegment({
          ...selectedSegment,
          beginMatch: [selectionInfo.startIndex, selectionInfo.endIndex - 1],
          endMatch: [selectionInfo.startIndex, selectionInfo.endIndex - 1],
        });
        setSelectionInfo(null);
      }
    } else {
      console.log("Missing required data for segment update:", {
        hasSelectionInfo: !!selectionInfo,
        hasOnUpdateSegment: !!onUpdateSegment,
      });
    }
  };

  const renderedContent = useMemo(() => {
    let lastIndex = 0;
    const textParts = [];
    let partCounter = 0;

    // First, filter out invalid segments
    const sortedSegments = [...segments]
      .filter(
        (
          segment
        ): segment is SegmentDataPoint & {
          beginMatch: number[];
          endMatch: number[];
        } => {
          return !!(segment.beginMatch && segment.endMatch);
        }
      )
      .sort((a, b) => {
        const aStart = a.beginMatch[0];
        const bStart = b.beginMatch[0];
        if (aStart === bStart) {
          return b.endMatch[1] - a.endMatch[1];
        }
        return aStart - bStart;
      })
      .filter((segment, index, array) => {
        // Filter out segments that are completely contained within previous segments
        if (index === 0) return true;
        const currentStart = segment.beginMatch?.[0] || 0;
        const currentEnd = (segment.endMatch?.[1] || 0) + 1; // Add 1 for inclusive end

        // Check if this segment is contained within any previous segment
        for (let i = 0; i < index; i++) {
          const prevStart = array[i].beginMatch?.[0] || 0;
          const prevEnd = (array[i].endMatch?.[1] || 0) + 1; // Add 1 for inclusive end
          if (currentStart >= prevStart && currentEnd <= prevEnd) {
            return false; // Skip this segment as it's contained within another
          }
        }
        return true;
      });

    for (const segment of sortedSegments) {
      const startIndex = segment.beginMatch?.[0] || 0;
      const endIndex = (segment.endMatch?.[1] || 0) + 1; // Add 1 to include end character

      // Add non-segment text before this segment
      if (startIndex > lastIndex) {
        const normalText = text.substring(lastIndex, startIndex);
        if (isMarkdownEnabled) {
          textParts.push(
            <div
              className="markdown-content"
              key={`text-${lastIndex}-${partCounter++}`}
            >
              <ReactMarkdown>{normalText}</ReactMarkdown>
            </div>
          );
        } else {
          textParts.push(
            <span key={`text-${lastIndex}-${partCounter++}`}>{normalText}</span>
          );
        }
      }

      // Only add segment if it starts after our last processed position
      if (startIndex >= lastIndex && endIndex > startIndex) {
        const segmentText = text.substring(startIndex, endIndex); // Now includes end character
        const isActive = segment.id === activeSegmentId;

        textParts.push(
          <div
            key={segment.id}
            className={`
              border-l-4 pl-3 pr-2 py-1 my-1 block relative group cursor-pointer
              ${
                isActive
                  ? "bg-blue-100 border-blue-400"
                  : "bg-yellow-100 border-yellow-400"
              }
              hover:bg-blue-50 transition-colors
            `}
            onClick={() =>
              setActiveSegmentId(isActive ? undefined : segment.id)
            }
            title={segment.name}
            data-segment-id={segment.id}
            role="button"
            tabIndex={0}
            aria-label={`Section: ${segment.name}`}
          >
            {isMarkdownEnabled ? (
              <ReactMarkdown>{segmentText}</ReactMarkdown>
            ) : (
              segmentText
            )}
            <span className="absolute top-0 left-0 bg-yellow-400 text-xs px-2 py-0.5 rounded-br font-medium text-yellow-800 opacity-90">
              {segment.name}
            </span>
          </div>
        );

        lastIndex = endIndex;
      }
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (isMarkdownEnabled) {
        textParts.push(
          <div
            className="markdown-content"
            key={`text-${lastIndex}-${partCounter++}`}
          >
            <ReactMarkdown>{remainingText}</ReactMarkdown>
          </div>
        );
      } else {
        textParts.push(
          <span key={`text-${lastIndex}-${partCounter++}`}>
            {remainingText}
          </span>
        );
      }
    }

    return <div className="whitespace-pre-wrap break-words">{textParts}</div>;
  }, [text, segments, isMarkdownEnabled, activeSegmentId, setActiveSegmentId]);

  return (
    <ScrollArea className="h-screen w-full">
      <Card>
        <CardHeader>
          <CardTitle>Text Segmentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            data-cy="text-display"
            onMouseUp={handleTextSelection}
            className="select-text"
          >
            {renderedContent}
          </div>
        </CardContent>
      </Card>

      {selectionInfo && (
        <TooltipProvider>
          <Tooltip open={true}>
            <TooltipTrigger asChild>
              <div
                className="absolute"
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="w-80">
              <Card>
                <CardHeader>
                  <CardTitle>Select Segment</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select onValueChange={handleSegmentSelect}>
                    <SelectTrigger>
                      <span>Choose a segment...</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {segments.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id}>
                            {segment.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </ScrollArea>
  );
};
