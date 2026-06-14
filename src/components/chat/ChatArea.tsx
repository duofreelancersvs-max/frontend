import { useRef, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EmojiPicker, { Theme } from "emoji-picker-react";
import {
  ArrowLeft,
  Verified,
  BadgeCheck,
  CheckCircle,
  XCircle,
  MoreVertical,
  Smile,
  Send,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/stores/theme.store";
import type { Message } from "@/services";
import { ChatAvatar } from "./index";
import MessageBubble from "./MessageBubble";
import ChatTermsOverlay from "./ChatTermsOverlay";

export interface ChatParticipant {
  id?: string;
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
  applicationId?: string;
  applicationStatus?: string;
  onHire?: () => void;
  onReject?: () => void;
  isWidget?: boolean;
  disabledMessageInput?: boolean;
  disabledMessageReason?: string;
  isVisible?: boolean;
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
  applicationId,
  applicationStatus,
  onHire,
  onReject,
  isWidget,
  disabledMessageInput,
  disabledMessageReason,
  isVisible = true,
}: ChatAreaProps) => {
  const { theme } = useThemeStore();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    onSend();
    // Blur input on mobile devices to hide the keyboard
    if (window.innerWidth < 768) {
      inputRef.current?.blur();
    }
  };

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

  const isInitialMount = useRef(true);
  const prevParticipantId = useRef(participant?.id);

  useEffect(() => {
    if (isInitialMount.current || prevParticipantId.current !== participant?.id) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      isInitialMount.current = false;
      prevParticipantId.current = participant?.id;
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, participant?.id]);

  // Scroll to bottom whenever the chat panel becomes visible (e.g. mobile view switch)
  useEffect(() => {
    if (isVisible && messages.length > 0) {
      // Use a short timeout to allow the DOM to render before scrolling
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!participant) {
    return (
      <div
        className={cn(
          "flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 dark:bg-[#050B15]",
          className,
        )}
      >
        <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-white/5 flex items-center justify-center mb-4">
          <MessageSquare size={28} className="text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-navy dark:text-white mb-1">
          Select a conversation
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Choose a conversation to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex-1 flex flex-col bg-slate-50 dark:bg-[#050B15] min-w-0 border-r border-slate-200 dark:border-white/5", className)}>
      {/* Chat Header */}
      <div className="h-16 bg-white dark:bg-[#050B15] border-b border-slate-200 dark:border-white/5 px-4 flex items-center justify-between flex-shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className={cn("p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg", !isWidget && "lg:hidden")}
            >
              <ArrowLeft size={20} />
            </button>
          )}
          {role === 'client' ? (
            <Link to={`/client/freelancer/${participant.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ChatAvatar
                name={participant.name}
                size="md"
                online={participant.online}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-navy dark:text-white text-sm">
                    {participant.name}
                  </h3>
                  {participant.verified && (
                    <VerifyIcon size={14} className="text-teal" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {participant.online ? "Online" : "Offline"}
                  {project && ` • ${project.title}`}
                </p>
              </div>
            </Link>
          ) : (
            <button onClick={onToggleInfoPanel} className="flex items-center gap-3 hover:opacity-80 transition-opacity text-left">
              <ChatAvatar
                name={participant.name}
                size="md"
                online={participant.online}
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-navy dark:text-white text-sm">
                    {participant.name}
                  </h3>
                  {participant.verified && (
                    <VerifyIcon size={14} className="text-teal" />
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {participant.online ? "Online" : "Offline"}
                  {project && ` • ${project.title}`}
                </p>
              </div>
            </button>
          )}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          {role === "client" && applicationId ? (
            applicationStatus === "pending" || applicationStatus === "viewed" || applicationStatus === "shortlisted" || !applicationStatus ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onReject}
                  className="hidden sm:flex items-center gap-1.5 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300"
                >
                  <XCircle size={16} />
                  Reject
                </Button>
                <Button
                  size="sm"
                  onClick={onHire}
                  className="flex items-center gap-1.5 bg-success-green hover:bg-green-600 text-white"
                >
                  <CheckCircle size={16} />
                  Hire
                </Button>
              </div>
            ) : (
              <span
                className={cn(
                  "hidden sm:inline-flex px-3 py-1 rounded-full text-xs font-medium border",
                  applicationStatus === "accepted" || applicationStatus === "hired"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30"
                    : applicationStatus === "rejected"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30"
                      : "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-white/10"
                )}
              >
                {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
              </span>
            )
          ) : null}
            <button
            onClick={onToggleInfoPanel}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showInfoPanel
                ? "bg-teal/10 text-teal"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
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
        <div className="bg-white dark:bg-[#050B15] border-t border-slate-200 dark:border-white/10 p-4 flex-shrink-0 relative">
          <div className="flex items-center gap-2">
            <div className="relative" ref={emojiPickerRef}>
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  showEmojiPicker
                    ? "bg-teal/10 text-teal"
                    : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5",
                )}
              >
                <Smile size={20} />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-12 left-0 z-50 shadow-2xl border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <EmojiPicker
                    onEmojiClick={(emojiData) => {
                      setMessageInput(messageInput + emojiData.emoji);
                    }}
                    theme={theme === "dark" ? Theme.DARK : Theme.LIGHT}
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
              ref={inputRef}
              type="text"
              placeholder={disabledMessageReason || "Type a message..."}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              disabled={disabledMessageInput}
              className="flex-1 h-10 px-4 rounded-full bg-slate-100 dark:bg-white/5 border-0 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal/30 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <Button
              onClick={handleSend}
              disabled={disabledMessageInput || !messageInput.trim() || !isConnected}
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
