import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "@/hooks/useSocket";
import { useNotificationStore } from "@/stores/notification.store";
import { useAuthStore } from "@/stores/auth.store";
import { toast } from "react-toastify";
import { Bell } from "lucide-react";
import { api } from "@/lib/api";
import type { PaginatedNotifications } from "@/types";

export const NotificationListener = () => {
  const { addNotification, setNotifications, setUnreadCount } = useNotificationStore();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const currentUserId = useAuthStore((s) => s.user?._id);
  const userRole = useAuthStore((s) => s.user?.role);
  const navigate = useNavigate();

  // Initial fetch of notifications
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;

    const fetchInitialNotifications = async () => {
      try {
        const [notifRes, countRes] = await Promise.all([
          api.get<PaginatedNotifications>('/notifications?limit=20'),
          api.get<{ count: number }>('/notifications/count')
        ]);
        setNotifications(notifRes.notifications);
        setUnreadCount(countRes.count);
      } catch (error) {
        console.error('Failed to fetch initial notifications:', error);
      }
    };

    fetchInitialNotifications();
  }, [isAuthenticated, currentUserId, setNotifications, setUnreadCount]);

  useSocket({
    onNotificationNew: (notification) => {
      if (!currentUserId) return;

      // Add to store
      addNotification(notification);

      // Show toast
      toast(
        <div className="flex items-start gap-3 w-full">
          <div className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mt-0.5">
            <Bell size={18} />
          </div>
          <div className="flex flex-col gap-1 pt-1 flex-1">
            <h4 className="font-semibold text-sm leading-tight text-foreground">{notification.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {notification.message}
            </p>
          </div>
        </div>,
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "shadow-lg border bg-card rounded-xl overflow-hidden",
          onClick: () => {
            let finalActionUrl = notification.data?.actionUrl;
            if (
              finalActionUrl && 
              (finalActionUrl.startsWith("/messages") || finalActionUrl.startsWith("/reviews")) &&
              userRole
            ) {
              finalActionUrl = `/${userRole}${finalActionUrl}`;
            }
            if (finalActionUrl) {
              navigate(finalActionUrl);
            }
          }
        }
      );

      // Optionally play a sound
      // const audio = new Audio('/sounds/notification.mp3');
      // audio.play().catch(e => console.log('Audio play failed', e));
    },
  });

  return null;
};
