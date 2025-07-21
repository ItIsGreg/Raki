import React from "react";
import { CiSquarePlus } from "react-icons/ci";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AddButtonProps {
  onClick: () => void;
  label: string;
  "data-cy"?: string;
}

export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  label,
  "data-cy": dataCy,
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <button
            className="p-0 bg-transparent border-none cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            data-cy={dataCy}
          >
            <CiSquarePlus className=" hover:text-gray-500" size={30} />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Create new {label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
