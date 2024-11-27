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

  // Common regex pattern
  const JSON_REGEX = /(```json\n([\s\S]*?)```)|(\{[\s\S]*?\})/g;

  useEffect(() => {
    const extractedPoints = extractProfilePoints(message.content);
    setValidProfilePoints(extractedPoints);
  }, [message.content]);

  const extractProfilePoints = (content: string): ProfilePointCreate[] => {
    const points: ProfilePointCreate[] = [];
    const parts = content.split(JSON_REGEX);

    parts.forEach((part, index) => {
      if (index % 4 !== 0 && part) {
        try {
          const jsonString = (
            part.startsWith("```json") ? parts[index + 1] : part
          )
            .trim()
            .replace(/:\s*undefined\s*/g, ": null")
            .replace(/:\s*"undefined"\s*/g, ": null");

          const parsedJson = JSON.parse(jsonString);
          const cleanedJson = Object.fromEntries(
            Object.entries(parsedJson).filter(([_, value]) => value !== null)
          );

          if (isProfilePointCreate(cleanedJson)) {
            points.push(cleanedJson);
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      }
    });

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

            // Parse and clean the JSON
            const parsedJson = JSON.parse(jsonString);
            const cleanedJson = Object.fromEntries(
              Object.entries(parsedJson).filter(([_, value]) => value !== null)
            );

            return (
              <JsonContent
                key={index}
                content={JSON.stringify(cleanedJson, null, 2)}
                activeProfile={activeProfile}
              />
            );
          } catch (error) {
            console.error("Error parsing JSON:", error);
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
