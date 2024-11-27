import { Button } from "@/components/ui/button";
import { BotMessageSquare } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ProfileChatButtonProps {
  onClick: () => void;
}

const ProfileChatButton = ({ onClick }: ProfileChatButtonProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={onClick}>
          <BotMessageSquare className="h-5 w-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Use AI chat to create a profile</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

export default ProfileChatButton;
