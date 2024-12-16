// frontend/src/components/llmSettings/MaxTokensInput.tsx
import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  createMaxTokens,
  deleteMaxTokens,
  readAllMaxTokens,
} from "@/lib/db/crud";

export const MaxTokensInput = () => {
  const [newMaxTokens, setNewMaxTokens] = useState<string>("");
  const dbMaxTokens = useLiveQuery(() => readAllMaxTokens());

  const getPlaceholder = () => {
    if (dbMaxTokens && dbMaxTokens.length > 0) {
      return dbMaxTokens[0].value.toString();
    }
    return "Enter max tokens";
  };

  const handleSetMaxTokens = () => {
    // remove old max tokens
    if (dbMaxTokens && dbMaxTokens.length > 0) {
      dbMaxTokens.forEach((tokens) => {
        deleteMaxTokens(tokens.id);
      });
    }
    const tokenValue = parseInt(newMaxTokens);
    if (!isNaN(tokenValue)) {
      createMaxTokens(tokenValue);
      setNewMaxTokens("");
    }
  };

  return (
    <div className="flex flex-col items-start">
      <Label htmlFor="maxTokens" className="text-sm font-semibold mb-1">
        Max Tokens
      </Label>
      <div className="flex flex-row gap-2">
        <Input
          id="maxTokens"
          type="number"
          placeholder={getPlaceholder()}
          value={newMaxTokens}
          onChange={(e) => setNewMaxTokens(e.target.value)}
        />
        <Button onClick={handleSetMaxTokens}>Set</Button>
      </div>
    </div>
  );
};
