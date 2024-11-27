import { useCallback, useMemo } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createLLMProvider,
  deleteLLMProvider,
  readAllLLMProviders,
} from "@/lib/db/crud";

export const LLMProviderSelect = () => {
  const dbProvider = useLiveQuery(() => readAllLLMProviders());

  const getCurrentProvider = useMemo(() => {
    if (dbProvider && dbProvider.length > 0) {
      return dbProvider[0].provider;
    }
    return "openai"; // default value
  }, [dbProvider]);

  const handleProviderChange = useCallback(
    (newProvider: string) => {
      // Remove old provider
      if (dbProvider && dbProvider.length > 0) {
        dbProvider.forEach((provider) => {
          deleteLLMProvider(provider.id);
        });
      }
      createLLMProvider(newProvider);
    },
    [dbProvider]
  );

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">LLM Provider</label>
      <Select value={getCurrentProvider} onValueChange={handleProviderChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="azure">Azure</SelectItem>
          <SelectItem value="custom">Custom Provider</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
