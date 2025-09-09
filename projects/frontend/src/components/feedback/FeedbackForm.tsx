"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, CheckCircle, AlertCircle } from "lucide-react";

interface FeedbackFormProps {
  backendUrl?: string;
  className?: string;
}

export default function FeedbackForm({ 
  backendUrl = "http://localhost:8000",
  className 
}: FeedbackFormProps) {
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !email.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch(`${backendUrl}/support/email/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: `Feedback: ${title}`,
          message: `From: ${email}\n\n${message}`,
        }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setTitle("");
        setEmail("");
        setMessage("");
        console.log("Feedback sent successfully!");
      } else {
        setSubmitStatus("error");
        console.error("Failed to send feedback");
      }
    } catch (error) {
      setSubmitStatus("error");
      console.error("Error sending feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = title.trim() && email.trim() && message.trim();

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Send Feedback
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="feedback-title">Title</Label>
            <Input
              id="feedback-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of your feedback"
              required
            />
          </div>

          <div>
            <Label htmlFor="feedback-email">Your Email</Label>
            <Input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <Label htmlFor="feedback-message">Message</Label>
            <Textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please describe your feedback, suggestions, or issues in detail..."
              className="min-h-[120px] resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {submitStatus === "success" && (
                <div className="flex items-center gap-1 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Feedback sent successfully!
                </div>
              )}
              {submitStatus === "error" && (
                <div className="flex items-center gap-1 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  Failed to send feedback. Please try again.
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
