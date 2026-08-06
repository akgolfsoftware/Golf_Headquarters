"use client";

/**
 * ArtefaktPanel — «dagens økt» som FAST kolonne på desktop, bunnark på
 * mobil/nettbrett. Matcher Paper-fasitens .artifact-mønster
 * (playerhq-chat-desktop.html): `grid-template-columns:64px minmax(0,1fr)
 * 360px` ved ≥1121px — artefaktet er alltid synlig, ALDRI en toggle på
 * desktop (kontrakt §«Enhetsbånd·Bølge 1»: «Artefaktet forsvinner ikke —
 * det bytter form»). ≤1120px bytter det form til BunnArk (fasitens egen
 * beslutning 01.08: sheet overalt under 1121px, ingen split).
 *
 * `useErMobil` eksporteres slik at PortalChatHjem kan styre grid-kolonnene
 * (main + artefakt) med SAMME brytepunkt som denne komponenten — to
 * uavhengige matchMedia-hooks med ulikt tall ville gitt et sprik-vindu.
 *
 * Mobil-varianten gjenbruker den delte BunnArk-primitiven (src/components/v2/
 * bunn-ark.tsx) as-is — den dekker allerede backdrop, fokus-felle, Escape,
 * scroll-lås.
 */

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { BunnArk } from "@/components/v2/bunn-ark";

/** Delt brytepunkt for chat-skallet — matcher fasitens `@media (max-width:1120px)`. */
export function useErMobil(breakpointPx = 1120): boolean {
  const [mobil, setMobil] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpointPx}px)`);
    const oppdater = () => setMobil(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, [breakpointPx]);
  return mobil;
}

export function ArtefaktPanel({
  mobil,
  open,
  onClose,
  tittel,
  children,
}: {
  /** Fra useErMobil() i forelder — delt state, se filkommentar. */
  mobil: boolean;
  open: boolean;
  onClose: () => void;
  tittel: string;
  children: ReactNode;
}) {
  if (mobil) {
    return (
      <BunnArk open={open} onClose={onClose} tittel={tittel}>
        {children}
      </BunnArk>
    );
  }

  // Desktop: fast grid-kolonne, alltid synlig — ingen open/close-logikk.
  return (
    <aside
      aria-label={tittel}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        borderLeft: `1px solid ${T.border}`,
        background: T.panel,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: `1px solid ${T.border}`,
          flex: "none",
        }}
      >
        <span style={{ fontFamily: T.disp, fontSize: 13, fontWeight: 600, color: T.fg }}>{tittel}</span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 16 }}>{children}</div>
    </aside>
  );
}
