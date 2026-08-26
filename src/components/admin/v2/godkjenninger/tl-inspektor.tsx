"use client";

/**
 * Train-lock-inspektørpanel — TL-versjon av `src/components/v2/inspektorpanel.tsx`.
 *
 * Den eksisterende Inspektorpanel/InspektorBlokk/InspektorKpi bruker Paper-
 * tokens (T.*) og kan derfor ikke gjenbrukes direkte i en Train-lock-skjerm
 * (CLAUDE.md invariant 2: bland ALDRI T.* og TL.* i samme skjerm). `MasterDetalj`
 * i samme fil er token-fri (kun tall) og gjenbrukes uendret.
 *
 * Fasit: designsystem/train-lock/AG-10b Godkjenning Merge 3 skall.dc.html
 * (kø-kolonne 250–300px + detalj), AG-00/AX-01 for geometri.
 * Session T3 (26.08.2026).
 */

import type { CSSProperties, ReactNode } from "react";
import { TL } from "@/lib/v2/train-lock";

const STICKY_TOP = "calc(var(--ak-topbar-h, 0px) + 16px)";

export interface TlInspektorpanelProps {
  tittel: string;
  tag?: ReactNode;
  children?: ReactNode;
  fot?: ReactNode;
  ariaLabel?: string;
}

export function TlInspektorpanel({ tittel, tag, children, fot, ariaLabel }: TlInspektorpanelProps) {
  return (
    <aside
      aria-label={ariaLabel ?? tittel}
      style={{
        position: "sticky",
        top: STICKY_TOP,
        maxHeight: "calc(100vh - var(--ak-topbar-h, 0px) - 32px)",
        display: "flex",
        flexDirection: "column",
        background: TL.elev,
        borderRadius: TL.radius.card,
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: "none",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "14px 18px",
          borderBottom: `1px solid ${TL.hair}`,
        }}
      >
        <span
          style={{
            fontSize: TL.storrelse.kropp,
            fontWeight: TL.vekt.kropp,
            color: TL.text,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {tittel}
        </span>
        {tag && <span style={{ marginLeft: "auto", flex: "none" }}>{tag}</span>}
      </div>

      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          padding: 18,
          minWidth: 0,
        }}
      >
        {children}
      </div>

      {fot && (
        <div
          style={{
            flex: "none",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: "14px 18px",
            borderTop: `1px solid ${TL.hair}`,
          }}
        >
          {fot}
        </div>
      )}
    </aside>
  );
}

export function TlInspektorTom({ tittel, tekst }: { tittel: string; tekst: string }) {
  return (
    <aside
      aria-label={tittel}
      style={{
        position: "sticky",
        top: STICKY_TOP,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        textAlign: "center",
        padding: "40px 24px",
        background: TL.elev,
        borderRadius: TL.radius.card,
        minWidth: 0,
      }}
    >
      <h3 style={{ margin: 0, fontSize: TL.storrelse.kropp, fontWeight: TL.vekt.kropp, color: TL.text }}>{tittel}</h3>
      <p style={{ margin: 0, maxWidth: "36ch", fontSize: TL.storrelse.meta, lineHeight: 1.55, color: TL.mute }}>
        {tekst}
      </p>
    </aside>
  );
}

export function TlInspektorBlokk({ label, children, style }: { label: string; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 0, ...style }}>
      <TlCaps>{label}</TlCaps>
      {children}
    </div>
  );
}

export function TlInspektorKpi({ label, verdi, sub }: { label: string; verdi: string; sub: string }) {
  return (
    <div style={{ background: TL.dock, borderRadius: 12, padding: 12, minWidth: 0 }}>
      <TlCaps>{label}</TlCaps>
      <div
        style={{
          fontFamily: TL.font.mono,
          fontSize: 22,
          fontWeight: 600,
          color: TL.text,
          marginTop: 6,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {verdi}
      </div>
      <div style={{ fontSize: 11, color: TL.mute, marginTop: 2, overflowWrap: "anywhere" }}>{sub}</div>
    </div>
  );
}

export function TlInspektorLinje({ label, verdi }: { label: ReactNode; verdi: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8, minWidth: 0 }}>
      <span
        style={{
          fontSize: 12.5,
          color: TL.text,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: TL.font.mono,
          fontSize: 12,
          color: TL.mute,
          flex: "none",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {verdi}
      </span>
    </div>
  );
}

/** Caps-etikett — DESIGN-SYSTEM.md §3: 11/600/0.08em/uppercase/mute. */
export function TlCaps({ children, size = 11 }: { children: ReactNode; size?: number }) {
  return (
    <span
      style={{
        display: "block",
        fontSize: size,
        fontWeight: TL.vekt.caps,
        letterSpacing: TL.track.caps,
        textTransform: "uppercase",
        color: TL.mute,
      }}
    >
      {children}
    </span>
  );
}
