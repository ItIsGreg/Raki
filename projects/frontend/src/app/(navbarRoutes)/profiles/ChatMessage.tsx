import React from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { github } from "react-syntax-highlighter/dist/esm/styles/hljs";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const renderContent = () => {
    const jsonRegex = /```json\n([\s\S]*?)```/g;
    const parts = message.content.split(jsonRegex);

    return parts.map((part, index) => {
      if (index % 2 === 1) {
        // JSON content
        return (
          <SyntaxHighlighter key={index} language="json" style={github}>
            {part.trim()}
          </SyntaxHighlighter>
        );
      }
      // Regular text content
      return <span key={index}>{part}</span>;
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
        {renderContent()}
      </div>
    </div>
  );
};

export default ChatMessage;
