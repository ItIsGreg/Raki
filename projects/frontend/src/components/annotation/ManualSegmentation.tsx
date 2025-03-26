"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";
import { v4 as uuidv4 } from "uuid";
import { Sidebar } from "../../components/annotation/SegmentationSidebar";
import { TextDisplay } from "./SegmentationTextDisplay";
import { backendURL } from "@/app/constants";
import { SegmentDataPoint, AnnotatedText } from "@/lib/db/db";
import {
  createSegmentDataPoint,
  readSegmentDataPointsByAnnotatedText,
} from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";

interface ManualSegmentationProps {
  activeAnnotatedText: AnnotatedText | undefined;
  activeSegmentId: string | undefined;
  setActiveSegmentId: (id: string | undefined) => void;
}

export default function ManualSegmentation({
  activeAnnotatedText,
  activeSegmentId,
  setActiveSegmentId,
}: ManualSegmentationProps) {
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isMarkdownEnabled, setIsMarkdownEnabled] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [showSectionNaming, setShowSectionNaming] = useState(false);
  const [sectionName, setSectionName] = useState("");
  const [selectionInfo, setSelectionInfo] = useState<{
    text: string;
    startIndex: number;
    endIndex: number;
  } | null>(null);

  // Reference to the textarea element
  const textareaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing segments
  const segments = useLiveQuery(
    () => readSegmentDataPointsByAnnotatedText(activeAnnotatedText?.id),
    [activeAnnotatedText]
  );

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

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file");
      return;
    }

    setIsLoading(true);
    setFileName(file.name);

    try {
      const formData = new FormData();
      formData.append("file", file);

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

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    if (!isLoading) {
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
  }, [isLoading]);

  // Create a new segment
  const createSegment = useCallback(async () => {
    if (selectionInfo && sectionName && activeAnnotatedText) {
      const newSegment: Omit<SegmentDataPoint, "id"> = {
        annotatedTextId: activeAnnotatedText.id,
        name: sectionName,
        begin: selectionInfo.text.substring(0, 50), // First 50 chars as begin text
        end: selectionInfo.text.slice(-50), // Last 50 chars as end text
        beginMatch: [selectionInfo.startIndex],
        endMatch: [selectionInfo.endIndex],
        profilePointId: undefined,
        verified: false,
      };

      await createSegmentDataPoint(newSegment);

      setSelectionInfo(null);
      setSectionName("");
      setSelectedText("");
      setShowSectionNaming(false);
    }
  }, [selectionInfo, sectionName, activeAnnotatedText]);

  const cancelSegmentCreation = () => {
    setSelectionInfo(null);
    setSelectedText("");
    setSectionName("");
    setShowSectionNaming(false);
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
            onClick={() => fileInputRef.current?.click()}
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
          isTextConfirmed={true}
          isMarkdownEnabled={isMarkdownEnabled}
          inputText={inputText}
          segments={segments || []}
          onTextSelection={handleTextSelection}
          setInputText={setInputText}
          textareaRef={textareaRef}
        />
      </div>

      <Sidebar
        isMarkdownEnabled={isMarkdownEnabled}
        setIsMarkdownEnabled={setIsMarkdownEnabled}
        showSectionNaming={showSectionNaming}
        sectionName={sectionName}
        setSectionName={setSectionName}
        createSegment={createSegment}
        cancelSegmentCreation={cancelSegmentCreation}
        segments={segments || []}
      />
    </div>
  );
}
