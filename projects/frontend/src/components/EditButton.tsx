import React from "react";
import { TiEdit } from "react-icons/ti";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface EditButtonProps {
  onClick: (e: React.MouseEvent) => void;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            className="p-0 bg-transparent border-none cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClick(e);
            }}
          >
            <TiEdit className="hover:text-gray-500" size={24} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EditButton;
