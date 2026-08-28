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
import { TL } from "@/lib/v2/train-lock";

import { Caps, Knapp } from "./core";
import { Icon } from "@/components/v2/icon";

/* ── TipTall: nøkkeltallet i et AI-tips (skjermens lime-jobb) ── */
export interface TipTallProps {
  children?: ReactNode;
}
export function TipTall({ children }: TipTallProps) {
  return (
    <strong style={{ fontFamily: TL.font.mono, fontWeight: 600, color: TL.fill, fontVariantNumeric: "tabular-nums" }}>
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
        background: TL.dock,
        border: `1px solid color-mix(in srgb,${TL.fill} 22%,${TL.hair})`,
        borderRadius: TL.radius.card,
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
            borderRadius: TL.radius.pill,
            flex: "none",
            background: `color-mix(in srgb,${TL.fill} 16%,transparent)`,
            color: TL.fill,
          }}
        >
          <Icon name="sparkles" size={16} />
        </span>
        <Caps size={11} style={{ display: "inline", fontWeight: 600, letterSpacing: "0.1em" }}>
          {eyebrow}
        </Caps>
      </div>
      {tittel && (
        <div style={{ fontFamily: TL.font.sans, fontWeight: 600, fontSize: 16, letterSpacing: "-0.01em", color: TL.text }}>
          {tittel}
        </div>
      )}
      <p style={{ fontFamily: TL.font.sans, fontSize: 15, lineHeight: 1.55, color: TL.mute, margin: 0 }}>{children}</p>
      {handling && (
        <div>
          <Knapp
            onClick={onHandling}
            style={{ background: TL.fill, color: TL.onFill, border: "1px solid transparent", minHeight: 44, padding: "10px 16px", fontSize: 13 }}
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
  const farge: string | null = tone === "forest" ? TL.fill : tone === "up" ? TL.ok : tone === "down" ? TL.danger : null;
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
        background: farge ? `color-mix(in srgb,${farge} 16%,transparent)` : TL.dock,
        color: farge ?? TL.mute,
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
      style={{ width: 7, height: 7, borderRadius: TL.radius.pill, background: TL.fill, flex: "none" }}
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
        fontFamily: TL.font.mono,
        fontSize: 12,
        color: TL.mute,
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </span>
  );
}
