"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";
import { v4 as uuidv4 } from "uuid";
import { Sidebar } from "./components/Sidebar";
import { TextDisplay } from "./components/TextDisplay";
import { getTextNodeOffset } from "./utils";

// Interface for our segments
interface Segment {
  id: string;
  name: string;
  text: string;
  startIndex: number;
  endIndex: number;
}

export default function TextSegmentation() {
  const [inputText, setInputText] = useState("");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [isTextConfirmed, setIsTextConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isMarkdownEnabled, setIsMarkdownEnabled] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showSectionNaming, setShowSectionNaming] = useState(false);
  const [sectionName, setSectionName] = useState("");

  // Add state for storing selection details
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    startIndex: number;
    endIndex: number;
  } | null>(null);

  // Reference to the textarea element
  const textareaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize PDF.js worker
  useEffect(() => {
    if (typeof window !== "undefined") {
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.mjs";
    }
  }, []);

  // Handle PDF file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is a PDF
    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      const textContent = await extractTextFromPDF(file);
      setInputText(textContent);
      setIsLoading(false);
    } catch (error) {
      console.error("Error extracting text from PDF:", error);
      alert("Failed to extract text from PDF");
      setIsLoading(false);
    }
  };

  // Function to extract text from PDF with improved formatting
  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // Group text items by their vertical position to detect paragraphs
      const textItems = textContent.items;
      const lines: Record<string, Array<any>> = {};

      // Group by y-position (rounded to handle slight variations)
      textItems.forEach((item: any) => {
        if (!item.str) return;

        // Round to nearest 3 pixels to group lines
        const yPos = Math.round(item.transform[5] / 3) * 3;
        if (!lines[yPos]) lines[yPos] = [];
        lines[yPos].push(item);
      });

      // Sort line positions from top to bottom (reverse, as PDF coords start from bottom)
      const sortedLineKeys = Object.keys(lines)
        .map(Number)
        .sort((a, b) => b - a);

      // Process each line
      let lastX = -1;
      let lastY = -1;
      let pageText = "";

      sortedLineKeys.forEach((yPos) => {
        // Sort items in the line by x position
        const lineItems = lines[yPos].sort(
          (a: any, b: any) => a.transform[4] - b.transform[4]
        );
        let lineText = "";

        lineItems.forEach((item: any) => {
          // Add appropriate spacing between words based on position
          const x = item.transform[4];

          // Detect if this is a new paragraph - significant y-distance from last line
          if (lastY !== -1 && Math.abs(lastY - yPos) > 15) {
            pageText += "\n\n"; // Double newline for paragraph break
          } else if (lastX !== -1) {
            // Add space if needed between words on same line
            const spaceWidth = item.width || 5; // Estimate word spacing
            if (x - lastX > spaceWidth * 0.5) {
              lineText += " ";
            }
          }

          lineText += item.str;
          lastX = x + (item.width || 0);
        });

        pageText += lineText.trim() + "\n";
        lastY = yPos;
      });

      // Clean up the text
      pageText = pageText
        .replace(/\n{3,}/g, "\n\n") // Replace excessive newlines
        .replace(/\s{2,}/g, " ") // Replace multiple spaces with single space
        .trim();

      fullText += pageText + "\n\n" + "—".repeat(30) + "\n\n"; // Page separator
    }

    // Final cleanup
    fullText = fullText.trim();

    return fullText;
  };

  // Trigger file input click
  const openFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    if (isTextConfirmed && !isLoading) {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        const selText = selection.toString();

        try {
          const range = selection.getRangeAt(0);
          const container = textareaRef.current;

          if (container) {
            const tempRange = document.createRange();
            tempRange.setStart(container, 0);
            tempRange.setEnd(range.startContainer, range.startOffset);
            const startIndex = tempRange.toString().length;
            const endIndex = startIndex + selText.length;

            console.log("[TextSegmentation] Text selected:", {
              length: selText.length,
              startIndex,
              endIndex,
              preview:
                selText.substring(0, 50) + (selText.length > 50 ? "..." : ""),
            });

            // Store selection info
            setSelectionInfo({
              text: selText,
              startIndex,
              endIndex,
            });
            setSelectedText(selText);
            setShowSectionNaming(true);
          }
        } catch (error) {
          console.error(
            "[TextSegmentation] Error processing selection:",
            error
          );
        }
      }
    }
  }, [isTextConfirmed, isLoading]);

  // Create a new segment from selection
  const createSegment = useCallback(() => {
    if (selectionInfo && sectionName && textareaRef.current) {
      console.log("[TextSegmentation] Creating new segment:", {
        sectionName,
        textLength: selectionInfo.text.length,
        preview:
          selectionInfo.text.substring(0, 50) +
          (selectionInfo.text.length > 50 ? "..." : ""),
      });

      const newSegment = {
        id: uuidv4(),
        text: selectionInfo.text,
        name: sectionName,
        startIndex: selectionInfo.startIndex,
        endIndex: selectionInfo.endIndex,
      };

      console.log("[TextSegmentation] Adding new segment to state:", {
        id: newSegment.id,
        name: newSegment.name,
        startIndex: selectionInfo.startIndex,
        endIndex: selectionInfo.endIndex,
        textPreview:
          newSegment.text.substring(0, 50) +
          (newSegment.text.length > 50 ? "..." : ""),
      });

      setSegments((prevSegments) => {
        const updatedSegments = [...prevSegments, newSegment];
        console.log("[TextSegmentation] Updated segments array:", {
          previousCount: prevSegments.length,
          newCount: updatedSegments.length,
        });
        return updatedSegments;
      });

      // Clear the selection states
      setSelectionInfo(null);
      setSectionName("");
      setSelectedText("");
      setShowSectionNaming(false);
    } else {
      console.warn(
        "[TextSegmentation] Missing required data for segment creation:",
        {
          hasSelectionInfo: Boolean(selectionInfo),
          hasSectionName: Boolean(sectionName),
          hasTextareaRef: Boolean(textareaRef.current),
        }
      );
    }
  }, [selectionInfo, sectionName]);

  const cancelSegmentCreation = () => {
    console.log("[TextSegmentation] Segment creation cancelled");
    setSelectionInfo(null);
    setSelectedText("");
    setSectionName("");
    setShowSectionNaming(false);
  };

  // Reset everything
  const resetSegmentation = () => {
    console.log("[TextSegmentation] Resetting all segmentation");
    setIsTextConfirmed(false);
    setSegments([]);
    setSelectionInfo(null);
    setFileName("");
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4">
        <TextDisplay
          isTextConfirmed={isTextConfirmed}
          isMarkdownEnabled={isMarkdownEnabled}
          inputText={inputText}
          segments={segments}
          onTextSelection={handleTextSelection}
          setInputText={setInputText}
          textareaRef={textareaRef}
        />

        {!isTextConfirmed && inputText && (
          <Button onClick={() => setIsTextConfirmed(true)} className="mt-4">
            Confirm Text
          </Button>
        )}

        <div className="flex justify-end space-x-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setSegments([])}
            data-cy="reset-button"
          >
            Reset
          </Button>
        </div>
      </div>

      <Sidebar
        isMarkdownEnabled={isMarkdownEnabled}
        setIsMarkdownEnabled={setIsMarkdownEnabled}
        showSectionNaming={showSectionNaming}
        sectionName={sectionName}
        setSectionName={setSectionName}
        createSegment={createSegment}
        cancelSegmentCreation={cancelSegmentCreation}
        segments={segments}
      />
    </div>
  );
}
