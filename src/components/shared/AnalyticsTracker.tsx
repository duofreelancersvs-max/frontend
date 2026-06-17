import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

// Initialize GA4 only if the Measurement ID is provided in the environment variables
const TRACKING_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

if (TRACKING_ID) {
  ReactGA.initialize(TRACKING_ID);
}

export const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if GA4 is initialized before sending pageviews
    if (TRACKING_ID) {
      ReactGA.send({ 
        hitType: "pageview", 
        page: location.pathname + location.search 
      });
    }
  }, [location]);

  // This component doesn't render anything visible
  return null;
};
