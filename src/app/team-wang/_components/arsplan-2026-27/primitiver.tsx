"use client";

// Delte byggesteiner for WANG Årsplan 2026/27-fellessiden (fasit levert
// 25.08.2026). Egen, isolert primitiv-fil for den nye fasiten — rører ikke
// `../primitiver.tsx` som den kjørende `/team-wang`-siden bruker i dag.

import type { CSSProperties, ReactNode } from "react";

export const MAKS_BREDDE = 1160;

export function Wrap({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        maxWidth: MAKS_BREDDE,
        margin: "0 auto",
        padding: "0 clamp(16px, 4vw, 28px)",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
}

export function Seksjon({
  id,
  children,
  topPad = true,
}: {
  id: string;
  children: ReactNode;
  topPad?: boolean;
}) {
  return (
    <section
      id={id}
      style={{
        maxWidth: MAKS_BREDDE,
        margin: "0 auto",
        padding: topPad
          ? "clamp(36px, 6vw, 56px) clamp(16px, 4vw, 28px) 0"
          : "0 clamp(16px, 4vw, 28px)",
        boxSizing: "border-box",
      }}
    >
      {children}
    </section>
  );
}

export function Squircle({
  nr,
  farge = "var(--wang-navy)",
  bg = "var(--tint-navy)",
}: {
  nr: number | string;
  farge?: string;
  bg?: string;
}) {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        borderRadius: 12,
        background: bg,
        color: farge,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-brand)",
        fontWeight: 800,
        fontSize: 14,
        flexShrink: 0,
      }}
    >
      {nr}
    </div>
  );
}

export function SeksjonHode({
  nr,
  label,
  tittel,
  ingress,
  maksBredde = 660,
}: {
  nr: number | string;
  label: string;
  tittel: string;
  ingress?: string;
  maksBredde?: number;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <Squircle nr={nr} />
        <span
          style={{
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            fontSize: 12,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: "var(--wang-teal-text)",
          }}
        >
          {label}
        </span>
      </div>
      <h2
        style={{
          fontFamily: "var(--font-brand)",
          fontWeight: 700,
          fontSize: "clamp(24px, 4.2vw, 34px)",
          lineHeight: 1.1,
          margin: 0,
          color: "var(--text-primary)",
        }}
      >
        {tittel}
      </h2>
      {ingress ? (
        <p
          style={{
            fontSize: "clamp(14.5px, 2vw, 16.5px)",
            lineHeight: 1.6,
            color: "var(--text-secondary)",
            maxWidth: maksBredde,
            marginTop: 8,
          }}
        >
          {ingress}
        </p>
      ) : null}
    </div>
  );
}

export function WangKort({
  children,
  style,
  padding = "clamp(18px, 3vw, 26px)",
}: {
  children: ReactNode;
  style?: CSSProperties;
  padding?: string | number;
}) {
  return (
    <div
      style={{
        background: "var(--surface-card)",
        borderRadius: 20,
        boxShadow: "var(--shadow-card)",
        padding,
        boxSizing: "border-box",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export interface PillOption {
  label: string;
  aktiv: boolean;
  onVelg: () => void;
}

export function PillGruppe({
  valg,
  aktivBg = "var(--wang-navy)",
  aktivFg = "var(--white)",
}: {
  valg: PillOption[];
  aktivBg?: string;
  aktivFg?: string;
}) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {valg.map((v) => (
        <button
          key={v.label}
          type="button"
          onClick={v.onVelg}
          style={{
            fontFamily: "var(--font-brand)",
            fontWeight: 700,
            fontSize: 12.5,
            padding: "9px 15px",
            minHeight: 40,
            borderRadius: 999,
            border: `1.5px solid ${v.aktiv ? aktivBg : "var(--border-subtle)"}`,
            background: v.aktiv ? aktivBg : "transparent",
            color: v.aktiv ? aktivFg : "var(--text-secondary)",
            cursor: "pointer",
          }}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({
  children,
  farge,
  tint,
  style,
}: {
  children: ReactNode;
  farge: string;
  tint: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "var(--font-brand)",
        fontWeight: 700,
        fontSize: 11.5,
        letterSpacing: "0.02em",
        padding: "3px 9px",
        borderRadius: 999,
        background: tint,
        color: farge,
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        lineHeight: 1.3,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Fadeinn-klassen — definert i wang-tokens.css (§Årsplan 2026/27-tillegg). */
export const fadeUpClass = "wang-arsplan-fade";

export function EntallFlertall(n: number, entall: string, flertall: string): string {
  return n === 1 ? "1 " + entall : n + " " + flertall;
}
