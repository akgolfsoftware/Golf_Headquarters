"use client";

/* AK Golf HQ v2 — TILBAKEMELDING (feedback-familien, bølge 11).
   Fasit: Open Design-showroom `familie-feedback.html` (.fb-aitip, .fb-row-icon,
   .fb-unread). Port — ikke redesign.

   Familien ellers dekkes av eksisterende filer:
   - HjelpPopover / ValideringsChip → ./struktur
   - MeldingsTraad                  → ./domene
   - ListRow-skallet                → `Rad` i ./core (denne filen leverer
     ikon-flisen + ulest-prikken som Rad får som `leading`/`meta`)

   Disiplin: lime-jobben i AiTipKort er merket + nøkkeltallet — handlingen er
   derfor forest, ikke lime. Tall i mono. Tokens: T (@/lib/v2/tokens). */

import type { ReactNode } from "react";
import { T } from "@/lib/v2/tokens";
import { Caps, Knapp } from "./core";
import { Icon } from "@/components/v2/icon";

/* ── TipTall: nøkkeltallet i et AI-tips (skjermens lime-jobb) ── */
export interface TipTallProps {
  children?: ReactNode;
}
export function TipTall({ children }: TipTallProps) {
  return (
    <strong style={{ fontFamily: T.mono, fontWeight: 600, color: T.lime, fontVariantNumeric: "tabular-nums" }}>
      {children}
    </strong>
  );
}

/* ── AiTipKort: flaten AI-Caddie snakker gjennom ───────── */
export interface AiTipKortProps {
  /** Mono-eyebrow, f.eks. «AI-Caddie · Oppdatert for 2 timer siden». */
  eyebrow?: ReactNode;
  /** Utelates i den kompakte varianten (kun tekst). */
  tittel?: ReactNode;
  /** Innsikten. Bruk <TipTall> rundt nøkkeltallet. */
  children?: ReactNode;
  /** Rolig handling — anbefaling, aldri sperre. */
  handling?: ReactNode;
  onHandling?: () => void;
  maxBredde?: number;
}
export function AiTipKort({ eyebrow = "AI-Caddie", tittel, children, handling, onHandling, maxBredde }: AiTipKortProps) {
  return (
    <div
      style={{
        background: T.panel2,
        border: `1px solid color-mix(in srgb,${T.lime} 22%,${T.border})`,
        borderRadius: T.rCard,
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        maxWidth: maxBredde,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: T.rPill,
            flex: "none",
            background: `color-mix(in srgb,${T.lime} 16%,transparent)`,
            color: T.lime,
          }}
        >
          <Icon name="sparkles" size={16} />
        </span>
        <Caps size={11} style={{ display: "inline", fontWeight: 600, letterSpacing: "0.1em" }}>
          {eyebrow}
        </Caps>
      </div>
      {tittel && (
        <div style={{ fontFamily: T.disp, fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em", color: T.fg }}>
          {tittel}
        </div>
      )}
      <p style={{ fontFamily: T.ui, fontSize: 15, lineHeight: 1.55, color: T.fg2, margin: 0 }}>{children}</p>
      {handling && (
        <div>
          <Knapp
            onClick={onHandling}
            style={{ background: T.forest, color: T.onForest, border: "1px solid transparent", minHeight: 44, padding: "10px 16px", fontSize: 13 }}
          >
            {handling}
          </Knapp>
        </div>
      )}
    </div>
  );
}

/* ── ListeIkon: ledende status-flis i en listerad ──────── */
export type ListeIkonTone = "noytral" | "forest" | "up" | "down";
export interface ListeIkonProps {
  icon: string;
  tone?: ListeIkonTone;
}
export function ListeIkon({ icon, tone = "noytral" }: ListeIkonProps) {
  const farge: string | null = tone === "forest" ? T.forest : tone === "up" ? T.up : tone === "down" ? T.down : null;
  return (
    <span
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 36,
        height: 36,
        borderRadius: 10,
        flex: "none",
        background: farge ? `color-mix(in srgb,${farge} 16%,transparent)` : T.panel2,
        color: farge ?? T.fg2,
      }}
    >
      <Icon name={icon} size={18} />
    </span>
  );
}

/* ── UlestPrikk: rolig ulest-markør i listerader ───────── */
export function UlestPrikk() {
  return (
    <span
      aria-label="Ulest"
      role="img"
      style={{ width: 7, height: 7, borderRadius: T.rPill, background: T.forest, flex: "none" }}
    />
  );
}

/* ── RadMeta: høyrestilt mono-meta (teller/tid) i listerader ── */
export interface RadMetaProps {
  children?: ReactNode;
}
export function RadMeta({ children }: RadMetaProps) {
  return (
    <span
      style={{
        flex: "none",
        display: "flex",
        alignItems: "center",
        gap: 8,
        fontFamily: T.mono,
        fontSize: 12,
        color: T.mut,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </span>
  );
}
