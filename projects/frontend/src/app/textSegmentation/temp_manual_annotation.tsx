"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";
import { v4 as uuidv4 } from "uuid";
import { Sidebar } from "./components/Sidebar";
import { TextDisplay } from "./components/TextDisplay";
import { getTextNodeOffset } from "./utils";
import { backendURL } from "../constants";

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
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Send to backend API
      const response = await fetch(
        `${backendURL}/text_segmentation/extract-pdf`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to process PDF");
      }

      const data = await response.json();
      setInputText(data.markdown);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF");
      setIsLoading(false);
    }
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

            setSelectionInfo({
              text: selText,
              startIndex,
              endIndex,
            });
            setSelectedText(selText);
            setShowSectionNaming(true);
          }
        } catch (error) {
          console.error("Error processing selection:", error);
        }
      }
    }
  }, [isTextConfirmed, isLoading]);

  // Create a new segment from selection
  const createSegment = useCallback(() => {
    if (selectionInfo && sectionName && textareaRef.current) {
      const newSegment = {
        id: uuidv4(),
        text: selectionInfo.text,
        name: sectionName,
        startIndex: selectionInfo.startIndex,
        endIndex: selectionInfo.endIndex,
      };

      setSegments((prevSegments) => [...prevSegments, newSegment]);

      setSelectionInfo(null);
      setSectionName("");
      setSelectedText("");
      setShowSectionNaming(false);
    }
  }, [selectionInfo, sectionName]);

  const cancelSegmentCreation = () => {
    setSelectionInfo(null);
    setSelectedText("");
    setSectionName("");
    setShowSectionNaming(false);
  };

  // Reset everything
  const resetSegmentation = () => {
    setIsTextConfirmed(false);
    setSegments([]);
    setSelectionInfo(null);
    setFileName("");
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 p-4">
        <div className="mb-4">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf"
            className="hidden"
          />
          <Button
            onClick={openFileDialog}
            variant="outline"
            disabled={isLoading}
            className="mr-2"
          >
            {isLoading ? "Processing..." : "Upload PDF"}
          </Button>
          {fileName && (
            <span className="text-sm text-gray-600">{fileName}</span>
          )}
        </div>

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
