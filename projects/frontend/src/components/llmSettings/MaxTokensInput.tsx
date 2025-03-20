// frontend/src/components/llmSettings/MaxTokensInput.tsx
import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createMaxTokens,
  deleteMaxTokens,
  readAllMaxTokens,
} from "@/lib/db/crud";

export const MaxTokensInput = () => {
  const dbMaxTokens = useLiveQuery(() => readAllMaxTokens());
  const [newMaxTokens, setNewMaxTokens] = useState<string>("");
  const [showMaxTokens, setShowMaxTokens] = useState(false);

  React.useEffect(() => {
    console.log("useEffect triggered with dbMaxTokens:", dbMaxTokens);
    if (dbMaxTokens) {
      const shouldShow =
        dbMaxTokens.length > 0 && dbMaxTokens[0].value !== undefined;
      console.log("Setting showMaxTokens to:", shouldShow);
      setShowMaxTokens(shouldShow);
    }
  }, [dbMaxTokens]);

  const getPlaceholder = () => {
    if (
      dbMaxTokens &&
      dbMaxTokens.length > 0 &&
      dbMaxTokens[0].value !== undefined
    ) {
      return dbMaxTokens[0].value.toString();
    }
    return "Enter max tokens";
  };

  const handleSetMaxTokens = async (newShowMaxTokensState?: boolean) => {
    const currentShowMaxTokens = newShowMaxTokensState ?? showMaxTokens;

    try {
      // Delete all existing max tokens entries
      if (dbMaxTokens) {
        await Promise.all(
          dbMaxTokens.map((tokens) => deleteMaxTokens(tokens.id))
        );
      }

      // If checkbox is unchecked, just return after deleting
      if (!currentShowMaxTokens) {
        setNewMaxTokens("");
        return;
      }

      const tokenValue = parseInt(newMaxTokens);
      if (!isNaN(tokenValue)) {
        await createMaxTokens(tokenValue);
        setNewMaxTokens("");
      }
    } catch (error) {
      console.error("Error updating max tokens:", error);
    }
  };

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="showMaxTokens"
          checked={showMaxTokens}
          onCheckedChange={(checked) => {
            setShowMaxTokens(checked as boolean);
            handleSetMaxTokens(checked as boolean);
          }}
          data-cy="max-tokens-checkbox"
        />
        <Label
          htmlFor="showMaxTokens"
          className="text-sm font-medium"
          data-cy="max-tokens-label"
        >
          Max Tokens Setting
        </Label>
      </div>

      {showMaxTokens && (
        <>
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
              data-cy="max-tokens-input"
            />
            <Button
              onClick={() => handleSetMaxTokens(showMaxTokens)}
              data-cy="max-tokens-set-button"
            >
              Set
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
