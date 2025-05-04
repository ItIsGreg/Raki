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
import { HelpCircle } from "lucide-react";
import { getUserSettings, updateUserSettings } from "@/lib/db/crud";
import { useLiveQuery } from "dexie-react-hooks";

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
      <Drawer open={isOpen} onOpenChange={onOpenChange} modal={false}>
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <Tabs defaultValue="welcome" className="w-full">
            <div className="flex items-center justify-between px-4">
              <TabsList className="justify-start">
                <TabsTrigger value="welcome">Welcome</TabsTrigger>
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="annotation">Annotation</TabsTrigger>
                <TabsTrigger value="text-upload">Text Upload</TabsTrigger>
                <TabsTrigger value="ai-setup">AI Setup</TabsTrigger>
                <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="tutorial-settings"
                  checked={tutorialCompleted}
                  onCheckedChange={(checked) =>
                    handleTutorialComplete(checked as boolean)
                  }
                />
                <Label htmlFor="tutorial-settings">Tutorial Done</Label>
              </div>
            </div>
            <TabsContent value="welcome" className="p-4">
              <DrawerHeader>
                <DrawerTitle>Welcome to Data Point Extraction</DrawerTitle>
                <DrawerDescription>
                  Learn how to use the annotation tool effectively
                </DrawerDescription>
              </DrawerHeader>
              <h3 className="font-semibold mb-2">Getting Started</h3>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Select a profile from the Profiles tab</li>
                <li>Create data points for your profile</li>
                <li>Upload texts in the Text Upload tab</li>
                <li>
                  Start annotating your texts with the created data points
                </li>
              </ol>
            </TabsContent>
            <TabsContent value="profiles" className="p-4">
              <DrawerHeader>
                <DrawerTitle>Working with Profiles</DrawerTitle>
                <DrawerDescription>
                  Learn how to manage and use profiles effectively
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4">
                <p>
                  Profiles are collections of data points that define what you
                  want to extract from your texts.
                </p>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    💡 Tip: Create specific profiles for different types of data
                    you want to extract.
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="annotation" className="p-4">
              <DrawerHeader>
                <DrawerTitle>Annotation Process</DrawerTitle>
                <DrawerDescription>
                  Master the art of text annotation
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4">
                <p>Learn how to effectively annotate your texts:</p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Select text spans to annotate</li>
                  <li>Choose the appropriate data point</li>
                  <li>Review and edit annotations</li>
                  <li>Save your progress</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="text-upload" className="p-4">
              <DrawerHeader>
                <DrawerTitle>Text Upload</DrawerTitle>
                <DrawerDescription>
                  Learn how to manage and upload your texts
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4">
                <p>Upload and manage your texts for annotation:</p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Create a new dataset or select an existing one</li>
                  <li>Upload individual texts or bulk import</li>
                  <li>Organize texts within datasets</li>
                  <li>Preview and edit text content</li>
                </ul>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    📁 Supported formats: TXT, CSV, JSON
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="ai-setup" className="p-4">
              <DrawerHeader>
                <DrawerTitle>AI Setup</DrawerTitle>
                <DrawerDescription>
                  Configure AI assistance for your annotation workflow
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4">
                <p>Enhance your annotation process with AI:</p>
                <ul className="list-disc pl-4 space-y-2">
                  <li>Configure AI model settings</li>
                  <li>Set up automatic suggestions</li>
                  <li>Adjust confidence thresholds</li>
                  <li>Manage AI training data</li>
                </ul>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    🤖 AI suggestions can help speed up your annotation process
                  </p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="tips" className="p-4">
              <DrawerHeader>
                <DrawerTitle>Tips & Tricks</DrawerTitle>
                <DrawerDescription>
                  Pro tips to enhance your workflow
                </DrawerDescription>
              </DrawerHeader>
              <div className="space-y-4">
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    🎯 Use keyboard shortcuts for faster annotation
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">
                    📝 Keep your data points well-organized
                  </p>
                </div>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm">🔄 Regularly save your work</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TutorialDrawer;
