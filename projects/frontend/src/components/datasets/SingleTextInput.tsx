// frontend/src/app/(navbarRoutes)/datasets/SingleTextInput.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { createText } from "@/lib/db/crud";
import { Dataset } from "@/lib/db/db";

interface SingleTextInputProps {
  isOpen: boolean;
  onClose: () => void;
  activeDataset: Dataset | undefined;
  onTextCreated?: () => Promise<void>;
}

const SingleTextInput: React.FC<SingleTextInputProps> = ({
  isOpen,
  onClose,
  activeDataset,
  onTextCreated,
}) => {
  const [filename, setFilename] = useState("");
  const [text, setText] = useState("");

  // Clean up body styles when modal opens/closes
  useEffect(() => {
    // Always ensure body is not locked when our modal is active
    if (isOpen) {
      document.body.removeAttribute("data-scroll-locked");
      document.body.style.pointerEvents = "";
    }

    // Cleanup on unmount
    return () => {
      document.body.removeAttribute("data-scroll-locked");
      document.body.style.pointerEvents = "";
    };
  }, [isOpen]);

  // Aggressive cleanup - constantly remove scroll lock when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      document.body.removeAttribute("data-scroll-locked");
      document.body.style.pointerEvents = "";
    }, 100);

    return () => clearInterval(interval);
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!activeDataset || !filename || !text) return;

    try {
      await createText({
        datasetId: activeDataset.id,
        filename,
        text,
      });

      // Refresh the texts list if callback provided
      if (onTextCreated) {
        await onTextCreated();
      }

      // Reset form and close modal
      setFilename("");
      setText("");
      onClose();
    } catch (error) {
      console.error("Error creating text:", error);
      // Optionally show an error message to the user
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/80" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative z-50 bg-background border rounded-lg p-6 w-full max-w-2xl mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Add Single Text</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col space-y-4">
          <div>
            <label className="text-sm font-medium">Filename</label>
            <Input
              placeholder="Enter filename"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
              data-cy="single-text-filename-input"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Text Content</label>
            <Textarea
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
              data-cy="single-text-content-input"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!filename || !text}
            className="w-full"
            data-cy="add-single-text-btn"
          >
            Add Text
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SingleTextInput;
