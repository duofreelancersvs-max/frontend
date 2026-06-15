import { MessageCircle, X } from "lucide-react";
import { createPortal } from "react-dom";

interface DraggableChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function DraggableChatWidget({ isOpen, onClose, children }: DraggableChatWidgetProps) {
  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        onClick={() => onClose()}
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 9998,
          background: "rgba(0,0,0,0.3)",
        }}
      />

      {/* Widget Shell — on mobile it's a fullscreen overlay,
           on desktop (>=640px) it floats bottom-right */}
      <div
        id="chat-widget-shell"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          zIndex: 9999,
          /* Grid with 3 rows: widget-header | content | (nothing) */
          display: "grid",
          gridTemplateRows: "auto 1fr",
          overflow: "hidden",
        }}
        className="
          bottom-0 right-0
          w-full h-[100dvh]
          bg-white dark:bg-background
          sm:bottom-6 sm:right-6
          sm:w-[450px] sm:h-[650px] sm:max-h-[calc(100dvh-3rem)]
          sm:rounded-2xl sm:border sm:border-slate-200 sm:dark:border-white/10
          sm:shadow-[0_0_40px_rgba(0,0,0,0.3)]
        "
      >
        {/* Row 1: Header */}
        <div
          className="bg-navy dark:bg-[#050B15] border-b border-white/10 text-white sm:rounded-t-2xl"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 16px",
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
            <MessageCircle size={18} /> Messages
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              padding: 6,
              borderRadius: 8,
              cursor: "pointer",
              background: "transparent",
              border: "none",
              color: "inherit",
            }}
            className="hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Row 2: Content — this is the only scrollable zone.
             The grid row `1fr` gives it exactly the remaining height,
             so children with overflow-y-auto will scroll correctly. */}
        <div
          style={{
            overflow: "hidden",
            /* Force the grid cell to respect 1fr and not grow */
            minHeight: 0,
          }}
        >
          {children}
        </div>
      </div>
    </>,
    document.body
  );
}
