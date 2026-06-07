import React from "react";
import { cn } from "@/lib/utils";

interface ProPlanBadgeProps {
  className?: string;
}

export const ProPlanBadge: React.FC<ProPlanBadgeProps> = ({ className }) => {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xxs font-black bg-gradient-to-r from-teal to-teal-light text-white uppercase tracking-wider shadow-sm",
        className,
      )}
    >
      PRO
    </span>
  );
};
