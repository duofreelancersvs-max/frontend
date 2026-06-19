import { useState, useEffect } from "react";

/**
 * Mobile-first media query hook. Defaults to `false` (mobile) until hydrated.
 */
export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    const media = window.matchMedia(query);
    const handler = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(media.matches);
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

export const useIsMdUp = () => useMediaQuery("(min-width: 768px)");
export const useIsLgUp = () => useMediaQuery("(min-width: 1024px)");
