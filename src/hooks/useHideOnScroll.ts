import { useCallback, useRef, useState } from "react";

/**
 * Hides chrome (e.g. bottom nav) when scrolling down; shows when scrolling up.
 * Attach returned `onScroll` to the scrollable container ref.
 */
export function useHideOnScroll(threshold = 12) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  const onScroll = useCallback(
    (e: React.UIEvent<HTMLElement> | Event) => {
      // Use capturing target or currentTarget
      const target = (e.target || e.currentTarget) as HTMLElement;
      // Some targets like Document don't have scrollTop. Fallback to scrollingElement.
      const scrollElement = target.scrollTop !== undefined ? target : document.scrollingElement;
      
      if (!scrollElement || typeof scrollElement.scrollTop !== "number") return;

      const y = scrollElement.scrollTop;
      const delta = y - lastY.current;

      if (Math.abs(delta) < threshold) return;

      if (y <= 0) {
        setHidden(false);
      } else if (delta > 0 && y > 80) {
        setHidden(true);
      } else if (delta < 0) {
        setHidden(false);
      }

      lastY.current = y;
    },
    [threshold],
  );

  const reset = useCallback(() => {
    lastY.current = 0;
    setHidden(false);
  }, []);

  return { hidden, onScroll, reset };
}
