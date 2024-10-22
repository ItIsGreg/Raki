import React, { useState, useEffect } from "react";
import { ProfilePointCreate, Profile } from "@/lib/db/db";
import { Button } from "@/components/ui/button";
import { createProfilePoint } from "@/lib/db/crud";
import JsonContent from "./JsonContent";

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
  const [validProfilePoints, setValidProfilePoints] = useState<
    ProfilePointCreate[]
  >([]);

  useEffect(() => {
    const extractedPoints = extractProfilePoints(message.content);
    setValidProfilePoints(extractedPoints);
  }, [message.content]);

  const extractProfilePoints = (content: string): ProfilePointCreate[] => {
    const jsonRegex = /```json\n([\s\S]*?)```/g;
    const points: ProfilePointCreate[] = [];

    let match;
    while ((match = jsonRegex.exec(content)) !== null) {
      try {
        const parsedJson = JSON.parse(match[1].trim());
        if (isProfilePointCreate(parsedJson)) {
          points.push(parsedJson);
        }
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    }

    return points;
  };

  const isProfilePointCreate = (obj: any): obj is ProfilePointCreate => {
    return (
      typeof obj === "object" &&
      obj !== null &&
      typeof obj.name === "string" &&
      typeof obj.explanation === "string" &&
      Array.isArray(obj.synonyms) &&
      typeof obj.datatype === "string" &&
      (obj.valueset === undefined || Array.isArray(obj.valueset)) &&
      (obj.unit === undefined || typeof obj.unit === "string")
    );
  };

  const handleAdoptAll = async () => {
    if (!activeProfile) {
      console.error("No active profile");
      return;
    }

    try {
      const results = await Promise.all(
        validProfilePoints.map((point) => {
          const completeProfilePoint: ProfilePointCreate = {
            name: point.name || "",
            explanation: point.explanation || "",
            synonyms: point.synonyms || [],
            datatype: point.datatype || "",
            valueset: point.valueset || [],
            unit: point.unit || "",
            profileId: activeProfile.id,
          };
          return createProfilePoint(completeProfilePoint);
        })
      );
      console.log("Adopted all profile points:", results);
      setIsOpen(false); // Close the dialog after adopting all
    } catch (error) {
      console.error("Error adopting profile points:", error);
    }
  };

  const renderContent = () => {
    const jsonRegex = /```json\n([\s\S]*?)```/g;
    const parts = message.content.split(jsonRegex);

    return parts.map((part, index) => {
      if (index % 2 === 0) {
        return <span key={index}>{part}</span>;
      } else {
        return (
          <JsonContent
            key={index}
            content={part.trim()}
            activeProfile={activeProfile}
          />
        );
      }
    });
  };

  return (
    <div
      className={`mb-2 ${message.role === "user" ? "text-right" : "text-left"}`}
    >
      <div
        className={`inline-block p-2 rounded-lg ${
          message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        {message.role === "assistant" && validProfilePoints.length > 0 && (
          <div className="mb-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs text-gray-500 hover:text-gray-700 border-gray-300"
              onClick={handleAdoptAll}
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
