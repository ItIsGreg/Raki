import React from "react";
import { TiDownloadOutline } from "react-icons/ti";
import { downloadAnnotatedDataset } from "./annotationUtils";
import { AnnotatedDataset } from "@/lib/db/db";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DownloadButtonProps {
  dataset: AnnotatedDataset;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ dataset }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            className="p-0 bg-transparent border-none cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              downloadAnnotatedDataset(dataset);
            }}
          >
            <TiDownloadOutline className="hover:text-gray-500 mr-2" size={24} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default DownloadButton;
