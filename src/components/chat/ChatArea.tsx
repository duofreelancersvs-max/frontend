import { useRef, useEffect, useState } from "react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  ArrowLeft,
  Verified,
  BadgeCheck,
  Phone,
  Video,
  MoreVertical,
  Smile,
  Send,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Message } from "@/services";
import { ChatAvatar } from "./index";
import MessageBubble from "./MessageBubble";
import ChatTermsOverlay from "./ChatTermsOverlay";

export interface ChatParticipant {
  name: string;
  avatar?: string;
  verified: boolean;
  online: boolean;
}

export interface ChatProject {
  id: string;
  title: string;
}

interface ChatAreaProps {
  participant: ChatParticipant | null;
  project?: ChatProject | null;
  messages: Message[];
  messageInput: string;
  setMessageInput: (value: string) => void;
  onSend: () => void;
  onBack?: () => void;
  isConnected: boolean;
  currentUserId?: string;
  role: "client" | "freelancer";
  termsAccepted: boolean;
  onAcceptTermsClick: () => void;
  showInfoPanel?: boolean;
  onToggleInfoPanel?: () => void;
  className?: string;
}

const ChatArea = ({
  participant,
  project,
  messages,
  messageInput,
  setMessageInput,
  onSend,
  onBack,
  isConnected,
  currentUserId,
  role,
  termsAccepted,
  onAcceptTermsClick,
  showInfoPanel,
  onToggleInfoPanel,
  className,
}: ChatAreaProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);
  const VerifyIcon = role === "client" ? Verified : BadgeCheck;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!participant) {
    return (
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50",
          className,
        )}
      >
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-4">
          <MessageSquare size={28} className="text-slate-400" />
        </div>
        <h3 className="text-lg font-semibold text-navy mb-1">
          Select a conversation
        </h3>
        <p className="text-sm text-slate-500">
          Choose a conversation to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col bg-slate-50 min-w-0", className)}>
      {/* Chat Header */}
      <div className="h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <ChatAvatar
            name={participant.name}
            size="md"
            online={participant.online}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-navy text-sm">
                {participant.name}
              </h3>
              {participant.verified && (
                <VerifyIcon size={14} className="text-teal" />
              )}
            </div>
            <p className="text-xs text-slate-500">
              {participant.online ? "Online" : "Offline"}
              {project && ` • ${project.title}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <Phone size={18} />
          </button>
          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
            <Video size={18} />
          </button>
          <button
            onClick={onToggleInfoPanel}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showInfoPanel
                ? "bg-teal/10 text-teal"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
            )}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4">
        {messages.map((msg, index) => {
          const msgDate = new Date(msg.createdAt).toLocaleDateString();
          const msgTime = new Date(msg.createdAt).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const prevMsgDate =
            index > 0
              ? new Date(messages[index - 1].createdAt).toLocaleDateString()
              : null;
          const showDate = index === 0 || msgDate !== prevMsgDate;
          const isOwn = msg.senderId === currentUserId;

          return (
            <MessageBubble
              key={msg.id}
              content={msg.content}
              timestamp={msgTime}
              isOwn={isOwn}
              isRead={msg.read}
              showDate={showDate}
              dateLabel={msgDate}
            />
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input or Terms Overlay */}
      {!termsAccepted ? (
        <ChatTermsOverlay onAcceptClick={onAcceptTermsClick} />
      ) : (
        <div className="bg-white border-t border-slate-200 p-4 flex-shrink-0 relative">
          <div className="flex items-center gap-2">
            <div className="relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showEmojiPicker
                    ? "bg-teal/10 text-teal"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-100",
                )}
              >
                <Smile size={20} />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-50 shadow-2xl border border-slate-200 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setMessageInput(messageInput + emojiData.emoji);
                      // Don't close picker automatically for better UX
                    }}
                    theme={Theme.LIGHT}
                    lazyLoadEmojis={true}
                    skinTonesDisabled={true}
                    searchPlaceHolder="Search emojis..."
                    width={320}
                    height={400}
                  />
                </div>
              )}
            </div>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              className="flex-1 h-10 px-4 rounded-full bg-slate-100 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            <Button
              onClick={onSend}
              disabled={!messageInput.trim() || !isConnected}
              className="h-10 w-10 p-0 rounded-full bg-teal hover:bg-teal-light text-white disabled:opacity-50"
            >
              <Send size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatArea;
