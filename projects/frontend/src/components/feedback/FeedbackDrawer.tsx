import { useState } from "react";
import {
  Drawer,
  DrawerPortal,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageSquare, X, Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (feedback: { title: string; text: string }) => void;
  "data-cy"?: string;
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

const FeedbackDrawer = ({
  isOpen,
  onOpenChange,
  onSubmit,
  "data-cy": dataCy,
}: FeedbackDrawerProps) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !text.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit?.({ title: title.trim(), text: text.trim() });
      // Reset form after successful submission
      setTitle("");
      setText("");
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.ctrlKey) {
      handleSubmit();
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 translate-x-8 z-50" data-cy={dataCy}>
      <Drawer
        open={isOpen}
        onOpenChange={onOpenChange}
        modal={false}
        shouldScaleBackground={false}
        dismissible={true}
      >
        <DrawerTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <CustomDrawerContent className="h-[60vh] feedback-drawer-content">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <DrawerHeader className="p-0">
                <DrawerTitle className="text-lg font-semibold">
                  Send Feedback
                </DrawerTitle>
              </DrawerHeader>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4">
              {/* Title Input */}
              <div className="space-y-2">
                <Label htmlFor="feedback-title">Title</Label>
                <Input
                  id="feedback-title"
                  placeholder="Brief description of your feedback"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Text Input */}
              <div className="space-y-2 flex-1">
                <Label htmlFor="feedback-text">Feedback</Label>
                <Textarea
                  id="feedback-text"
                  placeholder="Please share your detailed feedback, suggestions, or report any issues..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full min-h-[200px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Press Ctrl+Enter to send
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={!title.trim() || !text.trim() || isSubmitting}
                className="w-full"
                size="lg"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send Feedback"}
              </Button>
            </div>
          </div>
        </CustomDrawerContent>
      </Drawer>
    </div>
  );
};

export default FeedbackDrawer;
