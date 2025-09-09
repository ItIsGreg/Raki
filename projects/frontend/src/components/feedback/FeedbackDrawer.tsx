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
import { MessageSquare, X, Send, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (feedback: { title: string; text: string }) => void;
  "data-cy"?: string;
  backendUrl?: string;
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
  backendUrl = "http://localhost:8000",
}: FeedbackDrawerProps) => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async () => {
    if (!title.trim() || !text.trim()) return;
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      // Send email via backend API
      const response = await fetch(`${backendUrl}/support/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `Feedback: ${title.trim()}`,
          message: text.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSubmitStatus('success');
        console.log("Feedback sent successfully!");
        
        // Reset form after successful submission
        setTitle("");
        setText("");
        
        // Close drawer after a short delay
        setTimeout(() => {
          onOpenChange(false);
          setSubmitStatus('idle');
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to send feedback');
      }
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setSubmitStatus('error');
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
        <CustomDrawerContent className="h-[60vh] max-h-[80vh] min-h-[300px] sm:h-[50vh] md:h-[60vh] lg:h-[50vh] feedback-drawer-content">
          <div className="flex flex-col h-full overflow-hidden">
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
            <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
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
                  className="w-full min-h-[150px] max-h-[300px] resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Press Ctrl+Enter to send
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t">
              <Button
                id="feedback-submit-button"
                onClick={handleSubmit}
                disabled={!title.trim() || !text.trim() || isSubmitting}
                className="w-full"
                size="lg"
                variant={submitStatus === 'success' ? 'default' : submitStatus === 'error' ? 'destructive' : 'default'}
              >
                {submitStatus === 'success' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Sent Successfully!
                  </>
                ) : submitStatus === 'error' ? (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Send Failed
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Sending..." : "Send Feedback"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </CustomDrawerContent>
      </Drawer>
    </div>
  );
};

export default FeedbackDrawer;
