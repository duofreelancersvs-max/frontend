import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthInitializer } from "@/components/auth/AuthInitializer";
import App from "./App.tsx";
import ScrollToTop from "./components/common/ScrollToTop.tsx";
import { AnalyticsTracker } from "./components/shared/AnalyticsTracker.tsx";
import "./styles/index.css";
import "react-toastify/dist/ReactToastify.css";
import "nprogress/nprogress.css";

import { HelmetProvider } from "react-helmet-async";
import { GoogleOAuthProvider } from "@react-oauth/google";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Handle Vite dynamic import errors (usually happens when a new version is deployed and old chunks are missing)
window.addEventListener("vite:preloadError", () => {
  console.warn(
    "Vite preload error (new version available). Reloading page to fetch new chunks...",
  );

  // Only reload once per session to prevent infinite loops causing a blank page
  const isReloaded = sessionStorage.getItem("vite-reloaded");
  if (!isReloaded) {
    sessionStorage.setItem("vite-reloaded", "true");
    window.location.reload();
  }
});

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <AuthInitializer>
            <ScrollToTop />
            <AnalyticsTracker />
            <App />
          </AuthInitializer>
        </BrowserRouter>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </HelmetProvider>,
);
