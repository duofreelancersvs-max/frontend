import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.connectmeindia.app",
  appName: "ConnectMeIndia",
  webDir: "dist",
  android: {
    allowMixedContent: false,
  },
  // Content is served from a local origin inside the WebView.
  // Client-side navigation is handled entirely by React Router, so no
  // remote server is needed. Deep links are handled via the App plugin.
  server: {
    androidScheme: "https",
  },
};

export default config;