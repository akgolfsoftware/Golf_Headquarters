"use client";

/**
 * ArtefaktPanel — «dagens økt» som FAST tredje kolonne på desktop (≥1121px)
 * → bunnark på mobil/iPad, matcher Paper-fasitens .artifact-mønster
 * (playerhq-chat-desktop.html: rail 64 + tråd + artefakt 360; ≤1120 blir
 * panelet et ark, artefaktet forsvinner aldri — det bytter form).
 *
 * PR-A (avvik A1): desktop var før et position:fixed-overlay bak en knapp —
 * fasiten har panelet stående åpent som egen kolonne. Mobil-varianten
 * gjenbruker den delte BunnArk-primitiven (backdrop, fokus-felle, Escape,
 * scroll-lås) uendret.
 */

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { BunnArk } from "@/components/v2/bunn-ark";

/** Samme bruddpunkt som fasiten (@media max-width:1120px). */
export function useErMobil(): boolean {
  const [mobil, setMobil] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1120px)");
    const oppdater = () => setMobil(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return mobil;
}

export function ArtefaktPanel({
  open,
  onClose,
  tittel,
  statusTag,
  children,
}: {
  /** Kun mobil: styrer bunnarket. Desktop-kolonnen står alltid åpen. */
  open: boolean;
  onClose: () => void;
  tittel: string;
  /** Liten mono-tag ved tittelen, f.eks. «Godkjent» — utelates når null. */
  statusTag?: string | null;
  children: ReactNode;
}) {
  const mobil = useErMobil();

  if (mobil) {
    return (
      <BunnArk open={open} onClose={onClose} tittel={tittel}>
        {children}
      </BunnArk>
    );
  }

  return (
    <aside
      aria-label={tittel}
      style={{
        width: 360,
        flex: "none",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
        borderLeft: `1px solid ${T.border}`,
        background: T.bg,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "12px 16px",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <span style={{ fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>{tittel}</span>
        {statusTag && (
          <span
            style={{
              fontFamily: T.mono,
              fontSize: 10.5,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: T.mut,
              border: `1px solid ${T.border}`,
              borderRadius: 999,
              padding: "3px 8px",
            }}
          >
            {statusTag}
          </span>
        )}
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>{children}</div>
    </aside>
  );
}
