import { useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { createApiKey, deleteApiKey, readAllApiKeys } from "@/lib/db/crud";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const ApiKeyInput = () => {
  const [newApiKey, setNewApiKey] = useState<string>("");
  const dbApiKeys = useLiveQuery(() => readAllApiKeys());

  const getPlaceholder = () => {
    if (dbApiKeys && dbApiKeys.length > 0 && dbApiKeys[0].key) {
      const key = dbApiKeys[0].key;
      return `${key.slice(0, 3)}...${key.slice(-3)}`;
    }
    return "Add Api Key";
  };

  const handleSetApiKey = () => {
    // remove old api key
    if (dbApiKeys && dbApiKeys.length > 0) {
      dbApiKeys.forEach((key) => {
        deleteApiKey(key.id);
      });
    }
    createApiKey(newApiKey);
    setNewApiKey("");
  };

  return (
    <div className="flex flex-col items-start">
      <h4 className="text-sm font-semibold mb-1">API Key</h4>
      <div className="flex flex-row gap-2">
        <Input
          placeholder={getPlaceholder()}
          value={newApiKey}
          onChange={(e) => setNewApiKey(e.target.value)}
        />
        <Button onClick={handleSetApiKey}>Set</Button>
      </div>
    </div>
  );
};
