import { useMemo, useCallback, useState, useEffect } from "react";
import { SegmentDataPoint, AnnotatedText, AnnotatedDataset } from "@/lib/db/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
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
import {
  readProfile,
  readSegmentationProfilePointsByProfile,
  readSegmentDataPointsByAnnotatedText,
  deleteSegmentDataPoint,
} from "@/lib/db/crud";

interface TextDisplayProps {
  text: string;
  activeAnnotatedText?: AnnotatedText;
  activeAnnotatedDataset?: AnnotatedDataset;
  activeSegmentId?: string;
  setActiveSegmentId: (id: string | undefined) => void;
  onUpdateSegment?: (segment: SegmentDataPoint) => void;
}

export const TextDisplay = ({
  text,
  activeAnnotatedText,
  activeAnnotatedDataset,
  activeSegmentId,
  setActiveSegmentId,
  onUpdateSegment,
}: TextDisplayProps) => {
  const [selectionInfo, setSelectionInfo] = useState<{
    startIndex: number;
    endIndex: number;
    text: string;
    position?: { x: number; y: number };
    existingSegmentId?: string;
  } | null>(null);

  // Add state to track if Select should be open
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // Get segments from database
  const segments =
    useLiveQuery<SegmentDataPoint[]>(
      () => readSegmentDataPointsByAnnotatedText(activeAnnotatedText?.id),
      [activeAnnotatedText]
    ) || [];

  const activeProfile = useLiveQuery(
    () => readProfile(activeAnnotatedDataset?.profileId),
    [activeAnnotatedDataset]
  );

  const activeProfilePoints =
    useLiveQuery(
      () => readSegmentationProfilePointsByProfile(activeProfile?.id),
      [activeProfile]
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

  // Add useEffect for managing dropdown open state
  useEffect(() => {
    // Reset isSelectOpen when selectionInfo changes to null
    if (selectionInfo === null) {
      setIsSelectOpen(false);
      return;
    }

    // Auto-open select dropdown for all segments (both new and existing)
    if (selectionInfo) {
      // Short delay to ensure the select component is rendered
      const timer = setTimeout(() => {
        // Trigger a click on the select trigger to open it
        const selectTrigger = document.querySelector(
          "[data-cy='segment-select-trigger']"
        );
        if (selectTrigger && selectTrigger instanceof HTMLElement) {
          selectTrigger.click();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectionInfo]);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      return;
    }

    // Clear any existing selection info and reset state first
    setSelectionInfo(null);
    setIsSelectOpen(false);

    // Short delay to ensure state is cleared before setting new values
    setTimeout(() => {
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
        const isContained =
          startIndex >= segmentStart && endIndex <= segmentEnd;

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

      // Set selection info at the end
      setSelectionInfo({
        startIndex,
        endIndex,
        text: selectedText,
      });

      // Auto-open select dropdown for new segments
      setIsSelectOpen(true);
    }, 10);
  }, [text, segments, onUpdateSegment]);

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();

      // Get text selection
      const selection = window.getSelection();
      if (!selection || selection.toString().trim().length === 0) {
        return;
      }

      const selectedText = selection.toString().trim();

      // Find the position of the selected text in the source text
      const startIndex = text.indexOf(selectedText);
      const endIndex = startIndex + selectedText.length;

      if (startIndex === -1) {
        return;
      }

      // Set selection info with position data
      setSelectionInfo({
        startIndex,
        endIndex,
        text: selectedText,
        position: { x: e.clientX, y: e.clientY },
      });
    },
    [text]
  );

  const handleSegmentSelect = (segmentId: string) => {
    if (selectionInfo && onUpdateSegment) {
      const selectedSegment = segments.find((s) => s.id === segmentId);

      // If we don't have a selected segment, exit early
      if (!selectedSegment) return;

      if (selectionInfo.existingSegmentId) {
        // We're updating an existing segment
        const existingSegment = segments.find(
          (s) => s.id === selectionInfo.existingSegmentId
        );

        if (existingSegment) {
          // First, check if there's already a segment with the same profilePointId
          const existingSegmentWithSameProfilePoint = segments.find(
            (s) =>
              s.id !== existingSegment.id &&
              s.profilePointId === selectedSegment.profilePointId
          );

          if (existingSegmentWithSameProfilePoint) {
            // Update the existing segment with the same profile point instead of creating a new one
            console.log(
              "Updating existing segment with same profile point:",
              existingSegmentWithSameProfilePoint.id
            );

            // Update the existing segment with new position
            onUpdateSegment({
              ...existingSegmentWithSameProfilePoint,
              beginMatch: [
                selectionInfo.startIndex,
                selectionInfo.endIndex - 1,
              ],
              endMatch: [selectionInfo.startIndex, selectionInfo.endIndex - 1],
            });

            // Clear the original segment that was right-clicked
            if (
              existingSegment.profilePointId !== selectedSegment.profilePointId
            ) {
              // Only if the profile points are different
              if (
                activeProfilePoints.some(
                  (point) => point.id === existingSegment.profilePointId
                )
              ) {
                // If original segment has a corresponding profile point, just empty it
                onUpdateSegment({
                  ...existingSegment,
                  beginMatch: undefined,
                  endMatch: undefined,
                });
              } else {
                // If no corresponding profile point exists, delete it completely
                deleteSegmentDataPoint(existingSegment.id)
                  .then(() => {
                    console.log(
                      "Original segment deleted:",
                      existingSegment.id
                    );
                  })
                  .catch((error) => {
                    console.error("Error deleting original segment:", error);
                  });
              }
            }
          } else {
            // No existing segment with same profile point, update the current one
            onUpdateSegment({
              ...existingSegment,
              profilePointId: selectedSegment.profilePointId,
              name: selectedSegment.name,
            });
          }
        }
      } else {
        // We're creating a new segment or modifying selection
        // Check if there's already a segment with this profile point
        const existingSegmentForProfilePoint = segments.find(
          (s) => s.profilePointId === selectedSegment.profilePointId
        );

        if (existingSegmentForProfilePoint) {
          // Update existing segment instead of creating a new one
          onUpdateSegment({
            ...existingSegmentForProfilePoint,
            beginMatch: [selectionInfo.startIndex, selectionInfo.endIndex - 1],
            endMatch: [selectionInfo.startIndex, selectionInfo.endIndex - 1],
          });
        } else {
          // Create new segment as before
          onUpdateSegment({
            ...selectedSegment,
            beginMatch: [selectionInfo.startIndex, selectionInfo.endIndex - 1],
            endMatch: [selectionInfo.startIndex, selectionInfo.endIndex - 1],
          });
        }
      }

      setIsSelectOpen(false);
      setSelectionInfo(null);
    }
  };

  const handleDeleteSegment = () => {
    if (selectionInfo?.existingSegmentId && onUpdateSegment) {
      const existingSegment = segments.find(
        (s) => s.id === selectionInfo.existingSegmentId
      );

      if (existingSegment) {
        // Check if segment has a corresponding profile point
        const hasCorrespondingProfilePoint = activeProfilePoints.some(
          (point) => point.id === existingSegment.profilePointId
        );

        if (hasCorrespondingProfilePoint) {
          // If it has a corresponding profile point, just empty the segment
          onUpdateSegment({
            ...existingSegment,
            beginMatch: undefined,
            endMatch: undefined,
          });
        } else {
          // If no corresponding profile point exists, delete the segment completely
          // using the deleteSegmentDataPoint function from crud
          deleteSegmentDataPoint(existingSegment.id)
            .then(() => {
              console.log("Segment deleted successfully:", existingSegment.id);
            })
            .catch((error) => {
              console.error("Error deleting segment:", error);
            });
        }
      }

      setIsSelectOpen(false);
      setSelectionInfo(null);
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
            onMouseDown={(e) => {
              // Prevent text selection on right-click
              if (e.button === 2) {
                e.preventDefault();
              }
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Clear any existing selection
              window.getSelection()?.removeAllRanges();

              // Reset state first
              setSelectionInfo(null);
              setIsSelectOpen(false);

              // Add slight delay before setting new state
              setTimeout(() => {
                setSelectionInfo({
                  startIndex,
                  endIndex,
                  text: segmentText,
                  position: { x: e.clientX, y: e.clientY },
                  existingSegmentId: segment.id,
                });
                // Always set to true to trigger opening the select dropdown
                setIsSelectOpen(true);
              }, 10);
            }}
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
                  left: selectionInfo.position
                    ? selectionInfo.position.x
                    : "50%",
                  top: selectionInfo.position
                    ? selectionInfo.position.y
                    : "50%",
                  transform: selectionInfo.position
                    ? "none"
                    : "translate(-50%, -50%)",
                }}
              />
            </TooltipTrigger>
            <TooltipContent side="right" className="w-80">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>
                    {selectionInfo.existingSegmentId
                      ? "Update Segment"
                      : "Select Segment"}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setIsSelectOpen(false);
                      setSelectionInfo(null);
                      window.getSelection()?.removeAllRanges();
                    }}
                    className="h-6 w-6"
                  >
                    ✕
                  </Button>
                </CardHeader>
                <CardContent>
                  {activeProfilePoints && activeProfilePoints.length > 0 ? (
                    <>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Select
                            onValueChange={handleSegmentSelect}
                            onOpenChange={setIsSelectOpen}
                          >
                            <SelectTrigger data-cy="segment-select-trigger">
                              <span>Choose a segment...</span>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {segments
                                  .filter((segment) =>
                                    activeProfilePoints.some(
                                      (point) =>
                                        point.id === segment.profilePointId
                                    )
                                  )
                                  .map((segment) => (
                                    <SelectItem
                                      key={segment.id}
                                      value={segment.id}
                                    >
                                      {segment.name}
                                    </SelectItem>
                                  ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>

                        {selectionInfo.existingSegmentId && (
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={handleDeleteSegment}
                            title="Delete Segment"
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-2 text-gray-500">
                      No profile points available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </ScrollArea>
  );
};
