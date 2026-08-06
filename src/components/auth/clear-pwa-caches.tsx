"use client";

import { useEffect } from "react";

/**
 * Tømmer PWA-cachen ved utlogging (GDPR / delt enhet).
 *
 * Rendres på post-logout-siden (/auth/logget-ut) — det ene punktet alle
 * logout-flyter lander på. Ved mount:
 *   1. sletter alle Cache Storage-nøkler direkte (dekker tilfellet der service
 *      workeren ikke kontrollerer denne fanen ennå), og
 *   2. sender { type: "CLEAR_CACHES" } til en aktiv service worker som
 *      belte-og-seler for cacher den eier.
 *
 * Vi avregistrerer bevisst IKKE service workeren — det ville ødelagt
 * offline/installert-PWA for neste innlogging. Å tømme cachen fjerner den
 * sensitive dataen, som er målet.
 *
 * Rendrer ingenting.
 */
export function ClearPwaCaches() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("caches" in window) {
      caches
        .keys()
        .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
        .catch(() => {
          /* best-effort */
        });
    }

    navigator.serviceWorker?.controller?.postMessage({ type: "CLEAR_CACHES" });
  }, []);

  return null;
}
