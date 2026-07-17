"use client";

/**
 * PlayerHQ Innstillinger · Apparater og økter — v2 (retning C «Presis»).
 * v2-port 17. juli 2026: erstatter athletic-versjonen (EmptyState + info-boks).
 * Innhold uendret: apparat-oversikten finnes ikke ennå og vises som ærlig
 * tomtilstand («kommer Q3 2026») — aldri falske enhetsrader.
 *
 * Kun v2-komponenter fra "@/components/v2" + T.*-tokens. Ingen rå hex.
 * V2Shell eier chrome-en; denne komponenten rendrer bare den indre stacken.
 */

import { useEffect, useState } from "react";
import { T, Tittel, Kort, TomTilstand, StatusPill, Icon } from "@/components/v2";

/* ── Hjelpere ──────────────────────────────────────────────────────── */

/** true på klient etter mount når viewport < 768px (styrer kun tallstørrelser). */
function useMobile(): boolean {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const oppdater = () => setM(mq.matches);
    oppdater();
    mq.addEventListener("change", oppdater);
    return () => mq.removeEventListener("change", oppdater);
  }, []);
  return m;
}

/* ── Skjerm ────────────────────────────────────────────────────────── */

export function InnstillingerOkterV2() {
  const mobile = useMobile();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <Tittel mobile={mobile}>Apparater og økter</Tittel>
      <p style={{ fontFamily: T.ui, fontSize: 12.5, color: T.mut, lineHeight: 1.6, margin: "-8px 0 0" }}>
        Se hvor du er logget inn og administrer aktive sesjoner. Logg ut alle andre enheter med ett
        klikk.
      </p>

      {/* Sikkerhets-info */}
      <Kort tint>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              background: `color-mix(in srgb, ${T.lime} 10%, transparent)`,
              border: `1px solid ${T.border}`,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flex: "none",
            }}
          >
            <Icon name="shield-check" size={14} style={{ color: T.lime }} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg }}>
              Sikker tilgang
            </div>
            <p style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.6, margin: "5px 0 0" }}>
              Alle sesjoner krypteres via Supabase Auth. Du kan trygt logge ut denne enheten via
              «Logg ut»-knappen i hovedmenyen.
            </p>
          </div>
        </div>
      </Kort>

      {/* Apparat-oversikt — ærlig tomtilstand */}
      <Kort eyebrow="Apparat-oversikt" action={<StatusPill tone="info">Kommer Q3 2026</StatusPill>}>
        <TomTilstand
          icon="monitor"
          title="Apparat-oversikt kommer Q3 2026"
          sub="Vi bygger en oversikt der du kan se alle dine aktive innlogginger og logge ut spesifikke enheter."
        />
      </Kort>
    </div>
  );
}
