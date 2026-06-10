import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Custom hook for making an element draggable using pointer events
 * attached to the window. Works on both mouse and touch devices.
 *
 * Uses window-level listeners (instead of setPointerCapture) so that
 * click events still fire normally on child elements.
 */
export function useDraggable() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const stateRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startRef = useRef({ pointerX: 0, pointerY: 0, posX: 0, posY: 0 });
  const containerRef = useRef<HTMLElement | null>(null);

  // Keep stateRef in sync with position state
  useEffect(() => {
    stateRef.current = position;
  }, [position]);

  const clamp = useCallback(
    (rawX: number, rawY: number, el: HTMLElement) => {
      const rect = el.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pad = 8;

      const moveX = rawX - stateRef.current.x;
      const moveY = rawY - stateRef.current.y;

      let x = rawX;
      let y = rawY;

      if (rect.left + moveX < pad) x = rawX + (pad - (rect.left + moveX));
      if (rect.right + moveX > vw - pad) x = rawX - ((rect.right + moveX) - (vw - pad));
      if (rect.top + moveY < pad) y = rawY + (pad - (rect.top + moveY));
      if (rect.bottom + moveY > vh - pad) y = rawY - ((rect.bottom + moveY) - (vh - pad));

      return { x, y };
    },
    [],
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Only primary button
      if (e.button !== 0) return;

      isDraggingRef.current = true;
      hasMovedRef.current = false;
      containerRef.current = e.currentTarget;
      startRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        posX: stateRef.current.x,
        posY: stateRef.current.y,
      };

      const handleMove = (moveEvt: PointerEvent) => {
        if (!isDraggingRef.current) return;

        const dx = moveEvt.clientX - startRef.current.pointerX;
        const dy = moveEvt.clientY - startRef.current.pointerY;

        if (!hasMovedRef.current && Math.abs(dx) + Math.abs(dy) > 5) {
          hasMovedRef.current = true;
        }

        if (hasMovedRef.current) {
          // Prevent scrolling on mobile during drag
          moveEvt.preventDefault();

          const rawX = startRef.current.posX + dx;
          const rawY = startRef.current.posY + dy;

          if (containerRef.current) {
            const clamped = clamp(rawX, rawY, containerRef.current);
            stateRef.current = clamped;
            setPosition(clamped);
          } else {
            stateRef.current = { x: rawX, y: rawY };
            setPosition({ x: rawX, y: rawY });
          }
        }
      };

      const handleUp = () => {
        isDraggingRef.current = false;
        window.removeEventListener("pointermove", handleMove);
        window.removeEventListener("pointerup", handleUp);
      };

      // Attach to window so we track the pointer even outside the element
      window.addEventListener("pointermove", handleMove, { passive: false });
      window.addEventListener("pointerup", handleUp);
    },
    [clamp],
  );

  /** True if the last gesture involved actual movement (not just a tap) */
  const didDrag = useCallback(() => hasMovedRef.current, []);

  return {
    position,
    dragHandlers: { onPointerDown },
    didDrag,
    resetPosition: useCallback(() => {
      stateRef.current = { x: 0, y: 0 };
      setPosition({ x: 0, y: 0 });
    }, []),
  };
}
