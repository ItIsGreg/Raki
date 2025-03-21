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

  const currentProvider = useMemo(() => {
    if (dbProvider && dbProvider.length > 0) {
      return dbProvider[0].provider;
    }
    return undefined; // No default value, use placeholder instead
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
      <Select value={currentProvider} onValueChange={handleProviderChange}>
        <SelectTrigger data-cy="llm-provider-trigger">
          <SelectValue placeholder="Select provider" />
        </SelectTrigger>
        <SelectContent data-cy="llm-provider-content">
          <SelectItem value="openai" data-cy="llm-provider-openai">
            OpenAI
          </SelectItem>
          <SelectItem value="azure" data-cy="llm-provider-azure">
            Azure
          </SelectItem>
          <SelectItem value="custom" data-cy="llm-provider-custom">
            Custom Provider
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
