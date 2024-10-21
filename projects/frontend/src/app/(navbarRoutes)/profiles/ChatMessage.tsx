import React, { useState, useEffect } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { ProfilePointCreate, Profile } from "@/lib/db/db";
import { Button } from "@/components/ui/button";
import { createProfilePoint } from "@/lib/db/crud";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
  activeProfile: Profile | undefined;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  activeProfile,
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
        // Ignore invalid JSON
      }
    }

    return points;
  };

  const handleAdoptAll = async () => {
    if (!activeProfile) {
      console.error("No active profile");
      return;
    }

    try {
      const results = await Promise.all(
        validProfilePoints.map((point) =>
          createProfilePoint({
            ...point,
            profileId: activeProfile.id,
          })
        )
      );
      console.log("Adopted all profile points:", results);
      // Add UI feedback here
    } catch (error) {
      console.error("Error adopting profile points:", error);
      // Add error handling UI here
    }
  };

  const renderContent = () => {
    const jsonRegex = /```json\n([\s\S]*?)```/g;
    const parts: { content: string; isJson: boolean }[] = [];
    let lastIndex = 0;

    message.content.replace(jsonRegex, (match, jsonContent, offset) => {
      if (offset > lastIndex) {
        parts.push({
          content: message.content.slice(lastIndex, offset),
          isJson: false,
        });
      }
      parts.push({ content: jsonContent.trim(), isJson: true });
      lastIndex = offset + match.length;
      return match;
    });

    if (lastIndex < message.content.length) {
      parts.push({ content: message.content.slice(lastIndex), isJson: false });
    }

    return parts
      .map(({ content, isJson }, index) => {
        if (isJson) {
          try {
            const parsedJson = JSON.parse(content);
            if (isProfilePointCreate(parsedJson)) {
              return (
                <div key={index}>
                  <Button
                    variant="default"
                    className="mb-2"
                    onClick={() => handleAdopt(parsedJson)}
                  >
                    Adopt
                  </Button>
                  <SyntaxHighlighter language="json" style={github}>
                    {content}
                  </SyntaxHighlighter>
                </div>
              );
            }
          } catch (error) {
            // If parsing fails, treat it as regular text
          }
        }

        // Regular text content or failed JSON parsing
        return content ? <span key={index}>{content}</span> : null;
      })
      .filter(Boolean); // Remove null elements
  };

  const handleAdopt = async (profilePoint: ProfilePointCreate) => {
    if (!activeProfile) {
      console.error("No active profile");
      return;
    }

    try {
      const newProfilePoint = await createProfilePoint({
        ...profilePoint,
        profileId: activeProfile.id,
      });
      console.log("Adopted profile point:", newProfilePoint);
      // You might want to add some UI feedback here
    } catch (error) {
      console.error("Error adopting profile point:", error);
      // You might want to add some error handling UI here
    }
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

  return (
    <div
      className={`mb-2 ${message.role === "user" ? "text-right" : "text-left"}`}
    >
      {message.role === "assistant" && validProfilePoints.length > 0 && (
        <Button variant="default" className="mb-2" onClick={handleAdoptAll}>
          Adopt All ({validProfilePoints.length})
        </Button>
      )}
      <div
        className={`inline-block p-2 rounded-lg ${
          message.role === "user" ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        {renderContent()}
      </div>
      {message.role === "assistant" && validProfilePoints.length > 0 && (
        <Button variant="default" className="mt-2" onClick={handleAdoptAll}>
          Adopt All ({validProfilePoints.length})
        </Button>
      )}
    </div>
  );
};

export default ChatMessage;
