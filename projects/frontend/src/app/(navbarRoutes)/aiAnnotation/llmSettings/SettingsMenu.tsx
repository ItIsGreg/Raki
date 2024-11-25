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
import { LLMProvider } from "@/app/types";
import { LLMProviderSelect } from "./LLMProviderSelect";

interface SettingsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  batchSize: number;
  setBatchSize: React.Dispatch<React.SetStateAction<number>>;
  autoRerunFaulty: boolean;
  setAutoRerunFaulty: React.Dispatch<React.SetStateAction<boolean>>;
  provider: LLMProvider;
  setProvider: (provider: LLMProvider) => void;
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({
  isOpen,
  onClose,
  batchSize,
  setBatchSize,
  autoRerunFaulty,
  setAutoRerunFaulty,
  provider,
  setProvider,
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Settings</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <ApiKeyInput />
          <Separator className="my-2" />
          <LLMProviderSelect provider={provider} setProvider={setProvider} />
          <Separator className="my-2" />
          <BatchSizeInput batchSize={batchSize} setBatchSize={setBatchSize} />
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
