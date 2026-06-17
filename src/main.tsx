import React from "react";
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

import { HelmetProvider } from 'react-helmet-async';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthInitializer>
            <ScrollToTop />
            <AnalyticsTracker />
            <App />
          </AuthInitializer>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
);
