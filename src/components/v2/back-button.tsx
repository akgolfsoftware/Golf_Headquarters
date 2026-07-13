"use client";

/* AK Golf HQ v2 — delt tilbake-navigasjon.
   Problemet med bare `router.back()`: på deep-link / kald PWA-start finnes
   ingen historikk, så knappen gjør ingenting eller kaster brukeren ut av
   appen. Regel: alle tilbake-knapper KREVER en eksplisitt `backHref` som
   fallback — vi går bare bakover i historikken når vi vet den er intern. */

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { T } from "@/lib/v2/tokens";
import { Icon } from "@/components/v2/icon";

/** Kan vi trygt gå bakover i historikken uten å forlate appen? */
export function harInternHistorikk(): boolean {
  if (typeof window === "undefined") return false;
  if (window.history.length <= 1) return false;
  // Tom referrer = intern SPA-navigasjon eller direkte oppslag; ekstern
  // referrer betyr at «tilbake» ville forlatt appen.
  const ref = document.referrer;
  return ref === "" || ref.startsWith(window.location.origin);
}

/**
 * Hook for skjemaer/skjermer med egen knappestyling: returnerer en onClick
 * som går tilbake i historikken når det er trygt, ellers til `backHref`.
 */
export function useTilbake(backHref: string): () => void {
  const router = useRouter();
  return useCallback(() => {
    if (harInternHistorikk()) router.back();
    else router.push(backHref);
  }, [router, backHref]);
}

export interface BackButtonProps {
  /** Eksplisitt fallback-destinasjon — alltid påkrevd. */
  backHref: string;
  label?: string;
  /** Ekstra klasser for legacy-flater (Tailwind); v2-flater trenger ingen. */
  className?: string;
}

/** Ferdigstylet tilbake-knapp (v2-tokens). */
export function BackButton({ backHref, label = "Tilbake", className }: BackButtonProps) {
  const tilbake = useTilbake(backHref);
  return (
    <button
      type="button"
      onClick={tilbake}
      className={className ?? "v2-focus"}
      style={
        className
          ? undefined
          : {
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "none",
              border: "none",
              padding: "6px 8px 6px 2px",
              cursor: "pointer",
              fontFamily: T.ui,
              fontSize: 13,
              fontWeight: 600,
              color: T.fg2,
              borderRadius: 8,
            }
      }
    >
      <Icon name="chevron-left" size={16} />
      {label}
    </button>
  );
}
