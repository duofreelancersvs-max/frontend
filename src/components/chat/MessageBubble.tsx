import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

export interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  showDate?: boolean;
  dateLabel?: string;
  senderName?: string;
  role?: "client" | "freelancer" | "admin";
}

const MessageBubble = ({
  content,
  timestamp,
  isOwn,
  isRead,
  showDate,
  dateLabel,
  senderName,
  role,
}: MessageBubbleProps) => {
  return (
    <div>
      {showDate && dateLabel && (
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 bg-slate-200/80 dark:bg-white/10 text-slate-500 dark:text-slate-400 text-xs font-medium rounded-full">
            {dateLabel}
          </span>
        </div>
      )}
      <div className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}>
        <div className="max-w-[70%]">
          {senderName && role === "admin" && (
            <div className={cn("text-xs text-slate-400 mb-1 px-1 font-medium", isOwn ? "text-right" : "text-left")}>
              {senderName}
            </div>
          )}
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words whitespace-pre-wrap",
              isOwn
                ? "bg-teal text-white rounded-br-sm shadow-sm"
                : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-bl-sm shadow-sm border border-slate-100 dark:border-white/10",
            )}
          >
            {content}
          </div>
          <div
            className={cn(
              "flex items-center gap-1 mt-1 px-1",
              isOwn ? "justify-end" : "justify-start",
            )}
          >
            <span className="text-xxs text-slate-400 dark:text-slate-500">{timestamp}</span>
            {isOwn &&
              (isRead ? (
                <CheckCheck size={12} className="text-teal" />
              ) : (
                <Check size={12} className="text-slate-400 dark:text-slate-600" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
