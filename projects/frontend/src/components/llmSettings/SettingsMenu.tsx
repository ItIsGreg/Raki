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
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <LLMProviderSelect />
          <Separator className="my-2" />
          <ModelInput />
          <Separator className="my-2" />
          <LLMUrlInput />
          <Separator className="my-2" />
          <ApiKeyInput />
          <Separator className="my-2" />
          <BatchSizeInput />
          <Separator className="my-2" />
          <RerunCheckbox
            autoRerunFaulty={autoRerunFaulty}
            setAutoRerunFaulty={setAutoRerunFaulty}
          />
          <Separator className="my-2" />
        </div>
        <SheetClose asChild>
          <Button variant="outline" className="mt-4">
            Close
          </Button>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
};

export default SettingsMenu;
