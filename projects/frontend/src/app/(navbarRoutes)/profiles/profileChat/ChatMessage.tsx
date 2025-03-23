import React, { useState, useEffect } from "react";
import { ProfilePointCreate, Profile } from "@/lib/db/db";
import { Button } from "@/components/ui/button";
import { createProfilePoint } from "@/lib/db/crud";
import JsonContent from "./JsonContent";
import {
  extractProfilePoints,
  adoptAllProfilePoints,
} from "./profileChatUtils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  activeProfile: Profile | undefined;
  setIsOpen: (isOpen: boolean) => void;
  createProfilePointFn?: (point: ProfilePointCreate) => Promise<any>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  activeProfile,
  setIsOpen,
  createProfilePointFn = createProfilePoint,
}) => {
  const [validProfilePoints, setValidProfilePoints] = useState<
    ProfilePointCreate[]
  >([]);

  // Common regex pattern
  const JSON_REGEX = /```json\n([\s\S]*?)```/g;

  useEffect(() => {
    if (!activeProfile) return;

    const extractedPoints = extractProfilePoints(message.content);
    setValidProfilePoints(extractedPoints);
  }, [message.content, activeProfile]);

  const handleAdoptAll = async () => {
    if (!activeProfile) {
      console.error("No active profile");
      return;
    }

    try {
      const results = await adoptAllProfilePoints(
        validProfilePoints,
        activeProfile.id,
        createProfilePointFn
      );
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

            console.log("Rendering JSON content part:", jsonString);
            const parsedJson = JSON.parse(jsonString);
            const cleanedJson = Object.fromEntries(
              Object.entries(parsedJson).filter(([_, value]) => value !== null)
            );

            return (
              <JsonContent
                key={index}
                content={JSON.stringify(cleanedJson, null, 2)}
                activeProfile={activeProfile}
                data-cy="json-content"
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
