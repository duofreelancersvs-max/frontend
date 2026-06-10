import { MessageCircle, X } from "lucide-react";

interface DraggableChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  dragHandlers?: any;
}

export function DraggableChatWidget({ isOpen, onClose, children, dragHandlers }: DraggableChatWidgetProps) {
  if (!isOpen) return null;

  return (
    <div className="animate-in slide-in-from-bottom-4 fade-in z-[60] mb-2 pointer-events-none">
      <div 
        className="w-[450px] h-[650px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-8rem)] flex flex-col pointer-events-auto"
      >
        <div className="bg-white dark:bg-background rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full h-full overflow-hidden flex flex-col transition-shadow duration-200">
          <div 
            className="bg-navy dark:bg-[#050B15] border-b border-white/10 text-white px-4 py-3 flex justify-between items-center cursor-grab active:cursor-grabbing select-none"
            {...dragHandlers}
          >
            <span className="font-semibold flex items-center gap-2 pointer-events-none">
              <MessageCircle size={18} /> Messages
            </span>
            <button 
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={onClose} 
              className="hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer pointer-events-auto"
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
