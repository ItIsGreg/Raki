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
}

const SingleTextInput: React.FC<SingleTextInputProps> = ({
  isOpen,
  onClose,
  activeDataset,
}) => {
  const [filename, setFilename] = useState("");
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!activeDataset || !filename || !text) return;

    createText({
      datasetId: activeDataset.id,
      filename,
      text,
    });

    // Reset form and close modal
    setFilename("");
    setText("");
    onClose();
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
            />
          </div>
          <div>
            <label className="text-sm font-medium">Text Content</label>
            <Textarea
              placeholder="Enter your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!filename || !text}
            className="w-full"
          >
            Add Text
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SingleTextInput;
