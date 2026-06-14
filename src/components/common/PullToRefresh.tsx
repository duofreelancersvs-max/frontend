import React, { useState, useRef } from "react";
import { Loader2 } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  onRefresh,
  children,
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startYRef = useRef(0);

  const MAX_PULL = 120;
  const THRESHOLD = 70;

  const handleTouchStart = (e: React.TouchEvent) => {
    // Find the closest scrollable container
    const target = e.target as HTMLElement;
    const scrollParent =
      target.closest('[class*="overflow-y-auto"]') ||
      document.documentElement;

    // Only allow pulling if we are at the very top
    if (scrollParent.scrollTop <= 0) {
      startYRef.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const diff = currentY - startYRef.current;

    if (diff > 0) {
      // Add friction/resistance to the pull
      const resistance =
        diff > MAX_PULL ? MAX_PULL + (diff - MAX_PULL) * 0.2 : diff;
      setPullDistance(resistance);

      // Prevent native browser scroll while pulling
      if (e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;
    setIsPulling(false);

    if (pullDistance >= THRESHOLD) {
      setIsRefreshing(true);
      setPullDistance(THRESHOLD); // Snap to threshold position while loading
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      // Snap back if threshold not reached
      setPullDistance(0);
    }
  };

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Absolute spinner overlay that doesn't push layout */}
      <div
        className="absolute left-0 w-full flex justify-center z-[100] pointer-events-none transition-transform duration-200"
        style={{
          transform: `translateY(${Math.max(pullDistance - 50, -50)}px)`,
          opacity: Math.min(pullDistance / THRESHOLD, 1),
        }}
      >
        <div className="bg-white dark:bg-[#111827] rounded-full p-2.5 shadow-lg border border-slate-200 dark:border-white/10 flex items-center justify-center">
          <Loader2
            size={24}
            className={`text-teal ${isRefreshing ? "animate-spin" : ""}`}
            style={!isRefreshing ? { transform: `rotate(${pullDistance * 3}deg)` } : undefined}
          />
        </div>
      </div>

      {/* Content wrapper */}
      {children}
    </div>
  );
};
