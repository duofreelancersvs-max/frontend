import { useState, useEffect, lazy, Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import type { Conversation } from "@/services/conversation.service";
import ClientSidebar from "@/components/layout/ClientSidebar";
import BottomNav from "@/components/layout/BottomNav";
import { clientBottomNavItems } from "@/config/navigation";
import { useUnreadStore } from "@/stores/unread.store";
import { DraggableChatWidget } from "@/components/chat/DraggableChatWidget";
import { ChatBubbleButton } from "@/components/chat";
import { useConversations } from "@/hooks/queries/useClientDashboardQueries";
import { useAuthStore } from "@/stores/auth.store";
import { useDraggable } from "@/hooks/useDraggable";
import { useHideOnScroll } from "@/hooks/useHideOnScroll";
import { PageSkeleton } from "@/components/shared/Skeleton";

const ClientMessages = lazy(() => import("@/pages/client/Messages"));

export type ClientLayoutContext = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const ClientLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const unreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const { data } = useConversations();
  const conversations: Conversation[] = data?.conversations || [];
  const { user } = useAuthStore();
  const currentUserId = user?._id;
  const location = useLocation();
  const { position, dragHandlers, didDrag, resetPosition } = useDraggable();
  const { hidden: navHidden, onScroll: onNavScroll, reset: resetNavScroll } = useHideOnScroll();

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
    resetNavScroll();
  }, [location.pathname, resetPosition, resetNavScroll]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const mainEl = document.getElementById("main-content");
    if (!mainEl) return;
    const handleScroll = (e: Event) => onNavScroll(e as any);
    mainEl.addEventListener("scroll", handleScroll, true);
    return () => mainEl.removeEventListener("scroll", handleScroll, true);
  }, [onNavScroll]);

  return (
    <div className="flex h-[100dvh] bg-background font-sans transition-colors duration-300 overflow-hidden">
      <ClientSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div
        className="flex-1 flex flex-col h-[100dvh] lg:ml-64 transition-all duration-300 relative w-full overflow-y-auto overflow-x-hidden pb-[var(--mobile-nav-pb)] md:!pb-0 lg:!pb-0"
        style={{ '--mobile-nav-pb': navHidden ? 'env(safe-area-inset-bottom, 0px)' : 'calc(4rem + env(safe-area-inset-bottom, 0px))' } as React.CSSProperties}
        onScroll={onNavScroll}
      >
        <main id="main-content" className="flex-1 min-w-0 min-h-0 flex flex-col">
          <Outlet context={{ setSidebarOpen, sidebarOpen }} />
        </main>

        <BottomNav items={clientBottomNavItems} hidden={navHidden} />

        {!location.pathname.includes("/messages") && (
          <>
            {isMessagesOpen && (
              <DraggableChatWidget
                isOpen={isMessagesOpen}
                onClose={() => setIsMessagesOpen(false)}
              >
                <Suspense fallback={<PageSkeleton />}>
                  <ClientMessages isWidget={true} onWidgetClose={() => setIsMessagesOpen(false)} />
                </Suspense>
              </DraggableChatWidget>
            )}
            <div
              className="hidden lg:flex fixed bottom-[calc(3.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-12 right-4 lg:right-6 z-50 flex-col items-end"
              style={{
                transform: isMessagesOpen
                  ? 'none'
                  : `translate3d(${position.x}px, ${position.y}px, 0)`,
              }}
            >
              <ChatBubbleButton
                isOpen={isMessagesOpen}
                onClick={() => {
                  if (!didDrag()) {
                    if (!isMessagesOpen) resetPosition();
                    setIsMessagesOpen(!isMessagesOpen);
                  }
                }}
                unreadCount={unreadCount}
                avatars={avatars}
                dragHandlers={isMessagesOpen ? undefined : dragHandlers}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientLayout;
