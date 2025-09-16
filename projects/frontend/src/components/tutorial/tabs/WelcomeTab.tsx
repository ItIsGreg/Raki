import { HelpCircle } from "lucide-react";

const WelcomeTab = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-2">What is Raki?</h3>
        <p className="text-muted-foreground">
          Raki is a specialized tool designed to help you extract tabular data
          from text documents. While it was initially developed for medical
          research, its flexible design makes it suitable for various data
          extraction tasks across different domains.
        </p>
      </div>
      <div>
        <h3 className="font-semibold mb-2">AI-Powered Annotation</h3>
        <p className="text-muted-foreground">
          Raki leverages advanced large language models to assist in the
          annotation process. The AI can suggest potential data points based
          on your defined profiles, making the annotation process faster and
          more efficient while maintaining high accuracy.
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
          You can always access this tutorial by visiting the help section.
        </p>
      </div>
    </div>
  );
};

export default WelcomeTab;
