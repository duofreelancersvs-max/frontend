import { create } from "zustand";

interface PwaState {
  deferredPrompt: any | null; // BeforeInstallPromptEvent
  isInstallable: boolean;
  isAppInstalled: boolean;
  setDeferredPrompt: (prompt: any | null) => void;
  setAppInstalled: (installed: boolean) => void;
  clearPrompt: () => void;
}

export const usePwaStore = create<PwaState>((set) => ({
  deferredPrompt: null,
  isInstallable: false,
  isAppInstalled: false,
  
  setDeferredPrompt: (prompt) => set({ 
    deferredPrompt: prompt,
    isInstallable: prompt !== null 
  }),
  
  setAppInstalled: (installed) => set({ 
    isAppInstalled: installed,
    isInstallable: false,
    deferredPrompt: null 
  }),
  
  clearPrompt: () => set({ 
    deferredPrompt: null,
    isInstallable: false 
  }),
}));
