import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { backendURL } from "../../../constants";
import ChatMessage from "./ChatMessage";
import { Profile } from "@/lib/db/db";
import { useLiveQuery } from "dexie-react-hooks";
import {
  readAllApiKeys,
  readAllLLMProviders,
  readAllLLMUrls,
  readAllModels,
  readAllMaxTokens,
} from "@/lib/db/crud";

interface ProfileChatViewProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  activeProfile: Profile | undefined;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ProfileChatView = ({
  isOpen,
  setIsOpen,
  activeProfile,
}: ProfileChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dbLlmProvider = useLiveQuery(() => readAllLLMProviders());
  const dbLlmModel = useLiveQuery(() => readAllModels());
  const dbLlmUrl = useLiveQuery(() => readAllLLMUrls());
  const dbApiKeys = useLiveQuery(() => readAllApiKeys());
  const dbMaxTokens = useLiveQuery(() => readAllMaxTokens());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const callProfileChatAPI = async (messages: Message[]) => {
    if (
      !dbLlmProvider ||
      !dbLlmModel ||
      !dbLlmUrl ||
      !dbApiKeys ||
      !dbMaxTokens
    )
      return;

    try {
      const response = await fetch(`${backendURL}/profile-chat/profile-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: messages,
          stream: true,
          llm_provider: dbLlmProvider[0].provider,
          model: dbLlmModel[0].name,
          llm_url: dbLlmUrl[0].url,
          api_key: dbApiKeys[0].key,
          max_tokens: dbMaxTokens[0].value,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      return response;
    } catch (error) {
      console.error("Error in callProfileChatAPI:", error);
      throw error;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await callProfileChatAPI([...messages, userMessage]);
      if (!response) return;
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let assistantMessage: Message = { role: "assistant", content: "" };
        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          assistantMessage.content += chunk;
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { ...assistantMessage },
          ]);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[80%] w-full sm:h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>AI Chat</DialogTitle>
          <Button onClick={handleNewChat} className="ml-auto">
            New Chat
          </Button>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto mb-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message}
              activeProfile={activeProfile}
              setIsOpen={setIsOpen}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.ctrlKey) {
                  setInput((prev) => prev + "\n");
                } else if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }
            }}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 min-h-[40px] px-3 py-2 rounded-md border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            rows={1}
          />
          <Button onClick={handleSend} disabled={isLoading} className="ml-2">
            Send
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileChatView;
