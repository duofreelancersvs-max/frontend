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

  const avatars = conversations
    .flatMap((c) => c.participants || [])
    .filter((p) => p.id !== currentUserId)
    .slice(0, 3)
    .map((p) => ({ url: p.avatar, name: p.fullName }));

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
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FreelancerLayout;
