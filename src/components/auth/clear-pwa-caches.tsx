"use client";

import { useEffect } from "react";
import { fjernAktivBrukerId, merkUlagretFlagg } from "@/lib/offline-queue/eier";
import { harLiveDrillKoPaaEnheten } from "@/lib/offline-queue/live-drill-queue";
import { harTapperKoPaaEnheten } from "@/lib/offline-queue/tapper-queue";
import { harChunkKoPaaEnheten } from "@/lib/offline-queue/recording-chunk-queue";

/**
 * Tømmer PWA-cachen ved utlogging (GDPR / delt enhet).
 *
 * Sletter IKKE IndexedDB-køer eller runde-kladder — de er eier-merket og
 * vises bare neste gang samme konto logger inn.
 */
export function ClearPwaCaches() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    void (async () => {
      const [live, tapper, chunk] = await Promise.all([
        harLiveDrillKoPaaEnheten().catch(() => false),
        harTapperKoPaaEnheten().catch(() => false),
        harChunkKoPaaEnheten().catch(() => false),
      ]);
      merkUlagretFlagg(window.sessionStorage, live || tapper || chunk);
      fjernAktivBrukerId(window.sessionStorage);
    })();

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
