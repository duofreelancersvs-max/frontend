import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import type { Conversation } from "@/services/conversation.service";
import FreelancerSidebar from "@/components/layout/FreelancerSidebar";
import FreelancerMessages from "@/pages/freelancer/Messages";
import { useUnreadStore } from "@/stores/unread.store";
import { DraggableChatWidget } from "@/components/chat/DraggableChatWidget";
import { ChatBubbleButton } from "@/components/chat";
import { useMyConversations } from "@/hooks/queries/useFreelancerDashboardQueries";
import { useAuthStore } from "@/stores/auth.store";
import { useDraggable } from "@/hooks/useDraggable";

export type FreelancerLayoutContext = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const FreelancerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const unreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { data } = useMyConversations();
  const conversations: Conversation[] = data?.conversations || [];
  const { user } = useAuthStore();
  const currentUserId = user?._id;
  const location = useLocation();
  const { position, dragHandlers, didDrag, resetPosition } = useDraggable();

  const uniqueParticipants: { url?: string; name: string }[] = [];
  const seenIds = new Set<string>();
  
  const sortedConvs = [...conversations].sort((a, b) => {
    const dateA = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const dateB = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  for (const conv of sortedConvs) {
    const participants = conv.participants || [];
    for (const p of participants) {
      if (p.id !== currentUserId && !seenIds.has(p.id)) {
        seenIds.add(p.id);
        uniqueParticipants.push({ url: p.avatar, name: p.fullName });
        if (uniqueParticipants.length === 3) break;
      }
    }
    if (uniqueParticipants.length === 3) break;
  }
  
  const avatars = uniqueParticipants;

  useEffect(() => {
    setIsMessagesOpen(false);
    resetPosition();
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] bg-background font-sans transition-colors duration-300 overflow-hidden">
      <FreelancerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-[100dvh] lg:ml-64 transition-all duration-300 relative w-full overflow-y-auto overflow-x-hidden">
        <Outlet context={{ setSidebarOpen, sidebarOpen }} />

        {!location.pathname.includes("/messages") && (
          <div
            className="fixed bottom-6 right-6 z-50 flex flex-col items-end"
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
            }}
          >
            {isMessagesOpen && (
              <DraggableChatWidget
                isOpen={isMessagesOpen}
                onClose={() => setIsMessagesOpen(false)}
                dragHandlers={dragHandlers}
              >
                <FreelancerMessages isWidget={true} onWidgetClose={() => setIsMessagesOpen(false)} />
              </DraggableChatWidget>
            )}
            {!isMessagesOpen && (
              <ChatBubbleButton
                isOpen={isMessagesOpen}
                onClick={() => {
                  if (!didDrag()) {
                    setIsMessagesOpen(!isMessagesOpen);
                  }
                }}
                unreadCount={unreadCount}
                avatars={avatars}
                dragHandlers={dragHandlers}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerLayout;
