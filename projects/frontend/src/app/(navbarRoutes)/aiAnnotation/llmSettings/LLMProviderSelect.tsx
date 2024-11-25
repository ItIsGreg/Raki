import { LLMProviderSelectProps } from "@/app/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const LLMProviderSelect: React.FC<LLMProviderSelectProps> = ({
  provider,
  setProvider,
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">LLM Provider</label>
      <Select defaultValue={provider} onValueChange={setProvider}>
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
