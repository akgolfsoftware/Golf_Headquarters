"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * SSR-trygg media-query-hook bygd på useSyncExternalStore. Server-snapshot er
 * ALLTID `false` (getServerSnapshot), så markup matcher serverens → ingen
 * hydrerings-mismatch. På klienten leses matchMedia og det abonneres på endringer.
 *
 * Brukes KUN til oppførsel (f.eks. hvilken dag tap-to-add treffer / unngå å
 * rendre tung Inspector to ganger) — selve layout-vekslingen mellom mobil/desktop
 * gjøres med CSS (media queries), så skjermene rendres riktig allerede ved første paint.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  }, [query]);

  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

/** Mobil = under desktop-bryteren (lg, 1024px). Panelet slutter å passe her. */
export const WB_MOBILE_QUERY = "(max-width: 1023px)";
