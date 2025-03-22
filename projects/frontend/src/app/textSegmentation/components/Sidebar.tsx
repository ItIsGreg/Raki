import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Type } from "lucide-react";

interface SidebarProps {
  isMarkdownEnabled: boolean;
  setIsMarkdownEnabled: (value: boolean) => void;
  showSectionNaming: boolean;
  sectionName: string;
  setSectionName: (name: string) => void;
  createSegment: () => void;
  cancelSegmentCreation: () => void;
  segments: Array<{
    id: string;
    text: string;
    name: string;
    startIndex: number;
    endIndex: number;
  }>;
}

export function Sidebar({
  isMarkdownEnabled,
  setIsMarkdownEnabled,
  showSectionNaming,
  sectionName,
  setSectionName,
  createSegment,
  cancelSegmentCreation,
}: SidebarProps) {
  return (
    <div className="flex-shrink-0 w-64 bg-gray-50 p-4 border-l">
      <div className="mb-4">
        <h3 className="font-medium mb-2">Settings</h3>

        <div className="flex items-center space-x-2 mb-4">
          <Switch
            id="markdown-mode"
            checked={isMarkdownEnabled}
            onCheckedChange={setIsMarkdownEnabled}
            data-cy="markdown-switch"
          />
          <Label
            htmlFor="markdown-mode"
            className="flex items-center cursor-pointer"
          >
            <Type className="h-4 w-4 mr-1" />
            Render Markdown
          </Label>
        </div>
      </div>

      {showSectionNaming && (
        <div className="mb-6 p-3 border rounded-md bg-yellow-50">
          <h3 className="font-medium mb-2">Name Selected Section</h3>

          <Input
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            placeholder="Enter section name"
            className="mb-3"
            data-cy="segment-name-input"
            autoFocus
          />

          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={createSegment}
              disabled={!sectionName}
              data-cy="create-segment-button"
            >
              <Check className="h-4 w-4 mr-1" />
              Create
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={cancelSegmentCreation}
              data-cy="cancel-segment-button"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
