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
  role: "client" | "freelancer" | "admin";
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
    const hasValidName = !!conv.participant.name;
    return matchesSearch && matchesFilter && hasValidName;
  });

  const VerifyIcon = role === "client" ? Verified : BadgeCheck;

  return (
    <div
      className={cn(
        role === "admin"
          ? "bg-[#18181b] border-r border-white/5 flex flex-col"
          : "bg-white dark:bg-[#050B15] border-r border-slate-200 dark:border-white/5 flex flex-col",
        className,
      )}
    >
      {/* Search */}
      <div className={cn("p-4 border-b", role === "admin" ? "border-white/5" : "border-slate-100 dark:border-white/5")}>
        <div className="relative mb-3">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "pl-9 h-10 text-sm",
              role === "admin"
                ? "bg-white/5 border-white/10 text-white placeholder-slate-500 focus:border-indigo-500/50"
                : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 dark:text-white"
            )}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onFilterChange("all")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                role === "admin" 
                  ? filter === "all" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                  : filter === "all"
                  ? "bg-teal text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10",
            )}
          >
            All
          </button>
          <button
            onClick={() => onFilterChange("unread")}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-all",
                role === "admin"
                  ? filter === "unread" ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                  : filter === "unread"
                  ? "bg-teal text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10",
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
              role === "admin"
                ? selectedId === conv.id ? "bg-indigo-600/10 border-l-indigo-500" : "hover:bg-white/5 border-l-transparent"
                : selectedId === conv.id ? "bg-teal/5 dark:bg-teal/10 border-l-teal hover:bg-slate-50 dark:hover:bg-white/5" : "hover:bg-slate-50 dark:hover:bg-white/5 border-l-transparent",
            )}
          >
            {/* Avatar */}
            <ChatAvatar
              name={conv.participant.name}
              size="lg"
              online={onlineUsers.has(conv.participant.userId)}
            />

            {/* Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-center">
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span className={cn("font-semibold text-sm truncate", role === "admin" ? "text-white" : "text-navy dark:text-white")}>
                    {conv.participant.name}
                  </span>
                  {conv.participant.verified && (
                    <VerifyIcon size={14} className={cn("flex-shrink-0", role === "admin" ? "text-indigo-400" : "text-teal")} />
                  )}
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {conv.lastMessageTime}
                </span>
              </div>
              
              {(conv.project || role === "freelancer") && (
                <div className="flex items-center gap-2 mb-1">
                  {conv.project && (
                    <span className={cn("text-xs font-medium truncate", role === "admin" ? "text-indigo-400" : "text-teal")}>
                      {conv.project.title}
                    </span>
                  )}
                  {conv.project && role === "freelancer" && (
                    <span className="text-slate-300 text-xxs">•</span>
                  )}
                  {role === "freelancer" && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star size={10} className="text-[#F59E0B] fill-[#F59E0B]" />
                      <span className="text-xs text-slate-400 font-medium">
                        {conv.participant.rating}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                {conv.lastMessage}
              </p>
            </div>

            {/* Unread badge */}
            {conv.unread > 0 && (
              <span className={cn("self-center px-2 py-0.5 text-white text-xs font-bold rounded-full min-w-5 text-center flex-shrink-0", role === "admin" ? "bg-indigo-600" : "bg-teal")}>
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
