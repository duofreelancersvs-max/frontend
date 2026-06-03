import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import FreelancerSidebar from "@/components/layout/FreelancerSidebar";
import FreelancerMessages from "@/pages/freelancer/Messages";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnreadStore } from "@/stores/unread.store";
import { DraggableChatWidget } from "@/components/chat/DraggableChatWidget";

export type FreelancerLayoutContext = {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
};

const FreelancerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);
  const unreadCount = useUnreadStore((s) => s.totalUnreadCount);
  const location = useLocation();

  useEffect(() => {
    setIsMessagesOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex h-[100dvh] bg-background font-sans transition-colors duration-300 overflow-hidden">
      <FreelancerSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col h-[100dvh] lg:ml-64 transition-all duration-300 relative w-full overflow-y-auto overflow-x-hidden">
        <Outlet context={{ setSidebarOpen, sidebarOpen }} />
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <DraggableChatWidget isOpen={isMessagesOpen} onClose={() => setIsMessagesOpen(false)}>
          <FreelancerMessages isWidget={true} onWidgetClose={() => setIsMessagesOpen(false)} />
        </DraggableChatWidget>
        <div className="relative inline-block float-right">
          <Button 
            onClick={() => setIsMessagesOpen(!isMessagesOpen)} 
            className="rounded-full w-14 h-14 shadow-2xl bg-teal hover:bg-teal-light transition-all flex items-center justify-center p-0 active:scale-95"
          >
            {isMessagesOpen ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-white" />}
          </Button>
          {!isMessagesOpen && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-background shadow-sm animate-in zoom-in">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreelancerLayout;
