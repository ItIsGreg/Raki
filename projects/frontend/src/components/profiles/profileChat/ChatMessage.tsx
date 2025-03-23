import React, { useState, useEffect } from "react";
import { Profile } from "@/lib/db/db";
import { Button } from "@/components/ui/button";
import ProfileJsonContent from "./ProfileJsonContent";
import {
  extractProfilePoints,
  adoptAllProfilePoints,
} from "./profileChatUtils";
import {
  extractSegmentationProfilePoints,
  adoptAllSegmentationProfilePoints,
} from "./profileChatSegmentationUtils";
import {
  createProfilePoint,
  createSegmentationProfilePoint,
} from "@/lib/db/crud";
import { TASK_MODE } from "@/app/constants";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  activeProfile: Profile | undefined;
  setIsOpen: (isOpen: boolean) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  activeProfile,
  setIsOpen,
}) => {
  const [validProfilePoints, setValidProfilePoints] = useState<any[]>([]);

  // Common regex pattern
  const JSON_REGEX = /```json\n([\s\S]*?)```/g;

  useEffect(() => {
    if (!activeProfile) return;

    if (activeProfile.mode === TASK_MODE.TEXT_SEGMENTATION) {
      const extractedPoints = extractSegmentationProfilePoints(message.content);
      setValidProfilePoints(extractedPoints);
    } else {
      const extractedPoints = extractProfilePoints(message.content);
      setValidProfilePoints(extractedPoints);
    }
  }, [message.content, activeProfile]);

  const handleAdoptAll = async () => {
    if (!activeProfile) {
      console.error("No active profile");
      return;
    }

    try {
      let results;

      if (activeProfile.mode === TASK_MODE.TEXT_SEGMENTATION) {
        results = await adoptAllSegmentationProfilePoints(
          validProfilePoints,
          activeProfile.id,
          createSegmentationProfilePoint
        );
      } else {
        results = await adoptAllProfilePoints(
          validProfilePoints,
          activeProfile.id,
          createProfilePoint
        );
      }

      console.log("Successfully adopted all profile points:", results);
      setIsOpen(false);
    } catch (error) {
      console.error("Error adopting profile points:", error);
    }
  };

  const renderContent = () => {
    const parts = message.content.split(JSON_REGEX);

    return parts
      .map((part, index) => {
        if (index % 4 === 0) {
          // Replace newlines with <br /> elements in text content
          const textWithBreaks = part.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < part.split("\n").length - 1 && <br />}
            </React.Fragment>
          ));
          return <span key={index}>{textWithBreaks}</span>;
        } else if (part) {
          try {
            const jsonString = (
              part.startsWith("```json") ? parts[index + 1] : part
            )
              .trim()
              .replace(/:\s*undefined\s*/g, ": null")
              .replace(/:\s*"undefined"\s*/g, ": null");

            return (
              <ProfileJsonContent
                key={index}
                content={jsonString}
                activeProfile={activeProfile}
              />
            );
          } catch (error) {
            console.error("Error parsing JSON in render:", error);
            return null;
          }
        }
        return null;
      })
      .filter(Boolean);
  };

  return (
    <div
      className={`mb-2 ${message.role === "user" ? "text-right" : "text-left"}`}
      data-cy={message.role === "user" ? "user-message" : "assistant-message"}
    >
      <div
        className={`inline-block p-2 rounded-lg ${
          message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        data-cy="message-content"
      >
        {message.role === "assistant" && validProfilePoints.length > 0 && (
          <div className="mb-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 border-gray-300"
              onClick={handleAdoptAll}
              data-cy="adopt-all-button-top"
            >
              Adopt All ({validProfilePoints.length})
            </Button>
          </div>
        )}
        {renderContent()}
        {message.role === "assistant" && validProfilePoints.length > 0 && (
          <div className="mt-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 border-gray-300"
              onClick={handleAdoptAll}
              data-cy="adopt-all-button-bottom"
            >
              Adopt All ({validProfilePoints.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
