import { cn } from "@/lib/utils";

interface ChatAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  online?: boolean;
  className?: string;
  showOnlineIndicator?: boolean;
}

const ChatAvatar = ({
  name,
  size = "md",
  online = false,
  className,
  showOnlineIndicator = true,
}: ChatAvatarProps) => {
  const sizeClasses = {
    sm: "w-9 h-9 text-sm", // Used in top header dropdown
    md: "w-10 h-10 text-sm", // Used in ChatArea header
    lg: "w-11 h-11 text-sm", // Used in ConversationList item
    xl: "w-16 h-16 text-xl", // Used in ChatInfoPanel
    "2xl": "w-12 h-12 text-sm", // Used in Freelancer ConversationList
    "3xl": "w-20 h-20 text-2xl", // Used in Freelancer ChatInfoPanel
  };

  const indicatorContainerClasses = {
    sm: "h-2.5 w-2.5",
    md: "h-3 w-3",
    lg: "h-3.5 w-3.5",
    xl: "h-4 w-4",
    "2xl": "h-3.5 w-3.5",
    "3xl": "h-5 w-5",
  };

  const indicatorPositions = {
    sm: "-bottom-0.5 -right-0.5",
    md: "bottom-0 right-0",
    lg: "bottom-0 right-0",
    xl: "bottom-[2px] right-[2px]",
    "2xl": "bottom-0 right-0",
    "3xl": "bottom-[2px] right-[2px]",
  };

  return (
    <div className={cn("relative flex-shrink-0 inline-flex", sizeClasses[size], className)}>
      <div
        className="w-full h-full rounded-full bg-gradient-to-br from-royal-blue to-teal flex items-center justify-center text-white font-semibold"
      >
        {name ? name.charAt(0).toUpperCase() : "U"}
      </div>
      {showOnlineIndicator && online && (
        <span
          className={cn(
            "absolute flex",
            indicatorPositions[size],
            indicatorContainerClasses[size]
          )}
        >
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-full w-full bg-green-500 border-2 border-white"></span>
        </span>
      )}
    </div>
  );
};

export default ChatAvatar;
