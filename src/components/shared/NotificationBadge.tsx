import React from "react";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  className,
}) => {
  if (count <= 0) return null;

  return (
    <span
      className={cn(
        "absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white transform translate-x-1/2 -translate-y-1/2",
        className,
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
};
