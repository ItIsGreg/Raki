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
import { HelpCircle, X, Download } from "lucide-react";
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
                <TabsTrigger value="tips">Tips & Tricks</TabsTrigger>
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
              <TabsContent value="welcome" className="p-4 h-full">
                <DrawerHeader className="px-0">
                  <DrawerTitle>Welcome to Raki</DrawerTitle>
                  <DrawerDescription>
                    Extract structured data from your texts with ease
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-6 pb-4">
                  <div>
                    <h3 className="font-semibold mb-2">What is Raki?</h3>
                    <p className="text-muted-foreground">
                      Raki is a specialized tool designed to help you extract
                      tabular data from text documents. While it was initially
                      developed for medical research, its flexible design makes
                      it suitable for various data extraction tasks across
                      different domains.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      AI-Powered Annotation
                    </h3>
                    <p className="text-muted-foreground">
                      Raki leverages advanced large language models to assist in
                      the annotation process. The AI can suggest potential data
                      points based on your defined profiles, making the
                      annotation process faster and more efficient while
                      maintaining high accuracy.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Key Features</h3>
                    <ul className="list-disc pl-4 space-y-2 text-muted-foreground">
                      <li>Define custom data points to extract</li>
                      <li>Organize data points into reusable profiles</li>
                      <li>Batch process multiple documents</li>
                      <li>AI-assisted annotation suggestions</li>
                      <li>Export data in structured formats</li>
                    </ul>
                  </div>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm flex items-center gap-2">
                      <HelpCircle className="h-4 w-4" />
                      You can always access this tutorial by clicking the
                      question mark icon at the bottom of the page.
                    </p>
                  </div>
                </div>
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
                      💡 Tip: Create specific profiles for different types of
                      data you want to extract.
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
                    Learn how to upload and manage your texts
                  </DrawerDescription>
                </DrawerHeader>
                <div className="space-y-4">
                  <p>
                    First of all in the upper right corner of your screen you
                    should see three tabs:
                  </p>
                  <p className="font-medium">
                    Annotation - Profiles - Text Upload
                  </p>
                  <p>Start by going to the text upload tab.</p>

                  <p>
                    Let's start the tutorial by uploading some data that we can
                    annotate.
                  </p>
                  <Button
                    variant="secondary"
                    className="flex items-center gap-2"
                    onClick={() => {
                      // TODO: Add actual download functionality
                      console.log("Download example data");
                    }}
                  >
                    <Download className="h-4 w-4" />
                    Download Example Data
                  </Button>

                  <p>
                    Do you have the table? You might want to open it and just
                    take a look. After that come back to the tutorial.
                  </p>
                  <p>Alright, have you seen the table contents? Great.</p>
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
                      🤖 AI suggestions can help speed up your annotation
                      process
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
            </div>
          </Tabs>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default TutorialDrawer;
