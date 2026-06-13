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
        "relative flex items-center gap-2 md:gap-4 px-4 md:px-6 h-14 rounded-full shadow-2xl cursor-grab active:cursor-grabbing select-none pointer-events-auto touch-none",
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
        </div>
      )}

      {/* Floating Unread Badge */}
      {!isOpen && unreadCount > 0 && (
        <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-red-500 text-white text-[11px] font-bold shadow-md border-2 border-[#1A1E27] animate-in zoom-in pointer-events-none z-20">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
};
