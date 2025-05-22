import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { HelpCircle, X, Download, Bot, Settings, Sparkles } from "lucide-react";
import { getUserSettings, updateUserSettings } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";
import WelcomeTab from "./tabs/WelcomeTab";
import TextUploadTab from "./tabs/TextUploadTab";
import AISetupTab from "./tabs/AISetupTab";
import ProfilesTab from "./tabs/ProfilesTab";
import AnnotationTab from "./tabs/AnnotationTab";
import TipsTab from "./tabs/TipsTab";

interface TutorialDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const TutorialDrawer = ({ isOpen, onOpenChange }: TutorialDrawerProps) => {
  const [tutorialCompleted, setTutorialCompleted] = useState(false);

  // Get user settings from database
  const userSettings = useLiveQuery(() => getUserSettings(), []);

  // Update tutorial completed state when user settings change
  useEffect(() => {
    if (userSettings) {
      setTutorialCompleted(userSettings.tutorialCompleted);
    }
  }, [userSettings]);

  // Handle tutorial completion
  const handleTutorialComplete = async (completed: boolean) => {
    setTutorialCompleted(completed);
    await updateUserSettings({ tutorialCompleted: completed });
    if (completed) {
      onOpenChange(false);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
      <Drawer
        open={isOpen}
        onOpenChange={onOpenChange}
        modal={false}
        shouldScaleBackground={false}
      >
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[50vh]">
          <Tabs defaultValue="welcome" className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between px-4 border-b">
              <TabsList className="justify-start">
                <TabsTrigger value="welcome">Welcome</TabsTrigger>
                <TabsTrigger value="text-upload">Text Upload</TabsTrigger>
                <TabsTrigger value="ai-setup">AI Setup</TabsTrigger>
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="annotation">Annotation</TabsTrigger>
                <TabsTrigger value="tips">Tips &amp; Tricks</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Label htmlFor="tutorial-settings">Tutorial Done</Label>
                <Checkbox
                  id="tutorial-settings"
                  checked={tutorialCompleted}
                  onCheckedChange={(checked) =>
                    handleTutorialComplete(checked as boolean)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <TabsContent value="welcome" className="h-full">
                <WelcomeTab />
              </TabsContent>
              <TabsContent value="profiles" className="h-full">
                <ProfilesTab />
              </TabsContent>
              <TabsContent value="annotation" className="h-full">
                <AnnotationTab />
              </TabsContent>
              <TabsContent value="text-upload" className="h-full">
                <TextUploadTab />
              </TabsContent>
              <TabsContent value="ai-setup" className="h-full">
                <AISetupTab />
              </TabsContent>
              <TabsContent value="tips" className="h-full">
                <TipsTab />
              </TabsContent>
            </div>
          </Tabs>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TutorialDrawer;
