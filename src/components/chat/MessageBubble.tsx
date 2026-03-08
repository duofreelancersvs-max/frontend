import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";

export interface MessageBubbleProps {
  content: string;
  timestamp: string;
  isOwn: boolean;
  isRead: boolean;
  showDate?: boolean;
  dateLabel?: string;
}

const MessageBubble = ({
  content,
  timestamp,
  isOwn,
  isRead,
  showDate,
  dateLabel,
}: MessageBubbleProps) => {
  return (
    <div>
      {showDate && dateLabel && (
        <div className="flex justify-center my-4">
          <span className="px-3 py-1 bg-slate-200/80 text-slate-500 text-xs font-medium rounded-full">
            {dateLabel}
          </span>
        </div>
      )}
      <div className={cn("flex mb-3", isOwn ? "justify-end" : "justify-start")}>
        <div className="max-w-[70%]">
          <div
            className={cn(
              "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
              isOwn
                ? "bg-teal text-white rounded-br-sm"
                : "bg-white text-slate-700 rounded-bl-sm shadow-sm border border-slate-100",
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
            <span className="text-[10px] text-slate-400">{timestamp}</span>
            {isOwn &&
              (isRead ? (
                <CheckCheck size={12} className="text-teal" />
              ) : (
                <Check size={12} className="text-slate-400" />
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
