import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DraggableChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function DraggableChatWidget({ isOpen, onClose, children }: DraggableChatWidgetProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only allow left click (button 0) or touch
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    
    // Ignore dragging if clicked on the close button or any other button
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    
    const startX = e.clientX;
    const startY = e.clientY;
    const initialX = position.x;
    const initialY = position.y;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - startX;
      const dy = moveEvent.clientY - startY;
      setPosition({
        x: initialX + dx,
        y: initialY + dy
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Reset position when closed
  useEffect(() => {
    if (!isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in z-[60] mb-4 pointer-events-none">
      <div 
        className="w-[450px] h-[650px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] flex flex-col pointer-events-auto"
        style={{ 
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out' 
        }}
      >
        <div className={cn(
          "bg-white dark:bg-background rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full h-full overflow-hidden flex flex-col transition-shadow duration-200",
          isDragging ? "shadow-3xl ring-2 ring-teal/20" : ""
        )}>
          <div 
            className="bg-navy dark:bg-[#050B15] border-b border-white/10 text-white px-4 py-3 flex justify-between items-center cursor-move select-none touch-none"
            onPointerDown={handlePointerDown}
          >
            <span className="font-semibold flex items-center gap-2 pointer-events-none">
              <MessageCircle size={18} /> Messages
            </span>
            <button 
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={onClose} 
              className="hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-hidden relative bg-white dark:bg-background">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
