"use client";

/**
 * Laster Vercel Analytics + Speed Insights kun etter samtykke til
 * analytics-cookies ("all") — samme samtykke-kilde som AnalyticsLoader
 * (Plausible). Før samtykke: ingenting rendres, ingen script lastes.
 */

import { useEffect, useState } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { CONSENT_ALL, getStoredConsent } from "./cookie-banner";

export function VercelAnalyticsGated() {
  const [consented, setConsented] = useState(() => getStoredConsent() === CONSENT_ALL);

  useEffect(() => {
    function onConsent(e: Event) {
      const detail = (e as CustomEvent<{ value: string }>).detail;
      if (detail.value === CONSENT_ALL) {
        setConsented(true);
      }
    }

    window.addEventListener("ak:cookie-consent", onConsent);
    return () => window.removeEventListener("ak:cookie-consent", onConsent);
  }, []);

  if (!consented) return null;

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
