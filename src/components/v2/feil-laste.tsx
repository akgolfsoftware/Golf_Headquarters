"use client";

/* AK Golf HQ v2 — delte robusthets-komponenter (SPOR R0, fase 6). Grunnstein
   for error.tsx/loading.tsx på tvers av v2-skjermer: V2Feil (feilinnhold,
   rendres inni en tynn error.tsx) og V2Laster (skeleton, rendres i en tynn
   loading.tsx). Maler i docs/redesign-v2/maler/{error,loading}-mal.tsx.txt.
   Samme visuelle språk som src/components/v2/core.tsx (T-tokens, Knapp,
   Icon) — bruk disse malene fremfor ad-hoc feil-/last-UI i nye v2-skjermer. */

import type { CSSProperties } from "react";
import Link from "next/link";
import { T } from "@/lib/v2/tokens";
import { EASE } from "@/lib/v2/hooks";
import { Icon } from "@/components/v2/icon";
import { Knapp } from "@/components/v2/core";

/* ── V2Feil ───────────────────────────────────────────── */
export interface V2FeilProps {
  /** error.tsx-kontraktens reset() — knyttes til "Prøv igjen"-knappen. */
  reset: () => void;
  /** Hvor "Tilbake"-lenken skal peke (nærmeste fungerende oversikt). */
  tilbakeHref: string;
  tittel?: string;
}

/** Feilinnhold i v2-design. Rendres INNI en error.tsx (som selv er tynn og
 *  logger error.digest) — se docs/redesign-v2/maler/error-mal.tsx.txt. */
export function V2Feil({ reset, tilbakeHref, tittel = "Noe gikk galt" }: V2FeilProps) {
  return (
    <div style={{ minHeight: "60vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14, padding: "48px 24px" }}>
      <span style={{ width: 52, height: 52, borderRadius: 16, background: `color-mix(in srgb, ${T.down} 14%, transparent)`, border: `1px solid ${T.down}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="alert-triangle" size={22} style={{ color: T.down }} />
      </span>
      <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 22, color: T.fg, margin: 0 }}>{tittel}</h1>
      <p style={{ fontFamily: T.ui, fontSize: 13, color: T.mut, maxWidth: 340, lineHeight: 1.6, margin: 0 }}>
        Vi støtte på en uventet feil — prøv igjen, eller gå tilbake.
      </p>
      <div style={{ display: "flex", gap: 10, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
        <Knapp icon="rotate-cw" onClick={reset}>Prøv igjen</Knapp>
        <Link
          href={tilbakeHref}
          className="v2-press v2-focus"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: T.fg, background: T.panel3, border: `1px solid ${T.borderS}`, borderRadius: 9999, padding: "10px 18px", textDecoration: "none" }}
        >
          <Icon name="arrow-left" size={14} />Tilbake
        </Link>
      </div>
    </div>
  );
}

/* ── V2Laster ─────────────────────────────────────────── */
function ensurePulsStyle(): void {
  if (typeof document === "undefined" || document.getElementById("v2-loading-style")) return;
  const el = document.createElement("style");
  el.id = "v2-loading-style";
  el.textContent =
    `@keyframes v2Puls{0%,100%{opacity:.55}50%{opacity:1}}` +
    `.v2-skel{background:${T.panel2};transition:background ${T.dur}ms ${EASE};animation:v2Puls 1.6s ease-in-out infinite;}` +
    `@media (prefers-reduced-motion: reduce){.v2-skel{animation:none;opacity:.75;}}`;
  document.head.appendChild(el);
}
if (typeof document !== "undefined") ensurePulsStyle();

const PANEL_STYLE: CSSProperties = { background: T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: "18px 20px" };

function SkelBlock({ w, h, r = 8, style }: { w?: number | string; h: number; r?: number; style?: CSSProperties }) {
  return <div className="v2-skel" style={{ width: w ?? "100%", height: h, borderRadius: r, flex: "none", ...style }} />;
}

/** Skeleton-liste — dekker rad-baserte skjermer (Rad-mønsteret i core.tsx). */
function ListeSkel() {
  return (
    <div style={PANEL_STYLE}>
      <SkelBlock w={96} h={9} r={4} style={{ marginBottom: 16 }} />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: i < 4 ? `1px solid ${T.border}` : "none" }}>
          <SkelBlock w={30} h={30} r={9999} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minWidth: 0 }}>
            <SkelBlock w="60%" h={12} />
            <SkelBlock w="35%" h={10} />
          </div>
          <SkelBlock w={44} h={18} r={9999} />
        </div>
      ))}
    </div>
  );
}

/** Skeleton-kortgrid — dekker KPI-/kort-baserte skjermer (Kort/KpiFlis-mønsteret). */
function KortSkel() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: T.gap }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={PANEL_STYLE}>
          <SkelBlock w={64} h={9} r={4} />
          <SkelBlock w="70%" h={30} style={{ marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

/** Skeleton-dashboard — hero-tall + KPI-rad + graf, dekker oversiktsskjermer. */
function DashboardSkel() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <div style={PANEL_STYLE}>
        <SkelBlock w={120} h={9} r={4} />
        <SkelBlock w={180} h={T.numHero} style={{ marginTop: 14 }} />
      </div>
      <KortSkel />
      <div style={PANEL_STYLE}>
        <SkelBlock w={100} h={9} r={4} style={{ marginBottom: 16 }} />
        <SkelBlock h={96} r={12} />
      </div>
    </div>
  );
}

export type V2LasterVariant = "liste" | "kort" | "dashboard";
export interface V2LasterProps {
  variant?: V2LasterVariant;
}

/** Skeleton i v2-design. Rendres i en tynn loading.tsx (Server Component OK —
 *  se docs/redesign-v2/maler/loading-mal.tsx.txt). Tre varianter dekker
 *  liste-, kort- og dashboard-skjermer; pulserende paneler i T.panel2.
 *
 *  VIKTIG (bugfix 2026-07-12, sett i prod): loading.tsx rendres UTEN sidens
 *  V2Shell (shellen bor i page, ikke layout) — skeletonen bærer derfor selv
 *  hele den mørke chromen (bakgrunn + rail-silhuett), ellers vises mørke
 *  klosser på hvit flate ved hver navigering. */
export function V2Laster({ variant = "kort" }: V2LasterProps) {
  ensurePulsStyle();
  const inner =
    variant === "liste" ? <ListeSkel /> : variant === "dashboard" ? <DashboardSkel /> : <KortSkel />;
  return (
    <div
      className="dark"
      style={{
        minHeight: "100vh",
        background: `radial-gradient(1100px 460px at 24% -8%, var(--v2-vignett), transparent 62%), ${T.bg}`,
        colorScheme: "dark",
        display: "flex",
      }}
    >
      {/* Rail-silhuett — matcher V2Shell-railen så overgangen er sømløs. */}
      <div className="hidden md:block" style={{ width: 60, flex: "none", borderRight: `1px solid ${T.border}` }} />
      <div className="px-4 md:px-8 pt-6 pb-24 md:pb-9" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ maxWidth: 1680, margin: "0 auto" }}>{inner}</div>
      </div>
    </div>
  );
}
