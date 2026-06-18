import { useEffect, useState } from "react";
import { usePwaStore } from "@/stores/pwa.store";
import { X, Download, Share } from "lucide-react";
import { useLocation } from "react-router-dom";

export const AppInstallPrompt = () => {
  const { deferredPrompt, isInstallable, isAppInstalled, clearPrompt } = usePwaStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const location = useLocation();

  // Cooldown logic: 7 days
  const COOLDOWN_DAYS = 7;
  
  useEffect(() => {
    // Detect iOS Safari
    const ua = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const isSafari = /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
    const isStandalone = (window.navigator as any).standalone === true;

    if (isIOS && isSafari && !isStandalone) {
      setIsIosSafari(true);
    }
  }, []);

  useEffect(() => {
    // Determine if we should show the prompt based on page visits
    if (isAppInstalled) return;
    
    // Check cooldown
    const lastDismissed = localStorage.getItem("pwa_install_dismissed");
    if (lastDismissed) {
      const dismissedDate = new Date(parseInt(lastDismissed));
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - dismissedDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < COOLDOWN_DAYS) {
        return;
      }
    }

    // Trigger after 3 page navigations
    let pageCount = parseInt(sessionStorage.getItem("pwa_page_count") || "0");
    pageCount++;
    sessionStorage.setItem("pwa_page_count", pageCount.toString());

    if (pageCount >= 3 && (isInstallable || isIosSafari)) {
      // Delay it slightly so it doesn't pop up immediately on load
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isInstallable, isIosSafari, isAppInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      clearPrompt();
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa_install_dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-900 shadow-2xl rounded-2xl border border-slate-100 dark:border-white/10 p-5 z-50 animate-in slide-in-from-bottom-5">
      <button 
        onClick={handleDismiss}
        className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
      >
        <X size={18} />
      </button>
      
      <div className="flex gap-4">
        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
          <Download className="text-teal" size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
            Install ProdMatch
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            Install our App on your phone for faster access to jobs, matches and notifications.
          </p>
          
          {isIosSafari ? (
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-2 mb-2">
                1. Tap <Share size={16} className="text-blue-500" /> in the toolbar
              </span>
              <span className="flex items-center gap-2">
                2. Select <strong>Add to Home Screen</strong>
              </span>
            </div>
          ) : (
            <div className="flex gap-3">
              <button 
                onClick={handleInstall}
                className="flex-1 bg-teal hover:bg-teal/90 text-white font-medium py-2 px-4 rounded-xl text-sm transition-colors"
              >
                Install App
              </button>
              <button 
                onClick={handleDismiss}
                className="flex-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-medium py-2 px-4 rounded-xl text-sm transition-colors"
              >
                Not Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
