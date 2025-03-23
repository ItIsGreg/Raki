import React from "react";
import { Button } from "@/components/ui/button";
import { Profile } from "@/lib/db/db";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface JsonContentProps<T, U> {
  content: string;
  activeProfile: Profile | undefined;
  isValidPoint: (obj: any) => obj is T;
  handleAdoptPoint: (
    point: Partial<T>,
    profile: Profile | undefined,
    createFn: (point: T) => Promise<any>
  ) => Promise<any>;
  createPoint: (point: T) => Promise<any>;
}

function JsonContent<T, U>({
  content,
  activeProfile,
  isValidPoint,
  handleAdoptPoint,
  createPoint,
}: JsonContentProps<T, U>) {
  const handleAdopt = async (point: Partial<T>) => {
    if (!activeProfile) {
      console.error("No active profile");
      return;
    }

    try {
      const newPoint = await handleAdoptPoint(
        point,
        activeProfile,
        createPoint
      );
      console.log("Adopted point:", newPoint);
      // Don't close the dialog here
    } catch (error) {
      console.error("Error adopting point:", error);
    }
  };

  try {
    const parsedJson = JSON.parse(content);
    if (isValidPoint(parsedJson)) {
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
}

export default JsonContent;
