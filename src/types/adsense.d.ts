interface AdsByGoogleArray {
  push(data: Record<string, unknown>): void;
}

interface Window {
  adsbygoogle: AdsByGoogleArray;
}
