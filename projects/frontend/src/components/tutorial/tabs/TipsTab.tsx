import { ArrowUp, ArrowDown, AlertTriangle, ArrowUpDown } from "lucide-react";

const TipsTab = () => {
  return (
    <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 mt-1 text-yellow-500" />
            <div>
              <p className="font-medium mb-2">Trust but Verify</p>
              <p className="text-muted-foreground">
                You&apos;ve completed your first AI-Annotation, but can you
                trust the data that the LLM extracted? The simple answer is: you
                shouldn&apos;t.
              </p>
              <p className="text-muted-foreground mt-2">
                If you&apos;ve used ChatGPT before, you know that its output
                isn&apos;t always 100% true or accurate. The same applies to
                this app. While Raki is designed to accelerate your data
                extraction, we&apos;re not yet at the point where we can blindly
                trust the AI&apos;s output.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="font-medium">Efficient Data Verification</p>
            <p className="text-muted-foreground">
              Raki is designed to make verification and modification of
              extracted data very efficient. The goal is to minimize mouse usage
              and maximize keyboard productivity. Let&apos;s learn how:
            </p>
          </div>

          <div className="bg-muted p-4 rounded-md space-y-3">
            <p className="font-medium">Keyboard Navigation</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm flex items-center gap-2">
                  <span className="font-medium">Navigating Datapoints:</span>
                  <div className="flex items-center gap-1">
                    <ArrowUp className="h-4 w-4" />
                    <span className="text-muted-foreground">/</span>
                    <ArrowDown className="h-4 w-4" />
                  </div>
                </p>
                <p className="text-sm text-muted-foreground">
                  Use these keys to navigate through datapoints. Found a wrong
                  or missing value? Just edit/add it inline!
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm flex items-center gap-2">
                  <span className="font-medium">Navigating Texts:</span>
                  <div className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 bg-background rounded text-xs font-medium">
                      Shift
                    </span>
                    <span className="text-muted-foreground">+</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </div>
                </p>
                <p className="text-sm text-muted-foreground">
                  Press Shift + Up/Down arrows to navigate between different
                  texts in your dataset.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default TipsTab;
