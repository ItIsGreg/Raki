import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Bot, Plus, Save, Play, Download } from "lucide-react";

const AnnotationTab = () => {
  return (
    <div className="p-4">
      <DrawerHeader>
        <DrawerTitle>Annotation Process</DrawerTitle>
        <DrawerDescription>
          Master the art of text annotation with AI assistance
        </DrawerDescription>
      </DrawerHeader>
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Bot className="h-5 w-5 mt-1 text-primary" />
            <div>
              <p className="font-medium mb-2">Time to Extract Data!</p>
              <p>
                Now that we have our profile points set up, we can use the LLM
                to help us extract data from our texts. This is where the magic
                happens! 🎩✨
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-medium">Getting Started with Annotation</p>
            <p>
              First, go to the <span className="font-semibold">Annotation</span>{" "}
              tab in the main interface.
            </p>
          </div>

          <div className="space-y-4">
            <p className="font-medium">Setting Up Your First Annotation</p>
            <p>
              To start an AI-assisted annotation, we need to specify which text
              set should be annotated and which profile should be used. Let's do
              that! 🎯
            </p>
            <p>
              Right below the tabs in the upper right corner, you can select
              existing datasets. Since this is our first time using the app,
              there are no datasets to select yet. Let's create an annotated
              dataset! 🆕
            </p>
            <p>
              Click on the <Plus className="inline h-4 w-4" /> button next to
              the select item. A field will open where you can enter the
              following information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>
                <span className="font-medium">Name:</span> Enter "Test Dataset"
              </li>
              <li>
                <span className="font-medium">Description:</span> Add something
                like "This is a test run, to learn the ins and outs of this app"
              </li>
            </ul>
            <p>
              Now for the important part! You'll be asked to select a dataset -
              these are the texts you uploaded earlier. Go ahead and select the
              text dataset you created! 📚
            </p>
            <p>
              Next up, select the profile we just created. Got it? Awesome! 🎉
            </p>
            <p>
              Finally, click <Save className="inline h-4 w-4" /> to save your
              new annotated dataset! 🚀
            </p>
          </div>

          <div className="space-y-4">
            <p className="font-medium">Starting the Annotation Process</p>
            <p>
              After saving, you'll see a new field displaying basic information
              about your newly created dataset. You can't miss the prominent{" "}
              <span className="font-semibold">Start Annotation</span> button! 🎯
            </p>
            <p>
              When you click this button, the AI will begin processing your
              uploaded texts. While it's running, let me explain what's
              happening behind the scenes:
            </p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="flex items-center gap-2">
                <Play className="h-4 w-4 text-primary" />
                <span className="font-medium">What's happening right now?</span>
              </p>
              <p className="text-muted-foreground">
                Each text now gets sent to the LLM you specified earlier. The
                backend is modified so that it tells the LLM what to do with the
                information. In a first step the LLM is asked to look for
                passages in the text that correspond to any of the profile
                points that you specified and to output them in a machine
                readable format.
              </p>
              <p className="text-muted-foreground">
                After the LLM identified passages in the text, we then send
                these passages back to the large language model and ask it to
                identify the values to the best of its ability and also to
                report them in a specific format, that we can continue working
                with.
              </p>
              <p className="text-muted-foreground italic">
                There are some pre and postprocessing steps that we left out for
                brevity, but that is a quick sum up (:
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-medium">Reviewing the Results</p>
            <p>
              Let's check the state of the annotation. Has it finished? If not,
              give it some time (: ⏳
            </p>
            <p>
              Now that the annotation has finished, let's take a look at the
              results! Scroll down a little and you'll see a list with all the
              annotated texts. Click on one of them to view the details.
            </p>
            <p>
              On the very left of your screen, you can now see the result of the
              annotation process. All the profile points that got extracted are
              highlighted in the text. Take some time to look through these
              results - what do you think? 🤔
            </p>
            <div className="bg-muted p-4 rounded-md space-y-2">
              <p className="flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" />
                <span className="font-medium">Ready for Analysis?</span>
              </p>
              <p className="text-muted-foreground">
                If you're happy with the annotations the AI provided, you can
                download an Excel sheet with all the datapoints inside. Just
                click the <Download className="inline h-4 w-4" /> button and
                boom - ready to do some t-Tests! 📊
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationTab;
