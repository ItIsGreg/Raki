import React from "react";
import { Button } from "@/components/ui/button";
import { ProfilePointCreate, Profile } from "@/lib/db/db";
import { createProfilePoint } from "@/lib/db/crud";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
  isProfilePointCreate,
  handleAdoptProfilePoint,
} from "./profileChatUtils";

interface JsonContentProps {
  content: string;
  activeProfile: Profile | undefined;
}

const JsonContent: React.FC<JsonContentProps> = ({
  content,
  activeProfile,
}) => {
  const handleAdopt = async (profilePoint: Partial<ProfilePointCreate>) => {
    if (!activeProfile) {
      console.error("No active profile");
      return;
    }

    try {
      const newProfilePoint = await handleAdoptProfilePoint(
        profilePoint,
        activeProfile,
        createProfilePoint
      );
      console.log("Adopted profile point:", newProfilePoint);
      // Don't close the dialog here
    } catch (error) {
      console.error("Error adopting profile point:", error);
    }
  };

  try {
    const parsedJson = JSON.parse(content);
    if (isProfilePointCreate(parsedJson)) {
      return (
        <div data-cy="json-content-container">
          <Button
            variant="outline"
            size="sm"
            className="text-xs text-gray-500 hover:text-gray-700 border-gray-300 mb-2"
            onClick={() => handleAdopt(parsedJson)}
            data-cy="adopt-button"
          >
            Adopt
          </Button>
          <SyntaxHighlighter
            language="json"
            style={github}
            customStyle={{
              padding: "1rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
            data-cy="json-syntax-highlighter"
          >
            {JSON.stringify(parsedJson, null, 2)}
          </SyntaxHighlighter>
        </div>
      );
    }
  } catch (error) {
    // If parsing fails, treat it as regular text
    console.error("Failed JSON parsing:", error);
    console.log("Content:", content);
  }

  // Regular text content or failed JSON parsing
  return <span data-cy="plain-text-content">{content}</span>;
};

export default JsonContent;
