import React, { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createLLMUrl, deleteLLMUrl, readAllLLMUrls } from "@/lib/db/crud";

export const LLMUrlInput = () => {
  const [newLlmUrl, setNewLlmUrl] = useState<string>("");
  const dbLlmUrls = useLiveQuery(() => readAllLLMUrls());

  const getPlaceholder = () => {
    if (dbLlmUrls && dbLlmUrls.length > 0 && dbLlmUrls[0].url) {
      return dbLlmUrls[0].url;
    }
    return "Enter LLM URL";
  };

  const handleSetLlmUrl = () => {
    // remove old url
    if (dbLlmUrls && dbLlmUrls.length > 0) {
      dbLlmUrls.forEach((url) => {
        deleteLLMUrl(url.id);
      });
    }
    createLLMUrl(newLlmUrl);
    setNewLlmUrl("");
  };

  return (
    <div className="flex flex-col items-start">
      <Label htmlFor="llmUrl" className="text-sm font-semibold mb-1">
        LLM URL
      </Label>
      <div className="flex flex-row gap-2">
        <Input
          id="llmUrl"
          placeholder={getPlaceholder()}
          value={newLlmUrl}
          onChange={(e) => setNewLlmUrl(e.target.value)}
          data-cy="llm-url-input"
        />
        <Button onClick={handleSetLlmUrl} data-cy="llm-url-set-button">
          Set
        </Button>
      </div>
    </div>
  );
};
