/// <reference types="vitest" />
import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "logo.png"],
      manifest: {
        name: "ConnectMeIndia",
        short_name: "CMI",
        description: "A platform connecting clients and freelancers",
        theme_color: "#0f172a",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) {
            if (id.includes("/src/pages/admin/")) return "admin-pages";
            if (id.includes("/src/components/chat/")) return "chat";
            return undefined;
          }
          if (id.includes("react-dom") || id.includes("react-router")) return "vendor";
          if (id.includes("@tanstack/react-query")) return "query";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("emoji-picker-react")) return "emoji";
          if (id.includes("@react-oauth/google")) return "oauth";
          if (
            id.includes("axios") ||
            id.includes("react-helmet") ||
            id.includes("react-toastify")
          ) {
            return "utils";
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/__tests__/setup.ts",
    include: ["src/__tests__/**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/__tests__/",
        "**/*.d.ts",
        "**/*.config.{ts,js}",
        "**/types.ts",
      ],
    },
  },
} as any);
