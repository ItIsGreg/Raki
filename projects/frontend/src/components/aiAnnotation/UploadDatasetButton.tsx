import { useRef } from "react";
import { TiUpload } from "react-icons/ti";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { handleUploadAnnotatedDataset } from "./annotationUtils";

export const UploadDatasetButton = () => {
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
      await handleUploadAnnotatedDataset(file);
      // You might want to refresh the list of annotated datasets here
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
