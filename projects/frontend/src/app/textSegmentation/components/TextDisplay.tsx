import { memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";

interface TextDisplayProps {
  isTextConfirmed: boolean;
  isMarkdownEnabled: boolean;
  inputText: string;
  segments: Array<{
    id: string;
    text: string;
    name: string;
    startIndex: number;
    endIndex: number;
  }>;
  onTextSelection: () => void;
  setInputText: (text: string) => void;
  textareaRef: React.RefObject<HTMLDivElement>;
}

export const TextDisplay = memo(function TextDisplay({
  isTextConfirmed,
  isMarkdownEnabled,
  inputText,
  segments,
  onTextSelection,
  setInputText,
  textareaRef,
}: TextDisplayProps) {
  if (!isTextConfirmed) {
    return (
      <textarea
        className="w-full min-h-[200px] p-3 border rounded-md"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        placeholder="Enter or paste your text here..."
        data-cy="text-input"
      />
    );
  }

  const renderedText = useMemo(() => {
    console.log("[TextDisplay] Rendering segments:", {
      segmentCount: segments.length,
      totalTextLength: inputText.length,
    });

    let lastIndex = 0;
    const textParts = [];
    const sortedSegments = [...segments].sort(
      (a, b) => a.startIndex - b.startIndex
    );

    for (const segment of sortedSegments) {
      console.log("[TextDisplay] Processing segment:", {
        id: segment.id,
        name: segment.name,
        textLength: segment.text.length,
        startIndex: segment.startIndex,
        endIndex: segment.endIndex,
      });

      if (segment.startIndex > lastIndex) {
        const normalText = inputText.substring(lastIndex, segment.startIndex);
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

      textParts.push(
        <div
          key={segment.id}
          className="bg-yellow-100 border-l-4 border-yellow-400 pl-3 pr-2 py-1 my-1 block relative group cursor-pointer"
          title={segment.name}
          data-segment-id={segment.id}
          role="button"
          tabIndex={0}
          aria-label={`Section: ${segment.name}`}
        >
          {isMarkdownEnabled ? (
            <ReactMarkdown>{segment.text}</ReactMarkdown>
          ) : (
            segment.text
          )}
          <span className="absolute top-0 left-0 bg-yellow-400 text-xs px-2 py-0.5 rounded-br font-medium text-yellow-800 opacity-90">
            {segment.name}
          </span>
        </div>
      );

      lastIndex = segment.endIndex;
    }

    if (lastIndex < inputText.length) {
      const remainingText = inputText.substring(lastIndex);
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
  }, [inputText, segments, isMarkdownEnabled]);

  const handleTextSelection = () => {
    console.log("[TextDisplay] Text selection event triggered");
    onTextSelection();
  };

  return (
    <div
      ref={textareaRef}
      className="min-h-[200px] p-3 border rounded-md bg-white text-foreground leading-normal"
      tabIndex={0}
      onMouseUp={handleTextSelection}
      onKeyUp={handleTextSelection}
      data-cy="text-display"
    >
      {renderedText}
    </div>
  );
});
