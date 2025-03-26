import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SegmentDataPoint } from "@/lib/db/db";

interface SidebarProps {
  isMarkdownEnabled: boolean;
  setIsMarkdownEnabled: (enabled: boolean) => void;
  showSectionNaming: boolean;
  sectionName: string;
  setSectionName: (name: string) => void;
  createSegment: () => void;
  cancelSegmentCreation: () => void;
  segments: SegmentDataPoint[];
}

export const Sidebar = ({
  isMarkdownEnabled,
  setIsMarkdownEnabled,
  showSectionNaming,
  sectionName,
  setSectionName,
  createSegment,
  cancelSegmentCreation,
  segments,
}: SidebarProps) => {
  return (
    <div className="w-80 border-l p-4 flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Switch
          id="markdown-mode"
          checked={isMarkdownEnabled}
          onCheckedChange={setIsMarkdownEnabled}
        />
        <Label htmlFor="markdown-mode">Markdown Mode</Label>
      </div>

      {showSectionNaming && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="section-name">Section Name</Label>
            <Input
              id="section-name"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              placeholder="Enter section name..."
              data-cy="section-name-input"
            />
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={createSegment}
              disabled={!sectionName}
              data-cy="create-section-button"
            >
              Create Section
            </Button>
            <Button
              variant="outline"
              onClick={cancelSegmentCreation}
              data-cy="cancel-section-button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Sections</h3>
        <div className="space-y-2">
          {segments.map((segment) => (
            <div
              key={segment.id}
              className="p-2 border rounded-md hover:bg-gray-50"
            >
              <div className="font-medium">{segment.name}</div>
              <div className="text-sm text-gray-500 truncate">
                {segment.begin}...{segment.end}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
