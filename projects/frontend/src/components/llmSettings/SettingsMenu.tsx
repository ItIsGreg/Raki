import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ApiKeyInput } from "./ApiKeyInput";
import { BatchSizeInput } from "./BatchSizeInput";
import { RerunCheckbox } from "./RerunCheckbox";
import { LLMProviderSelect } from "./LLMProviderSelect";
import { ModelInput } from "./ModelInput";
import { LLMUrlInput } from "./LLMUrlInput";
import { MaxTokensInput } from "./MaxTokensInput";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  autoRerunFaulty: boolean;
  setAutoRerunFaulty: React.Dispatch<React.SetStateAction<boolean>>;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  autoRerunFaulty,
  setAutoRerunFaulty,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="left"
        data-cy="settings-dialog"
        className="overflow-y-auto max-h-screen flex flex-col"
      >
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4 flex-1 overflow-y-auto">
          <div data-cy="llm-provider-section">
            <LLMProviderSelect />
          </div>
          <Separator className="my-2" />
          <div data-cy="model-section">
            <ModelInput />
          </div>
          <Separator className="my-2" />
          <div data-cy="url-section">
            <LLMUrlInput />
          </div>
          <Separator className="my-2" />
          <div data-cy="api-key-section">
            <ApiKeyInput />
          </div>
          <Separator className="my-2" />
          <div data-cy="batch-size-section">
            <BatchSizeInput />
          </div>
          <Separator className="my-2" />
          <div data-cy="max-tokens-section">
            <MaxTokensInput />
          </div>
          <Separator className="my-2" />
          <div data-cy="rerun-section">
            <RerunCheckbox
              autoRerunFaulty={autoRerunFaulty}
              setAutoRerunFaulty={setAutoRerunFaulty}
            />
          </div>
          <Separator className="my-2" />
        </div>
        <SheetClose asChild>
          <Button
            variant="outline"
            className="mt-4"
            data-cy="settings-close-button"
          >
            Close
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsMenu;
