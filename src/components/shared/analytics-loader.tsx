"use client";

/**
 * S-14: Laster Plausible-script kun når bruker har gitt samtykke til
 * analytics-cookies ("all").
 *
 * Lytter på CustomEvent "ak:cookie-consent" (fra CookieBanner) samt
 * leser localStorage ved mount for brukere som allerede har samtykket.
 */

import { useEffect } from "react";
import { CONSENT_ALL, getStoredConsent } from "./cookie-banner";

type Props = {
  domain: string;
};

function injectPlausible(domain: string) {
  // Ikke injecter hvis allerede finnes
  if (document.querySelector("script[data-domain]")) return;
  const s = document.createElement("script");
  s.defer = true;
  s.setAttribute("data-domain", domain);
  s.src = "https://plausible.io/js/script.js";
  document.head.appendChild(s);
}

export function AnalyticsLoader({ domain }: Props) {
  useEffect(() => {
    // Sjekk eksisterende samtykke
    if (getStoredConsent() === CONSENT_ALL) {
      injectPlausible(domain);
    }

    // Lyt på fremtidig samtykke
    function onConsent(e: Event) {
      const detail = (e as CustomEvent<{ value: string }>).detail;
      if (detail.value === CONSENT_ALL) {
        injectPlausible(domain);
      }
    }

    window.addEventListener("ak:cookie-consent", onConsent);
    return () => window.removeEventListener("ak:cookie-consent", onConsent);
  }, [domain]);

  return null;
}
