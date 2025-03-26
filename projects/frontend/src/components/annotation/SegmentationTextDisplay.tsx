import { useMemo } from "react";
import { SegmentDataPoint } from "@/lib/db/db";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TextDisplayProps {
  isMarkdownEnabled: boolean;
  text: string;
  segments: SegmentDataPoint[];
  activeSegmentId?: string;
  setActiveSegmentId: (id: string | undefined) => void;
  onCreateSegment?: (begin: string, end: string) => void;
}

export const TextDisplay = ({
  isMarkdownEnabled,
  text,
  segments,
  activeSegmentId,
  setActiveSegmentId,
  onCreateSegment,
}: TextDisplayProps) => {
  // Render text with segments highlighted
  const renderedContent = useMemo(() => {
    let lastIndex = 0;
    const textParts = [];
    const sortedSegments = [...segments].sort(
      (a, b) => (a.beginMatch?.[0] || 0) - (b.beginMatch?.[0] || 0)
    );

    for (const segment of sortedSegments) {
      const startIndex = segment.beginMatch?.[0] || 0;
      const endIndex = segment.endMatch?.[0] || 0;

      if (startIndex > lastIndex) {
        const normalText = text.substring(lastIndex, startIndex);
        if (isMarkdownEnabled) {
          textParts.push(
            <div className="markdown-content" key={`text-${lastIndex}`}>
              <ReactMarkdown>{normalText}</ReactMarkdown>
            </div>
          );
        } else {
          textParts.push(<span key={`text-${lastIndex}`}>{normalText}</span>);
        }
      }

      if (startIndex >= 0 && endIndex > startIndex) {
        const segmentText = text.substring(startIndex, endIndex);
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
      }

      lastIndex = endIndex;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (isMarkdownEnabled) {
        textParts.push(
          <div className="markdown-content" key={`text-${lastIndex}`}>
            <ReactMarkdown>{remainingText}</ReactMarkdown>
          </div>
        );
      } else {
        textParts.push(<span key={`text-${lastIndex}`}>{remainingText}</span>);
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
          <div data-cy="text-display">{renderedContent}</div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
};
