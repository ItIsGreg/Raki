import { useRef } from "react";
import { TiUpload } from "react-icons/ti";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UploadDatasetButtonProps {
  onUpload?: (file: File) => void;
  "data-cy"?: string;
}

export const UploadDatasetButton = ({
  onUpload,
  "data-cy": dataCy,
}: UploadDatasetButtonProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadButtonClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      onUpload?.(file);
    } catch (error) {
      console.error("Error uploading annotated dataset:", error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            className="p-0 bg-transparent border-none cursor-pointer"
            onClick={handleUploadButtonClick}
            data-cy={dataCy}
          >
            <TiUpload className="h-6 w-6 hover:text-gray-500" />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Upload Dataset</p>
        </TooltipContent>
      </Tooltip>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".json"
        onChange={handleFileUpload}
      />
    </TooltipProvider>
  );
};
