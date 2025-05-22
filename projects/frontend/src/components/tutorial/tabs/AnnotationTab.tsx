import {
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Bot } from "lucide-react";

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
              tab in the main interface. You&apos;ll see a list of your uploaded
              texts on the left side.
            </p>
            <p>
              Select one of the texts to begin the annotation process. The text
              will be displayed in the main area.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium mb-2">Using the LLM Assistant</p>
            <p>
              In the annotation interface, you&apos;ll find a chat button that
              lets you interact with the LLM. Click it to open the chat
              interface.
            </p>
            <p className="mt-2">
              You can ask the LLM to analyze the text and find instances of our
              profile points. For example, you could say:
            </p>
          </div>

          <div className="space-y-4">
            <p className="font-medium">Understanding the Results</p>
            <p>
              The LLM will analyze the text and provide suggestions for data
              points it finds. For each suggestion, you&apos;ll see:
            </p>
            <ul className="list-disc pl-4 space-y-2">
              <li>The extracted value</li>
              <li>The relevant text span</li>
              <li>The confidence level of the extraction</li>
            </ul>
            <p className="mt-2">
              You can review each suggestion and either accept it or modify it
              as needed. The LLM&apos;s suggestions are based on the profile
              points we created, using the explanations and synonyms we
              provided.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium mb-2">Tips for Better Results</p>
            <ul className="list-disc pl-4 space-y-2">
              <li>Be specific in your requests to the LLM</li>
              <li>Review the extracted values carefully</li>
              <li>Use the chat to ask for clarification if needed</li>
              <li>Don&apos;t hesitate to modify the LLM&apos;s suggestions</li>
            </ul>
          </div>

          <div className="space-y-4">
            <p className="font-medium">Saving Your Work</p>
            <p>
              As you accept or modify the LLM&apos;s suggestions, the
              annotations are automatically saved. You can always come back to a
              text later to review or modify the annotations.
            </p>
            <p className="mt-2">
              Once you&apos;re satisfied with the annotations for a text, you
              can move on to the next one. The LLM will help you maintain
              consistency across all your texts.
            </p>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <p className="font-medium mb-2">Ready to Try?</p>
            <p>
              Select one of your uploaded texts and start the annotation
              process. Remember, the LLM is here to help, but you&apos;re in
              control of the final annotations.
            </p>
            <p className="mt-2 text-primary font-medium">
              When you&apos;re ready to learn more about exporting your
              annotated data, switch to the Tips &amp; Tricks tab!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationTab;
