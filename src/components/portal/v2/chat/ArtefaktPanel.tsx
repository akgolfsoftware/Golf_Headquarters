"use client";

/**
 * ArtefaktPanel — «dagens økt». Matcher Paper-fasitens .artifact-mønster
 * (playerhq-chat-desktop.html): på desktop (≥1121px) er den en FAST synlig
 * kolonne i skallet, ikke et åpne/lukke-panel — "Artefaktet forsvinner ikke —
 * det bytter form" (kommentar i fasit-fila). På smalere skjermer (≤1120px)
 * blir den et bunnark, styrt av open/onClose.
 *
 * Mobil-varianten gjenbruker den delte BunnArk-primitiven (src/components/v2/
 * bunn-ark.tsx) as-is — den dekker allerede backdrop, fokus-felle, Escape,
 * scroll-lås.
 */

import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { BunnArk } from "@/components/v2/bunn-ark";
import { useErKompakt } from "./use-er-kompakt";

export function ArtefaktPanel({
  open,
  onClose,
  tittel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  tittel: string;
  children: ReactNode;
}) {
  const kompakt = useErKompakt();

  if (kompakt) {
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
        minWidth: 0,
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
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>{children}</div>
    </aside>
  );
}
