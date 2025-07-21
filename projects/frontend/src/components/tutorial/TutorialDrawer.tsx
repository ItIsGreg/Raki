import { useState, useEffect } from "react";
import {
  Drawer,
  DrawerPortal,
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
import WelcomeTab from "./tabs/WelcomeTab";
import TextUploadTab from "./tabs/TextUploadTab";
import AISetupTab from "./tabs/AISetupTab";
import ProfilesTab from "./tabs/ProfilesTab";
import AnnotationTab from "./tabs/AnnotationTab";
import TipsTab from "./tabs/TipsTab";
import { cn } from "@/lib/utils";

interface TutorialDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tutorialCompleted?: boolean;
  onTutorialComplete?: (completed: boolean) => Promise<void>;
}

// Custom DrawerContent without overlay for non-modal drawer
const CustomDrawerContent = ({ className, children, ...props }: any) => (
  <DrawerPortal>
    {/* No DrawerOverlay here - this prevents the focus blocking issue */}
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background",
        className
      )}
      {...props}
    >
      <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
      {children}
    </div>
  </DrawerPortal>
);

const TutorialDrawer = ({
  isOpen,
  onOpenChange,
  tutorialCompleted = false,
  onTutorialComplete,
}: TutorialDrawerProps) => {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
      <Drawer
        open={isOpen}
        onOpenChange={onOpenChange}
        modal={false}
        shouldScaleBackground={false}
        // Allow dismissing to properly manage focus when clicking outside
        dismissible={true}
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
        <CustomDrawerContent className="h-[50vh] tutorial-drawer-content">
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
                    onTutorialComplete?.(checked as boolean)
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
            <div className="flex-1 overflow-y-auto tutorial-content">
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
        </CustomDrawerContent>
      </Drawer>
    </div>
  );
};

export default TutorialDrawer;
