"use client";

import { useEffect, useState } from "react";
import { ULAGRET_FLAGG } from "@/lib/offline-queue/eier";

/**
 * Vises på logget-ut-siden når enheten har usynkroniserte kladder/opptak.
 * Viser ikke innholdet — bare at det ligger igjen til neste innlogging.
 */
export function UlagretKladdBanner() {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      setVis(window.sessionStorage.getItem(ULAGRET_FLAGG) === "1");
    } catch {
      setVis(false);
    }
  }, []);
  if (!vis) return null;
  return (
    <p
      role="status"
      style={{
        maxWidth: 420,
        margin: "0 auto 16px",
        padding: "12px 14px",
        borderRadius: 12,
        background: "rgba(184, 151, 92, 0.12)",
        border: "1px solid rgba(184, 151, 92, 0.35)",
        fontSize: 13.5,
        lineHeight: 1.45,
        textAlign: "left",
      }}
    >
      Ulagrede opptak og kladder ligger igjen på denne enheten. De vises bare
      når du logger inn igjen med samme konto. Vi sletter dem ikke.
    </p>
  );
}
