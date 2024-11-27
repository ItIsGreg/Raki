import React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// First, you'll need to add these functions to your db/crud.ts file
import {
  createBatchSize,
  deleteAllBatchSizes,
  readAllBatchSizes,
} from "@/lib/db/crud";

export const BatchSizeInput: React.FC = () => {
  const [inputValue, setInputValue] = React.useState("");
  const dbBatchSizes = useLiveQuery(() => readAllBatchSizes());

  const handleSetBatchSize = () => {
    const newBatchSize = parseInt(inputValue, 10);
    if (isNaN(newBatchSize) || newBatchSize <= 0) {
      alert("Please enter a valid positive number for batch size.");
      return;
    }

    // Remove old batch sizes
    if (dbBatchSizes && dbBatchSizes.length > 0) {
      dbBatchSizes.forEach((entry) => {
        deleteAllBatchSizes(entry.id);
      });
    }
    createBatchSize(newBatchSize);
    setInputValue("");
  };

  const getPlaceholder = () => {
    if (dbBatchSizes && dbBatchSizes.length > 0) {
      return dbBatchSizes[0].value.toString();
    }
    return "Set Batch Size";
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
          placeholder={getPlaceholder()}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <Button onClick={handleSetBatchSize}>Set</Button>
      </div>
    </div>
  );
};
