import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatBubbleButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount: number;
  avatars?: { url?: string; name: string }[];
  className?: string;
  dragHandlers?: any;
}

export const ChatBubbleButton = ({
  isOpen,
  onClick,
  unreadCount,
  avatars = [],
  className,
  dragHandlers,
}: ChatBubbleButtonProps) => {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      {...dragHandlers}
      className={cn(
        "flex items-center gap-2 md:gap-4 px-4 md:px-6 h-14 rounded-full shadow-2xl cursor-grab active:cursor-grabbing select-none pointer-events-auto",
        "bg-[#1A1E27] hover:bg-[#252A36] border border-white/5 group",
        className
      )}
    >
      <div className="flex items-center gap-2 md:gap-3 pointer-events-none">
        {isOpen ? (
          <X size={20} className="text-white" />
        ) : (
          <MessageCircle size={22} className="text-white group-hover:text-teal transition-colors" />
        )}
        <span className="hidden md:inline font-medium text-white text-[15px] tracking-wide">
          {isOpen ? "Close" : "Messages"}
        </span>
      </div>

      {!isOpen && avatars.length > 0 && (
        <div className="hidden md:flex items-center -space-x-2.5 ml-3 pointer-events-none">
          {avatars.slice(0, 3).map((avatar, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full border-2 border-[#1A1E27] overflow-hidden bg-teal text-white flex items-center justify-center font-semibold text-sm shadow-sm"
              style={{ zIndex: 3 - i }}
            >
              {avatar.url ? (
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                (avatar.name || "U").charAt(0).toUpperCase()
              )}
            </div>
          ))}
          {unreadCount > 0 && (
            <div
              className="w-9 h-9 rounded-full border-2 border-[#1A1E27] bg-red-500 text-white flex items-center justify-center text-xxs font-bold z-10 relative shadow-sm animate-in zoom-in"
              style={{ zIndex: 4 }}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </div>
          )}
        </div>
      )}
      {!isOpen && avatars.length === 0 && unreadCount > 0 && (
        <div className="w-9 h-9 rounded-full border-2 border-[#1A1E27] bg-red-500 text-white flex items-center justify-center text-xxs font-bold z-10 relative ml-3 shadow-sm animate-in zoom-in">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
};
