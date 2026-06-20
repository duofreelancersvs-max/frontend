import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, Share } from "lucide-react";
import { usePwaStore } from "@/stores/pwa.store";

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  isIOS: boolean;
}

export default function InstallAppModal({
  isOpen,
  onClose,
  isIOS,
}: InstallAppModalProps) {
  const { deferredPrompt } = usePwaStore();

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md bg-navy text-white border-border/50 p-6 rounded-2xl">
        <DialogHeader>
          <div className="mx-auto w-12 h-12 rounded-full bg-teal/20 flex items-center justify-center mb-4 text-teal">
            <Download size={24} />
          </div>
          <DialogTitle className="text-center text-xl font-heading text-white">
            Install ConnectMeIndia App
          </DialogTitle>
          <DialogDescription className="text-center text-slate-300">
            For the best experience, install our app on your device.
          </DialogDescription>
        </DialogHeader>

        {deferredPrompt ? (
          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 rounded-xl bg-teal hover:bg-teal-dark text-white font-medium transition-colors"
            >
              Install App
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white/5 rounded-xl p-6 mt-2 border border-white/10">
              <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                Follow these steps to install:
              </h3>
              
              <div className="space-y-4">
                {isIOS ? (
                  <>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-teal">1</div>
                      <p className="text-sm text-slate-300 mt-1">
                        Tap the <Share size={16} className="inline mx-1 text-white" /> <strong>Share</strong> icon at the bottom of your screen.
                      </p>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-teal">2</div>
                      <p className="text-sm text-slate-300 mt-1">
                        Scroll down and tap <strong>"Add to Home Screen"</strong>.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-teal">1</div>
                      <p className="text-sm text-slate-300 mt-1">
                        Tap your browser's menu icon <strong>(⋮)</strong>.
                      </p>
                    </div>
                    <div className="flex gap-4 items-start">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 font-bold text-teal">2</div>
                      <p className="text-sm text-slate-300 mt-1">
                        Select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong>.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-center w-full pb-2">
              <button 
                onClick={onClose}
                className="w-full py-2.5 rounded-xl border border-white/10 text-slate-300 hover:text-white hover:bg-white/5 font-medium transition-colors focus:outline-none"
              >
                Got it, thanks!
              </button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
