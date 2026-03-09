import { Search, Verified, BadgeCheck, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChatAvatar } from "./index";

export interface ConversationItem {
  id: string;
  participant: {
    userId: string;
    name: string;
    avatar?: string;
    verified: boolean;
    rating: number;
    reviews: number;
  };
  project: {
    id: string;
    title: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  termsAccepted: boolean;
}

interface ConversationListProps {
  conversations: ConversationItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filter: "all" | "unread";
  onFilterChange: (filter: "all" | "unread") => void;
  onlineUsers: Set<string>;
  role: "client" | "freelancer";
  className?: string;
}

const ConversationList = ({
  conversations,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  filter,
  onFilterChange,
  onlineUsers,
  role,
  className,
}: ConversationListProps) => {
  const filteredConversations = conversations.filter((conv) => {
    const matchesSearch = conv.participant.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter =
      filter === "all" || (filter === "unread" && conv.unread > 0);
    // Filter out conversations with no valid participant name
    const hasValidName =
      conv.participant.name && conv.participant.name !== "Unknown";
    return matchesSearch && matchesFilter && hasValidName;
  });

  const VerifyIcon = role === "client" ? Verified : BadgeCheck;

  return (
    <div
      className={cn(
        "bg-white border-r border-slate-200 flex flex-col",
        className,
      )}
    >
      {/* Search */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 bg-slate-50 border-slate-200 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange("all")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              filter === "all"
                ? "bg-teal text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange("unread")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
              filter === "unread"
                ? "bg-teal text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            )}
          >
            Unread
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 && (
          <div className="p-6 text-center text-sm text-slate-400">
            No conversations found
          </div>
        )}
        {filteredConversations.map((conv) => (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full px-4 py-3 flex gap-3 hover:bg-slate-50 transition-colors text-left border-l-[3px]",
              selectedId === conv.id
                ? "bg-teal/5 border-l-teal"
                : "border-l-transparent",
            )}
          >
            {/* Avatar */}
            <ChatAvatar
              name={conv.participant.name}
              size="lg"
              online={onlineUsers.has(conv.participant.userId)}
            />

            {/* Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-navy text-sm truncate">
                    {conv.participant.name}
                  </span>
                  {conv.participant.verified && (
                    <VerifyIcon size={14} className="text-teal flex-shrink-0" />
                  )}
                </div>
                <span className="text-[11px] text-slate-400 flex-shrink-0">
                  {conv.lastMessageTime}
                </span>
              </div>
              {conv.project && (
                <p className="text-xs text-teal font-medium mb-0.5 truncate">
                  {conv.project.title}
                </p>
              )}
              {role === "freelancer" && (
                <div className="flex items-center gap-1 mb-0.5">
                  <Star size={10} className="text-gold fill-gold" />
                  <span className="text-xs text-slate-500">
                    {conv.participant.rating}
                  </span>
                </div>
              )}
              <p className="text-xs text-slate-500 truncate">
                {conv.lastMessage}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unread > 0 && (
              <span className="self-center px-2 py-0.5 bg-teal text-white text-xs font-bold rounded-full min-w-[20px] text-center flex-shrink-0">
                {conv.unread}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationList;
