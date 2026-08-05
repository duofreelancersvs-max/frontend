import { useEffect } from "react";

const ADSENSE_PUB_ID = import.meta.env.VITE_ADSENSE_PUB_ID;

/**
 * Initializes Google AdSense page-level ads.
 * Follows the same pattern as AnalyticsTracker and ClarityTracker.
 * Renders nothing — only triggers page-level ad configuration.
 */
export function AdSenseInitializer() {
  useEffect(() => {
    if (!ADSENSE_PUB_ID) return;

    try {
      if (typeof window !== "undefined") {
        window.adsbygoogle = window.adsbygoogle || [];
        // Page-level ads configuration (optional, enables Auto Ads)
        // Comment out the next line if you only want manual ad units
        window.adsbygoogle.push({
          google_ad_client: ADSENSE_PUB_ID,
          enable_page_level_ads: true,
        });
      }
    } catch (err) {
      // AdSense not loaded yet or blocked — safe to ignore
      console.warn("AdSense initializer:", err);
    }
  }, []);

  return null;
}

export default AdSenseInitializer;
