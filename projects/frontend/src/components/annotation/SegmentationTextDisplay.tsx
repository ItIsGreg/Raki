import { useMemo, useCallback, useState, useEffect } from "react";
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

  useEffect(() => {
    if (activeSegmentId) {
      // Find the element with the active segment ID
      const activeElement = document.querySelector(
        `[data-segment-id="${activeSegmentId}"]`
      );
      if (activeElement) {
        // Scroll the element into view with smooth behavior
        activeElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }
  }, [activeSegmentId]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      return;
    }

    const selectedText = selection.toString().trim();
    // Get selection direction using improved method
    const isBackwardsSelection = isSelectionBackwards(selection);

    // Find the position of the selected text in the source text
    const startIndex = text.indexOf(selectedText);
    const endIndex = startIndex + selectedText.length;

    // First check if selection is completely within an existing segment
    const containingSegment = segments.find((segment) => {
      const segmentStart = segment.beginMatch?.[0] || 0;
      const segmentEnd = segment.endMatch?.[1] || 0;
      const isContained = startIndex >= segmentStart && endIndex <= segmentEnd;

      return isContained;
    });

    if (containingSegment && onUpdateSegment) {
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

      return hasOverlap;
    });

    if (
      overlappingSegment &&
      onUpdateSegment &&
      overlappingSegment.beginMatch &&
      overlappingSegment.endMatch
    ) {
      const segmentStart = overlappingSegment.beginMatch[0];
      const segmentEnd = overlappingSegment.endMatch[1];

      if (!isBackwardsSelection) {
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
          newStartIndex = endIndex + 1;
        } else if (endIndex > segmentEnd) {
          newEndIndex = startIndex - 1;
        } else {
          const distanceToStart = startIndex - segmentStart;
          const distanceToEnd = segmentEnd - endIndex;

          if (distanceToStart < distanceToEnd) {
            newEndIndex = startIndex - 1;
          } else {
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

      if (startIndex >= lastIndex && endIndex > startIndex) {
        lastIndex = endIndex + 1;
      }
    }
  }, [text, segments]);

  // Helper function to determine if selection is backwards
  const isSelectionBackwards = (selection: Selection): boolean => {
    if (!selection.anchorNode || !selection.focusNode) {
      return false;
    }

    if (selection.anchorNode === selection.focusNode) {
      return selection.anchorOffset > selection.focusOffset;
    } else {
      const comparison = selection.anchorNode.compareDocumentPosition(
        selection.focusNode
      );
      return !!(comparison & Node.DOCUMENT_POSITION_PRECEDING);
    }
  };

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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Select Segment</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectionInfo(null);
                      window.getSelection()?.removeAllRanges();
                    }}
                    className="h-6 w-6"
                  >
                    ✕
                  </Button>
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
