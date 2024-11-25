import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BatchSizeInputProps {
  batchSize: number;
  setBatchSize: React.Dispatch<React.SetStateAction<number>>;
}

export const BatchSizeInput: React.FC<BatchSizeInputProps> = ({
  batchSize,
  setBatchSize,
}) => {
  const [inputValue, setInputValue] = React.useState(batchSize.toString());

  const handleSetBatchSize = () => {
    const newBatchSize = parseInt(inputValue, 10);
    if (isNaN(newBatchSize) || newBatchSize <= 0) {
      alert("Please enter a valid positive number for batch size.");
      return;
    }
    setBatchSize(newBatchSize);
  };

  return (
    <div className="flex flex-col items-start">
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild>
            <h4 className="text-sm font-semibold mb-1">Batch Size</h4>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              The number of texts that will be annotated in parallel by the LLM
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex flex-row gap-2">
        <Input
          type="number"
          placeholder="Set Batch Size"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button onClick={handleSetBatchSize}>Set</Button>
      </div>
    </div>
  );
};
