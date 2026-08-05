import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const ADSENSE_PUB_ID = import.meta.env.VITE_ADSENSE_PUB_ID;

interface AdUnitProps {
  adSlot: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
  className?: string;
  style?: React.CSSProperties;
  responsive?: boolean;
}

export function AdUnit({
  adSlot,
  format = "auto",
  className,
  style = { display: "block" },
  responsive = true,
}: AdUnitProps) {
  const location = useLocation();
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!ADSENSE_PUB_ID) return;

    const pushAd = () => {
      try {
        if (typeof window !== "undefined") {
          window.adsbygoogle = window.adsbygoogle || [];
          window.adsbygoogle.push({});
          pushedRef.current = true;
        }
      } catch (err) {
        console.error("AdSense push error:", err);
      }
    };

    // Retry mechanism: try immediately, then retry after delay if first attempt fails
    pushAd();
    const timer = setTimeout(() => {
      if (!pushedRef.current) {
        pushAd();
      }
    }, 750);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search, adSlot]);

  if (!ADSENSE_PUB_ID) return null;

  return (
    <div className={cn("my-4 flex justify-center", className)}>
      <ins
        ref={adRef}
        key={location.pathname + adSlot}
        className="adsbygoogle"
        style={style}
        data-ad-client={ADSENSE_PUB_ID}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
}

export default AdUnit;
