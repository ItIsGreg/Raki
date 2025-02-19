import { Card, CardHeader, CardFooter, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ReactNode } from "react";

interface CompactCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
  isActive?: boolean;
  tooltipContent?: string;
  rightIcon?: ReactNode;
  className?: string;
}

const CompactCard = ({
  title,
  description,
  onClick,
  isActive,
  tooltipContent,
  rightIcon,
  className = "",
}: CompactCardProps) => {
  const card = (
    <Card
      onClick={onClick}
      className={`cursor-pointer ${isActive ? "bg-gray-100" : ""} ${className}`}
    >
      <CardHeader className="flex flex-row gap-2 py-2">
        <CardTitle className="truncate text-sm">{title}</CardTitle>
        <div className="flex flex-grow"></div>
        {rightIcon && (
          <div className="w-5 h-5 flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </CardHeader>
      {description && (
        <CardFooter className="text-xs py-2">{description}</CardFooter>
      )}
    </Card>
  );

  if (tooltipContent) {
    return (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger asChild className="block">
            {card}
          </TooltipTrigger>
          <TooltipContent>{tooltipContent}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return card;
};

export default CompactCard;
