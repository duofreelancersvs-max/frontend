import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatTermsOverlayProps {
  onAcceptClick: () => void;
}

const ChatTermsOverlay = ({ onAcceptClick }: ChatTermsOverlayProps) => {
  return (
    <div className="bg-white border-t border-slate-200 p-6 flex-shrink-0">
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
          <Shield size={24} className="text-amber-500" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-navy mb-1">
            Accept Terms & Conditions
          </p>
          <p className="text-xs text-slate-500 max-w-sm">
            You need to accept the Terms & Conditions before you can start
            chatting in this conversation.
          </p>
        </div>
        <Button
          onClick={onAcceptClick}
          className="bg-teal hover:bg-teal-light text-white px-6"
        >
          <Shield size={16} className="mr-2" />
          Accept Terms
        </Button>
      </div>
    </div>
  );
};

export default ChatTermsOverlay;
