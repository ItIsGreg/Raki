import { useMemo, useCallback, useState } from "react";
import { SegmentDataPoint, AnnotatedText } from "@/lib/db/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
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
import { useLiveQuery } from "dexie-react-hooks";
import { readSegmentDataPointsByAnnotatedText } from "@/lib/db/crud";

interface TextDisplayProps {
  text: string;
  activeAnnotatedText?: AnnotatedText;
  activeSegmentId?: string;
  setActiveSegmentId: (id: string | undefined) => void;
  onUpdateSegment?: (segment: SegmentDataPoint) => void;
}

export const TextDisplay = ({
  text,
  activeAnnotatedText,
  activeSegmentId,
  setActiveSegmentId,
  onUpdateSegment,
}: TextDisplayProps) => {
  const [selectionInfo, setSelectionInfo] = useState<{
    startIndex: number;
    endIndex: number;
    text: string;
  } | null>(null);

  // Get segments from database
  const segments =
    useLiveQuery<SegmentDataPoint[]>(
      () => readSegmentDataPointsByAnnotatedText(activeAnnotatedText?.id),
      [activeAnnotatedText]
    ) || [];

  const handleTextSelection = useCallback(() => {
    console.log("Text selection event triggered");
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      console.log("No valid selection found");
      return;
    }

    const selectedText = selection.toString().trim();
    console.log("Selected text:", selectedText);

    // Get selection direction
    const range = selection.getRangeAt(0);
    const isForwardSelection = range.startOffset <= range.endOffset;
    console.log("Selection direction:", {
      isForward: isForwardSelection,
      startOffset: range.startOffset,
      endOffset: range.endOffset,
    });

    // Find the position of the selected text in the source text
    const startIndex = text.indexOf(selectedText);
    console.log("Found text at index:", startIndex);

    if (startIndex === -1) {
      console.log("Selected text not found in source text");
      console.log("Source text length:", text.length);
      console.log("Selected text length:", selectedText.length);
      return;
    }
    const endIndex = startIndex + selectedText.length;
    console.log("Selection range:", { startIndex, endIndex });

    // First check if selection is completely within an existing segment
    const containingSegment = segments.find((segment) => {
      const segmentStart = segment.beginMatch?.[0] || 0;
      const segmentEnd = segment.endMatch?.[1] || 0;
      const isContained = startIndex >= segmentStart && endIndex <= segmentEnd;

      console.log("Checking if selection is contained in segment:", {
        segmentId: segment.id,
        segmentName: segment.name,
        segmentStart,
        segmentEnd,
        isContained,
      });

      return isContained;
    });

    if (containingSegment && onUpdateSegment) {
      console.log("Selection is within existing segment, updating segment");
      onUpdateSegment({
        ...containingSegment,
        beginMatch: [startIndex, endIndex],
        endMatch: [startIndex, endIndex],
      });
      return;
    }

    // If not contained, check if selection overlaps with any segment
    const overlappingSegment = segments.find((segment) => {
      const segmentStart = segment.beginMatch?.[0] || 0;
      const segmentEnd = segment.endMatch?.[1] || 0;

      // Check if selection overlaps with segment
      const hasOverlap =
        (startIndex <= segmentEnd && endIndex >= segmentStart) ||
        (segmentStart <= endIndex && segmentEnd >= startIndex);

      console.log("Checking segment overlap:", {
        segmentId: segment.id,
        segmentName: segment.name,
        segmentStart,
        segmentEnd,
        hasOverlap,
      });

      return hasOverlap;
    });

    if (
      overlappingSegment &&
      onUpdateSegment &&
      overlappingSegment.beginMatch &&
      overlappingSegment.endMatch
    ) {
      console.log(
        "Selection overlaps with segment, handling based on direction"
      );
      const segmentStart = overlappingSegment.beginMatch[0];
      const segmentEnd = overlappingSegment.endMatch[1];

      if (isForwardSelection) {
        // Forward selection: expand the segment
        const newStartIndex = Math.min(startIndex, segmentStart);
        const newEndIndex = Math.max(endIndex, segmentEnd);
        onUpdateSegment({
          ...overlappingSegment,
          beginMatch: [newStartIndex, newEndIndex],
          endMatch: [newStartIndex, newEndIndex],
        });
      } else {
        // Backward selection: subtract the overlapping part
        let newStartIndex = segmentStart;
        let newEndIndex = segmentEnd;

        if (startIndex < segmentStart) {
          // Selection starts before segment
          newStartIndex = endIndex + 1;
        } else if (endIndex > segmentEnd) {
          // Selection ends after segment
          newEndIndex = startIndex - 1;
        } else {
          // Selection is within segment
          if (startIndex - segmentStart < segmentEnd - endIndex) {
            // Selection is closer to start
            newEndIndex = startIndex - 1;
          } else {
            // Selection is closer to end
            newStartIndex = endIndex + 1;
          }
        }

        // Only update if the resulting segment is valid
        if (newStartIndex < newEndIndex) {
          onUpdateSegment({
            ...overlappingSegment,
            beginMatch: [newStartIndex, newEndIndex],
            endMatch: [newStartIndex, newEndIndex],
          });
        } else {
          console.log("Resulting segment would be invalid, skipping update");
        }
      }
      return;
    }

    setSelectionInfo({
      startIndex,
      endIndex,
      text: selectedText,
    });
  }, [text, segments, onUpdateSegment]);

  const handleSegmentSelect = (segmentId: string) => {
    if (selectionInfo && onUpdateSegment) {
      const selectedSegment = segments.find((s) => s.id === segmentId);
      if (selectedSegment) {
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
      });

    for (const segment of sortedSegments) {
      const startIndex = segment.beginMatch[0];
      const endIndex = segment.endMatch[1];

      // Add non-segment text before this segment
      if (startIndex > lastIndex) {
        const normalText = text.substring(lastIndex, startIndex);
        textParts.push(
          <span key={`text-${lastIndex}-${partCounter++}`}>{normalText}</span>
        );
      }

      // Only add segment if it starts after our last processed position
      if (startIndex >= lastIndex && endIndex > startIndex) {
        const segmentText = text.substring(startIndex, endIndex + 1);
        const isActive = segment.id === activeSegmentId;

        textParts.push(
          <span
            key={segment.id}
            className={`
              border-l-4 pl-3 pr-2 py-1 my-1 relative group cursor-pointer
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
            {segmentText}
          </span>
        );

        lastIndex = endIndex + 1;
      }
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      textParts.push(
        <span key={`text-${lastIndex}-${partCounter++}`}>{remainingText}</span>
      );
    }

    return <div className="whitespace-pre-wrap break-words">{textParts}</div>;
  }, [text, segments, activeSegmentId, setActiveSegmentId]);

  const logTextParts = useCallback(() => {
    console.log("=== Text Parts Debug ===");
    console.log("Full text length:", text.length);

    let lastIndex = 0;
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
      });

    for (const segment of sortedSegments) {
      const startIndex = segment.beginMatch[0];
      const endIndex = segment.endMatch[1];

      // Log non-segment text before this segment
      if (startIndex > lastIndex) {
        const normalText = text.substring(lastIndex, startIndex);
        console.log("Normal text:", {
          start: lastIndex,
          end: startIndex,
          text: normalText,
        });
      }

      // Log segment text
      if (startIndex >= lastIndex && endIndex > startIndex) {
        const segmentText = text.substring(startIndex, endIndex + 1);
        console.log("Segment:", {
          id: segment.id,
          name: segment.name,
          start: startIndex,
          end: endIndex + 1,
          text: segmentText,
        });
        lastIndex = endIndex + 1;
      }
    }

    // Log remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      console.log("Remaining text:", {
        start: lastIndex,
        end: text.length,
        text: remainingText,
      });
    }
  }, [text, segments]);

  return (
    <ScrollArea className="h-screen w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Text Segmentation</CardTitle>
          <Button variant="outline" size="sm" onClick={logTextParts}>
            Debug Text Parts
          </Button>
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
