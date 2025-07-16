// frontend/src/app/(navbarRoutes)/datasets/SingleTextInput.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

  const handleSubmit = async () => {
    console.log("handleSubmit called", { activeDataset, filename, text });
    if (!activeDataset || !filename || !text) return;

    try {
      console.log("Creating text...");
      await createText({
        datasetId: activeDataset.id,
        filename,
        text,
      });
      console.log("Text created successfully");

      // Refresh the texts list if callback provided
      if (onTextCreated) {
        await onTextCreated();
      }

      // Reset form and close modal
      setFilename("");
      setText("");
      onClose();
      console.log("Modal closed");
    } catch (error) {
      console.error("Error creating text:", error);
      // Optionally show an error message to the user
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Single Text</DialogTitle>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};

export default SingleTextInput;
