import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RerunCheckboxProps {
  autoRerunFaulty: boolean;
  setAutoRerunFaulty: React.Dispatch<React.SetStateAction<boolean>>;
}

export const RerunCheckbox: React.FC<RerunCheckboxProps> = ({
  autoRerunFaulty,
  setAutoRerunFaulty,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="auto-rerun"
        checked={autoRerunFaulty}
        onCheckedChange={(checked) => setAutoRerunFaulty(checked as boolean)}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Label htmlFor="auto-rerun">Rerun faulty Texts</Label>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Sometimes AI annotation fails on the first try for some texts but
              often succeeds on a simple rerun. With this box checked, all
              faulty texts will be automatically rerun once after the annotation
              has finished.
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};
