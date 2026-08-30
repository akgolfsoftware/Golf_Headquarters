"use client";

/* AK Golf HQ v2 — KJERNEBIBLIOTEK (retning C «Presis», fase 4).
   Alle v2-skjermer komponeres av disse. Nye databehov → ny komponent HER
   (Anders' mandat 9. juli: skreddersy komponenter for dataene — aldri ad-hoc
   i skjermfiler). Port av ui_kits/v2/v2-core.jsx → produksjons-TSX (diff-null).
   Delt grunnstein: T/fmtSg (@/lib/v2/tokens), useCountUp/useMount/EASE/reduced
   (@/lib/v2/hooks), Icon (@/components/v2/icon).

   Designport steg 5B «core» (2026-08, docs/port/plan-designport-alle-skjermer.md
   + docs/port/steg5-kontroll.md): radius/avstand/typografi rettet mot Paper-
   fasiten i designsystem/paper/components/{actions,primitives,data,feedback,
   navigation,layout,forms}/. Farger/tone-systemet (TL.fill m.fl.) er IKKE rørt —
   kun form. Komponenter uten dedikert Paper-fasit (LogoAK, MikroMeta,
   FordelingHode/-Rad, AkseBar, Prikker, NivaSkala, Trend, InnsiktChip, Rad,
   AmbientBakgrunn, Skjerm, PillTabs, TilbakeLenke) er IKKE endret i dette
   steget — se PR-beskrivelsen for begrunnelse per komponent. */

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { TL } from "@/lib/v2/train-lock";
import { fmtSg, TOM_TALL, type AkseKey } from "@/lib/v2/format";
import { useCountUp, useMount, EASE, reduced } from "@/lib/v2/hooks";
import { Icon } from "@/components/v2/icon";
import { HjelpTips } from "@/components/v2/hjelp";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";

/* Re-eksport av grunnstein-primitivene så søster-familier kan importere fra "./core"
   (samme overflate som mockupens window.V2). */
export { T, fmtSg, TOM_TALL, fmtTall } from "@/lib/v2/tokens";
export { useCountUp, useMount } from "@/lib/v2/hooks";

/* Interaksjonspolish (press-scale, fokusring, hover-løft/rad, drag-løft/landing,
   inn-fade) bor statisk i src/styles/v2/motion.css (FASIT §4b) — importert via
   globals.css. Samme 180ms-språk, honorerer redusert bevegelse. */

/* ── Merkevare ────────────────────────────────────────── */
export interface LogoAKProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
  /**
   * Flate prikken sitter på.
   * - "ink": Train-lock mørk skinne/rail (V2Shell) → TL.text + TL.warm
   * - "paper": lys Paper-flate (auth, marketing — låst lys) → Paper-hex
   * - "auto" (default): følger tema via --p-logo-dot (marketing)
   */
  surface?: "paper" | "ink" | "auto";
}
/* Ekte AK Golf-logo (baneform + prikk). Banen følger color-prop.
   "ink" er Train-lock-skallets rail (TL-tokens) — "paper"/"auto" er
   Paper-låste flater (auth §4A, marketing) og beholder Paper-hex med vilje. */
export function LogoAK({ size = 26, color, style, surface = "auto" }: LogoAKProps) {
  const mark =
    color ??
    (surface === "ink"
      ? TL.text
      : surface === "paper"
        ? "#141413"
        : "var(--p-logo-mark)");
  const prikk =
    surface === "ink"
      ? TL.warm
      : surface === "paper"
        ? "#B85C3D"
        : "var(--p-logo-dot)";
  return (
    <svg width={size} height={Math.round((size * 470) / 538)} viewBox="0 0 538 470" fill="none" style={style} aria-label="AK Golf">
      <g transform="translate(0,470) scale(0.1,-0.1)">
        <path d="M3190 4486 c-23 -13 -109 -48 -585 -241 -99 -40 -198 -81 -220 -91 l-40 -18 45 -7 c127 -19 217 -102 271 -249 l24 -65 3 -1772 2 -1773 280 0 280 0 2 721 3 720 71 -83 c40 -46 132 -155 205 -243 73 -88 185 -221 249 -295 64 -74 152 -178 195 -230 44 -52 137 -162 209 -245 71 -82 167 -194 213 -247 l84 -98 355 0 c194 0 354 2 354 4 0 2 -73 89 -162 194 -90 104 -219 256 -288 337 -319 376 -552 649 -790 925 -59 69 -130 153 -158 187 -28 34 -56 64 -62 68 -5 3 -10 10 -10 14 0 7 90 83 221 186 42 33 163 130 270 215 107 86 223 178 259 206 378 292 550 427 550 430 0 2 -126 4 -279 4 l-280 0 -25 -82 c-25 -83 -102 -228 -159 -303 -108 -139 -178 -205 -502 -470 -87 -71 -189 -156 -225 -187 -100 -85 -293 -238 -297 -234 -2 1 -3 618 -3 1369 0 1297 -1 1367 -17 1367 -10 -1 -29 -7 -43 -14z M1200 3110 c-155 -15 -305 -58 -435 -123 -225 -112 -384 -275 -446 -457 -28 -82 -30 -194 -6 -267 25 -71 88 -139 162 -174 49 -24 73 -29 135 -29 62 0 85 5 135 29 75 36 116 79 150 155 35 80 41 138 21 214 -30 116 -119 209 -223 233 -29 7 -53 14 -53 16 0 3 13 23 29 47 60 86 146 146 260 180 68 20 222 21 313 2 254 -54 462 -285 542 -601 34 -138 47 -250 44 -380 l-3 -110 -95 -21 c-291 -66 -546 -127 -630 -149 -450 -122 -720 -290 -829 -517 -44 -91 -71 -205 -71 -296 0 -100 29 -241 65 -312 70 -140 152 -223 279 -285 98 -48 172 -66 302 -72 316 -16 613 107 885 365 l99 94 0 -191 0 -191 275 0 275 0 1 338 c0 185 0 618 -1 962 -1 576 -3 632 -21 720 -28 138 -55 216 -108 314 -111 207 -274 352 -496 437 -155 61 -371 87 -555 69z m630 -1846 l0 -486 -60 -56 c-91 -84 -157 -131 -235 -167 -265 -123 -559 -66 -692 134 -62 92 -78 148 -78 271 0 76 5 119 19 158 24 71 106 191 163 242 95 83 231 162 410 236 81 34 432 150 461 153 9 1 12 -102 12 -485z" fill={mark}></path>
        <circle cx="4840" cy="3620" r="310" fill={prikk}></circle>
      </g>
    </svg>
  );
}

/* Profilbilde (Anders 9. juli): opplastet bilde → foto-avatar OG ambient
   uskarp bakgrunnsglød i hele appen (Spotify-idiomet). Sett via PROFIL.src. */
export const PROFIL: { src: string | null; navn: string } = { src: null, navn: "Øyvind Rohjan" };

/* ── Tekst-primitiver ─────────────────────────────────── */
export interface CapsProps {
  size?: number;
  color?: string;
  children?: ReactNode;
  style?: CSSProperties;
}
/* Paper-fasit: primitives/SectionLabel (mono 10/600, sporing .1em, versaler,
   muted, line-height 1). `size`-propen beholdes (mange skjermer setter 9px i
   tette KPI-etiketter) — kun vekt/sporing/line-height rettet mot fasiten. */
export function Caps({ size = 10, color = TL.mute, children, style }: CapsProps) {
  return <span style={{ fontFamily: TL.font.mono, fontSize: size, fontWeight: 600, letterSpacing: "0.1em", lineHeight: 1, textTransform: "uppercase", color, display: "block", ...style }}>{children}</span>;
}
export interface TittelProps {
  children?: ReactNode;
  mobile?: boolean;
  em?: string;
}
/* skjermtittel m/ valgfri kursiv lime-aksent. Paper-fasit: type-display.html
   «sidetittel» 32/600, sporing -.01em. Skriftfamilien er Poppins via TL.font.sans
   (steg 10, 2026-08-14 — Familjen Grotesk er fjernet fra appen). */
export function Tittel({ children, mobile, em }: TittelProps) {
  return <h1 style={{ fontFamily: TL.font.sans, fontWeight: 600, fontSize: mobile ? 27 : 32, letterSpacing: "-0.01em", color: TL.text, margin: 0, lineHeight: 1.1 }}>{children}{em && <> <em style={{ fontStyle: "italic", color: TL.fill }}>{em}</em></>}</h1>;
}

/* ── Chips + status ───────────────────────────────────── */
export interface DeltaChipProps {
  v: string;
  dir?: "up" | "down";
}
/* Paper-fasit: data/KpiCard sin .akhq-kpi-delta — ren mono-tekst m/ retningsfarge,
   ingen pille-bakgrunn og ikke ikon (retning bæres av fortegn + farge, ikke pil).
   Strukturell forenkling (2026-08 steg 5B) — samme prop-API. */
export function DeltaChip({ v, dir }: DeltaChipProps) {
  const c = dir === "down" ? TL.danger : TL.ok;
  return <span style={{ fontFamily: TL.font.mono, fontSize: 11, fontWeight: 600, color: c, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{v}</span>;
}

export type StatusTone = "lime" | "up" | "warm" | "warn" | "down" | "info";
export interface StatusPillProps {
  children?: ReactNode;
  tone?: StatusTone;
}
/* ● STIGENDE · LIVE · NÅ
   Paper-fasit: primitives/StatusBadge — 20px høy, r-pill, mono 10/600 versaler,
   border i samme tone (26%) rundt den 10%-tonede fyllen. rTag(8) var feil radius
   for et merke (den er reservert Knapp, se Button.prompt.md) — retter til rPill.
   "warm" (Fasit: designsystem/train-lock/MAT-00 Materialer.dc.html, PX-7
   2026-08-29): Fullført/completed-status ER ALDRI TL.ok (#30D158) — den er
   forbeholdt Godta/PUBLISERT (CLAUDE.md invariant 2). Bruk tone="warm" for
   fullført-merker, "up" er fortsatt tilgjengelig for andre positive statuser
   (Bekreftet, Betalt) som ikke er "fullført"-semantikk. */
export function StatusPill({ children, tone = "lime" }: StatusPillProps) {
  /* lime-tone = Paper ink accent soft (not neon). Brand neon never on status default. */
  const c: string = { lime: TL.text, up: TL.ok, warm: TL.warm, warn: TL.warn, down: TL.danger, info: TL.viz.target }[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        height: 20,
        boxSizing: "border-box",
        fontFamily: TL.font.mono,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.06em",
        lineHeight: 1,
        color: c,
        background: `color-mix(in srgb,${c} 10%,transparent)`,
        border: `1px solid color-mix(in srgb,${c} 26%,transparent)`,
        borderRadius: TL.radius.pill,
        padding: "0 8px",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 5, height: 5, borderRadius: 9999, background: c, flex: "none" }} />
      {children}
    </span>
  );
}

/** Tag — core-parity-navn (fasit). Samme stil som StatusPill, radius tag 8. */
export type TagProps = StatusPillProps;
export function Tag({ children, tone = "lime" }: TagProps) {
  return <StatusPill tone={tone}>{children}</StatusPill>;
}

export type SevKey = "sterk" | "medium" | "lav" | "ok";
export interface SevChipProps {
  s: SevKey;
}
/* alvorlighet i kø-rader — klarspråk, aldri sperre-språk.
   Paper-fasit: samme StatusBadge-geometri som StatusPill (20px, r-pill). */
export function SevChip({ s }: SevChipProps) {
  const map: Record<string, { c: string; l: string }> = {
    sterk: { c: TL.danger, l: "Sterkt avvik" },
    medium: { c: TL.warn, l: "Venter" },
    lav: { c: TL.viz.target, l: "Spørsmål" },
    ok: { c: TL.ok, l: "I rute" },
  };
  const m = map[s] || map.lav;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 20,
        boxSizing: "border-box",
        fontFamily: TL.font.mono,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.06em",
        lineHeight: 1,
        textTransform: "uppercase",
        color: m.c,
        background: `color-mix(in srgb,${m.c} 12%,transparent)`,
        border: `1px solid color-mix(in srgb,${m.c} 26%,transparent)`,
        borderRadius: TL.radius.pill,
        padding: "0 8px",
        whiteSpace: "nowrap",
      }}
    >
      {m.l}
    </span>
  );
}

/* Aksenavn i klarspråk — display only, datanøklene (FYS/TEK/SLAG/SPILL/TURN) er uendret. */
export const AKSE_NAVN: Record<AkseKey, string> = { FYS: "Fysisk", TEK: "Teknikk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering" };

export interface AkseChipProps {
  a: AkseKey;
}
/* Fysisk/Teknikk/Slag/Spill/Turnering m/ kategorifarge-prikk (sentence-case, ingen uppercase).
   Paper-fasit: samme StatusBadge-geometri (20px, r-pill) — AK-spesifikk, ingen
   dedikert Paper-komponent, men badge-formen den bruker er felles med StatusPill/SevChip. */
export function AkseChip({ a }: AkseChipProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, height: 20, boxSizing: "border-box", fontFamily: TL.font.mono, fontSize: 10, fontWeight: 600, lineHeight: 1, color: TL.mute, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: TL.radius.pill, padding: "0 8px" }}>
      <span style={{ width: 6, height: 6, borderRadius: 9999, background: TL.mute, flex: "none" }} />{AKSE_NAVN[a] || a}
    </span>
  );
}

export interface MikroMetaProps {
  icon: string;
  children?: ReactNode;
}
/* Liten mono-meta: ikon + tekst (sted, serie/gjentakelse osv.). */
export function MikroMeta({ icon, children }: MikroMetaProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: TL.font.mono, fontSize: 9, fontWeight: 700, color: TL.mute }}>
      <Icon name={icon} size={10} style={{ color: TL.mute }} />{children}
    </span>
  );
}

/* ── Flater ───────────────────────────────────────────── */
/* Paper-fasit: layout/Panel (.akhq-panel) — radius var(--r) 12px, padding
   16/18/18, box-shadow var(--p-shadow) (myk i lys, INGEN skygge i mørk — flaten
   skiller seg med --p-surface/--p-border der, ikke med skygge). TL.radius.card i
   tokens.ts er fortsatt 20 (delt av andre v2-familier); Kort bruker en lokal
   Paper-radius her fremfor å endre det delte tallet utenfor denne filens scope
   (steg 5B core). R_CARD/SHADOW_CARD bør flyttes inn i T når hele porten
   konvergerer. Erstatter den gamle "dybde"-skyggen (inset-highlight + stor
   mørk skygge) som ikke har noe motstykke i Paper. */
const R_CARD = TL.radius.card;
const SHADOW_CARD = "none";
export interface KortProps {
  tint?: boolean;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  pad?: string;
  hover?: boolean;
  style?: CSSProperties;
}
export function Kort({ tint, eyebrow, action, children, pad = "16px 18px 18px", hover, style }: KortProps) {
  return (
    <div className={hover ? "v2-kort-h" : undefined} style={{ background: tint ? `${TL.dim}, ${TL.elev}` : TL.elev, border: `1px solid ${TL.hair}`, borderRadius: R_CARD, padding: pad, minWidth: 0, display: "flex", flexDirection: "column", boxShadow: SHADOW_CARD, transition: `transform 180ms ${EASE}, border-color 180ms ${EASE}`, ...(hover ? { cursor: "pointer" } : null), ...style }}>
      {(eyebrow || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
          {eyebrow ? <Caps>{eyebrow}</Caps> : <span />}{action}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── Tall ─────────────────────────────────────────────── */
export interface TallHeroProps {
  label?: ReactNode;
  /** null/undefined/"" → em-dash (fasit tom tallverdi). */
  value: number | string | null | undefined;
  unit?: string;
  delta?: string;
  dir?: "up" | "down";
  sub?: ReactNode;
  size?: number;
  accent?: boolean;
  action?: ReactNode;
  hjelp?: HjelpNokkel;
}
export function TallHero({ label, value, unit, delta, dir, sub, size = 56, accent, action, hjelp }: TallHeroProps) {
  const tom = value === null || value === undefined || value === "";
  const shown = useCountUp(tom ? 0 : (value as number | string));
  const display = tom ? TOM_TALL : shown;
  return (
    <div>
      {(label || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          {label ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Caps>{label}</Caps>
              {hjelp && <HjelpTips k={hjelp} />}
            </span>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginTop: label ? 14 : 0, flexWrap: "wrap", minWidth: 0 }}>
        {/* Paper-fasit: type-mono.html «hero-val» — vekt 500 (ikke 700), sporing -.02em. */}
        <span style={{ fontFamily: TL.font.mono, fontSize: size, fontWeight: 500, color: accent && !tom ? TL.fill : TL.text, lineHeight: 0.9, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>{display}</span>
        {unit && !tom && <span style={{ fontFamily: TL.font.mono, fontSize: Math.round(size * 0.3), color: TL.mute }}>{unit}</span>}
        {delta && !tom && <DeltaChip v={delta} dir={dir} />}
      </div>
      {sub && <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, display: "block", marginTop: 10 }}>{sub}</span>}
    </div>
  );
}
export interface KpiFlisProps {
  label?: ReactNode;
  /** null/undefined/"" → em-dash. */
  value: number | string | null | undefined;
  delta?: string;
  dir?: "up" | "down";
  tint?: boolean;
  varsle?: boolean;
  hjelp?: HjelpNokkel;
  /** Dropp tell-opp-fra-0-animasjonen. Bruk for absolutte tall der 0 aldri er en
   *  reell mellomverdi (f.eks. golf-brutto­score) — ellers vises en umulig verdi
   *  i overgangen (0 → mål) i de første rammene etter montering. */
  instant?: boolean;
  /** Liten mutt undertekst under verdien (f.eks. «49 av 119 timeluker»). */
  sub?: ReactNode;
}
/* Paper-fasit: data/KpiCard — akhq-card (16px uniform padding, ikke Panels
   asymmetriske 16/18/18), verdi clamp(24px,2.4vw,28px)/600/sporing -.03em
   (var 38/700, mye større enn Paper sin tette KPI-flis). */
export function KpiFlis({ label, value, delta, dir, tint, varsle, hjelp, instant, sub }: KpiFlisProps) {
  const tom = value === null || value === undefined || value === "";
  const animert = useCountUp(tom ? 0 : (value as number | string));
  const shown = tom ? TOM_TALL : instant ? String(value) : animert;
  return (
    <Kort tint={tint || varsle} pad="16px">
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Caps size={9}>{label}</Caps>
        {hjelp && <HjelpTips k={hjelp} size={11} />}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12, flexWrap: "wrap", minWidth: 0 }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: "clamp(24px, 2.4vw, 28px)", fontWeight: 600, letterSpacing: "-0.03em", color: TL.text, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{shown}</span>
        {delta && !tom && <DeltaChip v={delta} dir={dir} />}
      </div>
      {sub && <span style={{ fontFamily: TL.font.sans, fontSize: 10.5, color: TL.mute, display: "block", marginTop: 6 }}>{sub}</span>}
    </Kort>
  );
}

/* ── Navigasjon/velgere ───────────────────────────────── */
export interface Tab {
  id: string;
  l: string;
}
export interface PillTabsProps {
  tabs: Tab[];
  value: string;
  onChange?: (id: string) => void;
}
/* aktiv = lime-pille. Overflyt-hint: høyrekant-fade (mask) + liten chevron når
   fanene ikke får plass (scrollWidth > clientWidth) — signaliserer at det finnes
   flere faner å scrolle til. */
export function PillTabs({ tabs, value, onChange }: PillTabsProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const sjekk = () => setOverflow(el.scrollWidth > el.clientWidth + 1);
    sjekk();
    const ro = new ResizeObserver(sjekk);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tabs.length]);

  const mask = overflow ? "linear-gradient(to right, black 0%, black calc(100% - 26px), transparent 100%)" : undefined;

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={scrollerRef}
        style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 2, maskImage: mask, WebkitMaskImage: mask }}
      >
        {tabs.map((t) => {
          const on = value === t.id;
          return (
            <button key={t.id} className="v2-press v2-focus" onClick={() => onChange && onChange(t.id)} style={{ appearance: "none", cursor: "pointer", fontFamily: TL.font.sans, fontSize: 13, fontWeight: 600, padding: "8px 15px", minHeight: 40, minWidth: 44, borderRadius: TL.radius.pill, color: on ? TL.text : TL.mute, background: on ? TL.elev : TL.dock, border: `1px solid ${on ? TL.text : TL.hair}`, boxShadow: on ? `inset 0 -2px 0 ${TL.fill}` : undefined, whiteSpace: "nowrap" }}>{t.l}</button>
          );
        })}
      </div>
      {overflow && (
        <Icon name="chevron-right" size={12} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(calc(-50% - 1px))", color: TL.mute, pointerEvents: "none" }} />
      )}
    </div>
  );
}
export interface VelgerOption {
  v: string;
  l: string;
}
export interface PillVelgerProps {
  options: VelgerOption[];
  value: string;
  onChange?: (v: string) => void;
}
/* periodevelger — aktiv = lys pille.
   Paper-fasit: forms/SegmentControl (.akhq-seg) — wrapper-padding 2px (var 3),
   knapp-høyde 28px fast, sporing/vekt 12/500 (var 12.5/600). */
export function PillVelger({ options, value, onChange }: PillVelgerProps) {
  return (
    <div style={{ display: "flex", gap: 2, background: TL.dock, border: `1px solid ${TL.hair}`, borderRadius: 9999, padding: 2, width: "fit-content" }}>
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button key={o.v} className="v2-press v2-focus" onClick={() => onChange && onChange(o.v)} style={{ appearance: "none", cursor: "pointer", fontFamily: TL.font.sans, fontSize: 12, fontWeight: 500, height: 28, padding: "0 16px", borderRadius: 9999, color: on ? TL.scene : TL.mute, background: on ? TL.text : "transparent", border: "none", whiteSpace: "nowrap" }}>{o.l}</button>
        );
      })}
    </div>
  );
}
export interface FilterChipsProps {
  items: string[];
  active?: string[];
  onToggle?: (x: string) => void;
  axis?: boolean;
}
/* multi-filter m/ check. axis=true → x er en AkseKey-datanøkkel (matching/onToggle uendret), vises som Fysisk/Teknikk/…
   Mørk chip-stil (audit 2026-07-12): umarkert = TL.dim + border (som badges/chips ellers
   i appen), valgt = lime m/ TL.onFill — aldri lyse piller på mørk flate. */
export function FilterChips({ items, active = [], onToggle, axis }: FilterChipsProps) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {items.map((x, i) => {
        const on = active.indexOf(x) !== -1;
        return (
          <button key={i} className="v2-press v2-focus" onClick={() => onToggle && onToggle(x)} style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", borderRadius: 9999, background: on ? TL.dim : TL.dim, border: `1px solid ${on ? TL.fill : TL.hair}`, color: on ? TL.fill : TL.text, fontFamily: TL.font.sans, fontSize: 12.5, fontWeight: 500 }}>
            {on && <Icon name="check" size={12} />}
            {axis && <span style={{ width: 7, height: 7, borderRadius: 9999, background: TL.mute }} />}
            {axis ? AKSE_NAVN[x as AkseKey] || x : x}
          </button>
        );
      })}
    </div>
  );
}
export interface CTAPillProps {
  icon?: string;
  children?: ReactNode;
  ghost?: boolean;
  /** Strekker pillen til full bredde av forelder (f.eks. mobil-CTA under et kort). */
  full?: boolean;
  /** Paper: clay «Én ting nå» — maks én per skjerm. Default solid = ink CTA. */
  enTing?: boolean;
  onClick?: () => void;
}
/* Paper-fasit: solid default = ink (--p-cta). enTing=true → clay handling-monopol. */
export function CTAPill({ icon, children, ghost, full, enTing, onClick }: CTAPillProps) {
  const solidBg = enTing ? TL.fill : TL.fill;
  const solidFg = enTing ? TL.onFill : TL.onFill;
  return (
    <button
      type="button"
      onClick={onClick}
      className="v2-press v2-focus"
      data-paper-en-ting={enTing ? "true" : undefined}
      style={{
        appearance: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: full ? "center" : undefined,
        gap: 8,
        fontFamily: TL.font.sans,
        fontSize: enTing ? 14 : 12.5,
        fontWeight: 600,
        color: ghost ? TL.text : solidFg,
        background: ghost ? TL.dim : solidBg,
        border: ghost ? `1px solid ${TL.hair}` : "none",
        borderRadius: enTing ? 12 : TL.radius.row,
        padding: enTing ? "14px 18px" : "10px 16px",
        minHeight: enTing ? 56 : 44,
        cursor: "pointer",
        width: full ? "100%" : undefined,
      }}
    >
      {icon && <Icon name={icon} size={14} />}{children}
    </button>
  );
}

export interface TilbakeLenkeProps {
  /** Målrute (f.eks. tilbake til spillerprofilen eller spillerlisten). */
  href: string;
  children?: ReactNode;
}
/* Delt tilbake-navigasjon for sub-navigasjonsklynger (f.eks. spiller-360°:
   profil→analyse→plan→fremgang→tester). Ett mønster overalt: CTAPill ghost
   + arrow-left. Bruk denne i stedet for ad-hoc lenker med chevron-left. */
export function TilbakeLenke({ href, children }: TilbakeLenkeProps) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <CTAPill ghost icon="arrow-left">{children}</CTAPill>
    </Link>
  );
}

export interface KnappProps {
  icon?: string;
  children?: ReactNode;
  ghost?: boolean;
  full?: boolean;
  disabled?: boolean;
  /** Paper clay «Én ting nå» — ellers ink solid CTA. */
  enTing?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
  style?: CSSProperties;
}
/* Paper: default solid = ink CTA; enTing → clay handling. */
export function Knapp({ icon, children, ghost, full, disabled, enTing, onClick, type = "button", style }: KnappProps) {
  const solidBg = enTing ? TL.fill : TL.fill;
  const solidFg = enTing ? TL.onFill : TL.onFill;
  return (
    <button
      type={type}
      className="v2-press v2-focus"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      data-paper-en-ting={enTing ? "true" : undefined}
      style={{
        appearance: "none",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        fontFamily: TL.font.sans,
        fontSize: 12.5,
        fontWeight: 600,
        color: ghost ? TL.text : solidFg,
        background: ghost ? TL.dim : solidBg,
        border: ghost ? `1px solid ${TL.hair}` : "1px solid transparent",
        borderRadius: TL.radius.row,
        padding: "10px 18px",
        minHeight: 44,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        width: full ? "100%" : "auto",
        ...style,
      }}
    >
      {icon && <Icon name={icon} size={14} />}{children}
    </button>
  );
}

/* ── Rader/lister ─────────────────────────────────────── */
export interface AvatarInitProps {
  navn: string;
  size?: number;
}
/* Paper-fasit: primitives/Avatar — sirkel uten kant (kun tone="outline" har
   border), mono 600, sporing .02em. Radstandarden er 36px; default (30px) er
   IKKE endret her — 82 filer bruker komponenten uten eksplisitt size, og en
   default-endring uten skjerm-for-skjerm-gjennomgang er utenfor denne PR-ens
   scope (flagget i PR-beskrivelsen). */
export function AvatarInit({ navn, size = 30 }: AvatarInitProps) {
  return <span style={{ width: size, height: size, borderRadius: 9999, background: TL.dim, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: TL.font.mono, fontSize: size * 0.33, fontWeight: 600, letterSpacing: "0.02em", color: TL.mute, flex: "none" }}>{navn.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>;
}
export interface AvatarFotoProps {
  src?: string | null;
  navn?: string;
  size?: number;
  ring?: boolean;
}
export function AvatarFoto({ src, navn = PROFIL.navn, size = 30, ring }: AvatarFotoProps) {
  const kilde = src !== undefined ? src : PROFIL.src;
  if (!kilde) return <AvatarInit navn={navn} size={size} />;
  return (
    <span style={{ width: size, height: size, borderRadius: 9999, overflow: "hidden", flex: "none", display: "inline-block", boxShadow: ring ? `0 0 0 2px ${TL.scene}, 0 0 0 3.5px color-mix(in srgb,${TL.fill} 55%,transparent)` : "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={kilde} alt={navn} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </span>
  );
}
/* Ambient-laget: blurret profilbilde bak innholdet, maskes ut nedover */
export function AmbientBakgrunn() {
  if (!PROFIL.src) return null;
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={PROFIL.src} alt="" style={{ position: "absolute", top: "-20%", left: "-10%", width: "120%", height: "70%", objectFit: "cover",
        filter: "blur(90px) saturate(1.25) brightness(0.55)", opacity: 0.38,
        maskImage: `linear-gradient(180deg, ${TL.scene} 0%, transparent 90%)`,
        WebkitMaskImage: `linear-gradient(180deg, ${TL.scene} 0%, transparent 90%)` }} />
    </div>
  );
}
export interface RadProps {
  leading?: ReactNode;
  title?: ReactNode;
  sub?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  naa?: boolean;
  last?: boolean;
  onClick?: () => void;
}
export function Rad({ leading, title, sub, meta, trailing, naa, last, onClick }: RadProps) {
  return (
    <div onClick={onClick} className={onClick ? "v2-row-h" : undefined} style={{ display: "flex", alignItems: "center", gap: 12, padding: onClick ? "11px 10px" : "11px 0", margin: onClick ? "0 -10px" : 0, borderRadius: onClick ? TL.radius.row : 0, borderBottom: last ? "none" : `1px solid ${TL.hair}`, cursor: onClick ? "pointer" : "default" }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: TL.font.sans, fontSize: 13.5, fontWeight: 600, color: TL.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {sub && <div style={{ fontFamily: TL.font.sans, fontSize: 11.5, color: TL.mute, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
      </div>
      {meta}
      {naa && <StatusPill>Nå</StatusPill>}
      {trailing !== null && (trailing || <Icon name="chevron-right" size={14} style={{ color: TL.mute }} />)}
    </div>
  );
}

/* ── Datavisning ──────────────────────────────────────── */
export interface FordelingHodeProps {
  kol1?: ReactNode;
  kol2?: ReactNode;
}
export function FordelingHode({ kol1 = "%", kol2 }: FordelingHodeProps) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, paddingBottom: 5, borderBottom: `1px solid ${TL.hair}` }}>
      <span style={{ flex: 1 }} />
      <Caps size={9} style={{ width: 36, textAlign: "right" }}>{kol1}</Caps>
      {kol2 && <Caps size={9} style={{ width: 84, textAlign: "right" }}>{kol2}</Caps>}
    </div>
  );
}
export interface FordelingRadProps {
  code?: ReactNode;
  label?: ReactNode;
  pct: number;
  value: ReactNode;
  neg?: boolean;
  signal?: boolean;
  kol2?: boolean;
  last?: boolean;
  /** B-pakke: uthev svakeste/viktigste rad (tykkere, bakgrunn). */
  emphasis?: boolean;
}
/* signal=true → opp/ned-DATA (SG o.l.): positiv grønn / negativ rød (aldri lime på data).
   Uten signal → MENGDE/andel: lime-fyll (aksent, ikke signal). */
export function FordelingRad({ code, label, pct, value, neg, signal, kol2, last, emphasis }: FordelingRadProps) {
  const grown = useMount();
  const fyll = signal ? (neg ? TL.danger : TL.ok) : (neg ? TL.danger : TL.fill);
  const valgFg = signal ? (neg ? TL.danger : TL.ok) : (neg ? TL.danger : TL.text);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 11,
        padding: emphasis ? "12px 10px" : "10px 0",
        margin: emphasis ? "0 -10px" : undefined,
        borderRadius: emphasis ? 12 : undefined,
        background: emphasis ? `color-mix(in srgb, ${TL.danger} 8%, transparent)` : undefined,
        borderBottom: last || emphasis ? "none" : `1px solid ${TL.hair}`,
      }}
    >
      {code && <span style={{ width: 40, fontFamily: TL.font.mono, fontSize: 10, fontWeight: 700, color: TL.mute, flex: "none" }}>{code}</span>}
      {label && (
        <span
          style={{
            width: 110,
            flex: "none",
            fontFamily: TL.font.sans,
            fontSize: emphasis ? 14 : 13,
            fontWeight: emphasis ? 700 : 400,
            color: emphasis ? TL.text : TL.mute,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
      )}
      <div style={{ flex: 1, height: emphasis ? 9 : 7, borderRadius: 9999, background: TL.hair, overflow: "hidden" }}>
        <div style={{ width: (grown ? Math.max(3, Math.min(100, pct)) : 0) + "%", height: "100%", background: fyll, opacity: (neg || signal) ? 1 : 0.9, borderRadius: 9999, transition: `width 500ms ${EASE}` }} />
      </div>
      {typeof pct === "number" && <span style={{ width: 36, flex: "none", textAlign: "right", fontFamily: TL.font.mono, fontSize: 12, fontWeight: 700, color: TL.mute, fontVariantNumeric: "tabular-nums" }}>{Math.round(pct)}%</span>}
      <span style={{ width: kol2 ? 84 : 48, flex: "none", textAlign: "right", fontFamily: TL.font.mono, fontSize: emphasis ? 15 : 12.5, fontWeight: 700, color: valgFg, fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}
export interface AkseBarProps {
  a: AkseKey;
  v: number;
  m: number;
  max?: number;
  enhet?: string;
  last?: boolean;
}
/* faktisk vs mål per akse */
export function AkseBar({ a, v, m, max = 60, enhet = "t", last }: AkseBarProps) {
  const grown = useMount();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: last ? "none" : `1px solid ${TL.hair}` }}>
      <span style={{ width: 64, fontFamily: TL.font.sans, fontSize: 11.5, fontWeight: 600, color: TL.mute, flex: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{AKSE_NAVN[a] || a}</span>
      <div style={{ flex: 1, height: 7, borderRadius: 9999, background: TL.hair, position: "relative" }}>
        <div style={{ width: (grown ? Math.min(100, (v / max) * 100) : 0) + "%", height: "100%", background: TL.fill, opacity: 0.85, borderRadius: 9999, transition: `width 500ms ${EASE}` }} />
        <span style={{ position: "absolute", left: Math.min(100, (m / max) * 100) + "%", top: -3, width: 2, height: 13, background: TL.text, borderRadius: 1 }} />
      </div>
      <span style={{ fontFamily: TL.font.mono, fontSize: 11, color: TL.mute, width: 60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{v}<span style={{ color: TL.mute }}>/{m} {enhet}</span></span>
    </div>
  );
}
export interface PrikkerProps {
  n?: number;
  hits?: number[];
  on?: string;
  cols?: number;
}
/* frekvens-heatmap */
export function Prikker({ n = 84, hits, on = TL.fill, cols = 28 }: PrikkerProps) {
  const seed = hits || [3, 7, 9, 12, 16, 17, 22, 26, 28, 31, 36, 38, 43, 45, 50, 52, 57, 61, 64, 68, 71, 75, 78, 82];
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3 }}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: 9999, background: seed.indexOf(i) !== -1 ? on : TL.hair }} />
      ))}
    </div>
  );
}
export interface NivaSkalaProps {
  pct: number;
  stops?: string[];
}
/* benchmark-posisjon */
export function NivaSkala({ pct, stops = ["CS90", "CS100", "CS110", "CS120"] }: NivaSkalaProps) {
  const grown = useMount();
  return (
    <div>
      <div style={{ position: "relative", height: 8, borderRadius: 9999, background: TL.dim }}>
        <span style={{ position: "absolute", left: (grown ? pct : 0) + "%", top: -4, width: 16, height: 16, borderRadius: 9999, background: TL.fill, border: `2px solid ${TL.elev}`, transform: "translateX(-8px)", transition: `left 500ms ${EASE}` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {stops.map((s) => <span key={s} style={{ fontFamily: TL.font.mono, fontSize: 8.5, color: TL.mute }}>{s}</span>)}
      </div>
    </div>
  );
}
export interface TrendProps {
  series: number[];
  height?: number;
  yMin?: number;
  yMax?: number;
  baseline?: number | null;
  fmt?: (v: number) => string;
  xLabels?: string[];
}
/* Graf-motor v2 (kvalitetsplan §11): gridlinjer, y-verdier, gradient-fyll,
   glød på linjen, endepunkt m/ halo, baseline. Selvstendig inline SVG med
   draw-in (stroke-dasharray) — erstatter mockupens WBVIZ-lånegraf. */
export function Trend({ series, height = 96, yMin, yMax, baseline = 0, fmt, xLabels }: TrendProps) {
  const lineRef = useRef<SVGPolylineElement>(null);
  const [len, setLen] = useState(0);
  const [drawn, setDrawn] = useState(() => reduced());
  useEffect(() => {
    if (reduced()) return;
    const el = lineRef.current;
    setLen(el && el.getTotalLength ? el.getTotalLength() : 0);
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setDrawn(true)));
    return () => cancelAnimationFrame(id);
  }, []);
  const f = fmt || fmtSg;
  const W_ = 560, PADL = 34, PADR = 14, PADT = 10, PADB = xLabels ? 18 : 8;
  const lo = yMin != null ? yMin : Math.min(...series), hi = yMax != null ? yMax : Math.max(...series);
  const ih = height - PADT - PADB, iw = W_ - PADL - PADR;
  const X = (i: number) => PADL + (i / (series.length - 1)) * iw;
  const Y = (v: number) => PADT + (1 - (v - lo) / (hi - lo)) * ih;
  const pts = series.map((v, i) => `${X(i)},${Y(v)}`).join(" ");
  const omr = `${PADL},${Y(lo)} ${pts} ${X(series.length - 1)},${Y(lo)}`;
  const grid = [0, 0.5, 1].map((t) => lo + t * (hi - lo));
  const gid = "tg" + Math.abs(series.reduce((s, v, i) => s + v * 31 + i, 7) | 0);
  const sisteX = X(series.length - 1), sisteY = Y(series[series.length - 1]);
  return (
    <svg viewBox={`0 0 ${W_} ${height}`} style={{ width: "100%", height: "auto", display: "block" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={TL.fill} stopOpacity="0.22" />
          <stop offset="100%" stopColor={TL.fill} stopOpacity="0" />
        </linearGradient>
        <filter id={gid + "g"} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {grid.map((v, i) => (
        <g key={i}>
          <line x1={PADL} x2={W_ - PADR} y1={Y(v)} y2={Y(v)} stroke={`color-mix(in srgb, ${TL.hair} 70%, transparent)`} strokeWidth="1" />
          <text x={PADL - 7} y={Y(v) + 3} textAnchor="end" style={{ fontFamily: "var(--p-mono)" }} fontSize="8.5" fill={TL.mute}>{f(v)}</text>
        </g>
      ))}
      {baseline != null && baseline >= lo && baseline <= hi && (
        <line x1={PADL} x2={W_ - PADR} y1={Y(baseline)} y2={Y(baseline)} stroke={`color-mix(in srgb, ${TL.text} 22%, transparent)`} strokeWidth="1" strokeDasharray="3 4" />
      )}
      <polygon points={omr} fill={`url(#${gid})`} style={{ opacity: drawn ? 1 : 0, transition: `opacity 700ms ${EASE}` }} />
      <polyline ref={lineRef} points={pts} fill="none" stroke={TL.fill} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" filter={`url(#${gid + "g"})`}
        style={len ? { strokeDasharray: len, strokeDashoffset: drawn ? 0 : len, transition: `stroke-dashoffset 700ms ${EASE}` } : undefined} />
      <circle cx={sisteX} cy={sisteY} r="7" fill={TL.fill} opacity="0.18" />
      <circle cx={sisteX} cy={sisteY} r="3.2" fill={TL.fill} stroke={TL.elev} strokeWidth="1.5" />
      {xLabels && xLabels.map((l, i) => (
        <text key={i} x={PADL + (i / (xLabels.length - 1)) * iw} y={height - 4} textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"} style={{ fontFamily: "var(--p-mono)" }} fontSize="8" fill={TL.mute} letterSpacing="0.08em">{l}</text>
      ))}
    </svg>
  );
}
export interface InnsiktChipProps {
  children?: ReactNode;
  cta?: ReactNode;
  /** Gjør `cta`-teksten til en ekte lenke. Uten denne rendres `cta` som
   *  vanlig uthevet tekst UTEN pil — ser aldri klikkbar ut uten å være det
   *  (I8 lag 2-funn: 20+ skjermer viste en lime "cta →" som ikke gjorde noe). */
  href?: string;
}
/* AI-innsikt — stille, aldri ropende */
export function InnsiktChip({ children, cta, href }: InnsiktChipProps) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: TL.dock, border: `1px solid ${TL.hair}` }}>
      <Icon name="sparkles" size={13} style={{ color: TL.fill, flex: "none", marginTop: 1 }} />
      <span style={{ fontFamily: TL.font.sans, fontSize: 12, color: TL.mute, lineHeight: 1.5 }}>
        {children}
        {cta && href && (
          <>
            {" "}
            <Link href={href} style={{ color: TL.fill, fontWeight: 600, textDecoration: "none" }}>
              {cta} →
            </Link>
          </>
        )}
        {cta && !href && <> <span style={{ color: TL.text, fontWeight: 600 }}>{cta}</span></>}
      </span>
    </div>
  );
}
export interface TomTilstandProps {
  icon?: string;
  title?: ReactNode;
  sub?: ReactNode;
}
/* Paper-fasit: feedback/EmptyState (.akhq-estate) — ikonsirkel 32px (var 44,
   avrundet firkant), ingen kant rundt sirkelen, tittel 14.5/600/1.3,
   forklaring 12.5/1.55 maks 44ch. `action`-plassen i fasiten (CTA under
   teksten) er IKKE lagt til her — det er en API-utvidelse, ikke en geometri-
   retting, og TomTilstand brukes i ~208 filer; utsatt til egen beslutning.
   Beskrivelsesteksten holder Inter (TL.font.sans), ikke Paper sin serif --body — se
   CLAUDE.md invariant 2 (ingen nye skriftfamilier før etter piloten). */
export function TomTilstand({ icon = "circle", title, sub }: TomTilstandProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", padding: "34px 24px" }}>
      <span style={{ width: 32, height: 32, borderRadius: 9999, background: TL.dock, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}><Icon name={icon} size={16} style={{ color: TL.mute }} /></span>
      <div>
        <div style={{ fontFamily: TL.font.sans, fontWeight: 600, fontSize: 14.5, lineHeight: 1.3, color: TL.text }}>{title}</div>
        {sub && <p style={{ fontFamily: TL.font.sans, fontSize: 12.5, color: TL.mute, lineHeight: 1.55, margin: "6px 0 0", maxWidth: "44ch" }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ── Skjermramme (desktop sidebar + mobil bunn-nav) ───── */
export interface NavItem {
  id: string;
  l: string;
  i: string;
}
export const NAV: NavItem[] = [
  { id: "hjem", l: "Hjem", i: "home" }, { id: "plan", l: "Plan", i: "calendar" },
  { id: "gjor", l: "Gjør", i: "play" }, { id: "analyse", l: "Analyse", i: "bar-chart" },
  { id: "meg", l: "Meg", i: "user" },
];
export interface IkonRailProps {
  aktiv?: string;
  navn?: string;
}
/* IkonRail — moderne smal sidenav (Anders 9. juli: ingen bred sidemeny).
   Mobbin-mønster: Fabric/Hootsuite-rail + Fey/Vapi-kommandopalett.
   Paper-fasit: navigation/Rail — 64px bred (var 60), item 48×44 med r=12
   (allerede riktig), mikro-label mono 9px (var 7.5, for smått til å lese).
   Fargen på skinnen (alltid mørk i Paper, uansett tema) er IKKE hentet inn —
   det er en fargebeslutning (utenfor scope), ikke geometri; skinnen følger
   fortsatt appens tema her. */
export function IkonRail({ aktiv, navn = "Øyvind Rohjan" }: IkonRailProps) {
  return (
    <div style={{ width: 64, flex: "none", borderRight: `1px solid ${TL.hair}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 14px", gap: 2 }}>
      <span style={{ width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, flex: "none" }}><LogoAK size={26} /></span>
      {NAV.map((n) => {
        const on = aktiv === n.id;
        return (
          <div key={n.id} title={n.l} className="v2-press v2-focus" tabIndex={0} style={{ width: 48, minHeight: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "8px 0 6px", borderRadius: 12, background: on ? "color-mix(in srgb, var(--tl-fill) 9%, transparent)" : "transparent", cursor: "pointer", position: "relative" }}>
            {on && <span style={{ position: "absolute", left: -7, top: 12, bottom: 12, width: 2, borderRadius: 2, background: TL.fill }} />}
            <Icon name={n.i} size={18} style={{ color: on ? TL.fill : TL.mute }} strokeWidth={on ? 2 : 1.5} />
            <span style={{ fontFamily: TL.font.mono, fontSize: 9, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: on ? TL.text : TL.mute }}>{n.l}</span>
          </div>
        );
      })}
      <div style={{ flex: 1 }} />
      <div title="Søk og hopp til · ⌘K" className="v2-press v2-focus" tabIndex={0} style={{ width: 34, height: 34, borderRadius: 10, background: TL.dock, border: `1px solid ${TL.hair}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 8 }}>
        <Icon name="search" size={15} style={{ color: TL.mute }} />
      </div>
      <AvatarFoto navn={navn} size={32} ring />
    </div>
  );
}
/* bakoverkompat — Skjerm bruker IkonRail */
export const Sidebar = IkonRail;
export interface BunnNavProps {
  aktiv?: string;
}
/* Paper-fasit: navigation/TabBar (.akhq-tab) — 44px berøringsmål per fane,
   gap 3, 10px/500 hvilende → 600 aktiv (var alltid 600). Bakgrunn/blur er en
   fargebeslutning (utenfor scope) og er ikke rørt her. */
export function BunnNav({ aktiv }: BunnNavProps) {
  return (
    <div style={{ flex: "none", display: "flex", justifyContent: "space-around", padding: "8px 8px 16px", borderTop: `1px solid ${TL.hair}`, background: `color-mix(in srgb,${TL.scene} 82%,transparent)`, backdropFilter: "blur(10px)" }}>
      {NAV.map((n) => {
        const on = aktiv === n.id;
        return (
          <div key={n.id} className="v2-press" style={{ flex: 1, minHeight: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "4px 0", borderRadius: TL.radius.row, color: on ? TL.fill : TL.mute }}>
            <Icon name={n.i} size={20} strokeWidth={on ? 2 : 1.5} /><span style={{ fontFamily: TL.font.mono, fontSize: 10, fontWeight: on ? 600 : 500 }}>{n.l}</span>
          </div>
        );
      })}
    </div>
  );
}
export interface SkjermProps {
  aktiv?: string;
  mobile?: boolean;
  children?: ReactNode;
}
/* Skjerm: desktop 1280 (sidebar + innhold maks 1120) eller mobil 390 (bunn-nav) */
export function Skjerm({ aktiv, mobile, children }: SkjermProps) {
  if (mobile) return (
    <div style={{ width: 390, minHeight: 800, background: TL.scene, borderRadius: 40, border: `1px solid ${TL.hair}`, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
      <AmbientBakgrunn />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 24px 5px", flex: "none", position: "relative" }}>
        <span style={{ fontFamily: TL.font.mono, fontSize: 12.5, fontWeight: 700, color: TL.text }}>9:41</span>
        <Icon name="activity" size={13} style={{ color: TL.text }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px 20px", position: "relative" }}>{children}</div>
      <BunnNav aktiv={aktiv} />
    </div>
  );
  return (
    /* Vignett (§12) + ambient profilbilde-glød (Spotify-idiomet) */
    <div style={{ width: 1280, background: TL.scene, borderRadius: 20, border: `1px solid ${TL.hair}`, overflow: "hidden", display: "flex", position: "relative" }}>
      <AmbientBakgrunn />
      <div style={{ position: "relative", display: "flex", width: "100%" }}>
        <Sidebar aktiv={aktiv} />
        <div style={{ flex: 1, minWidth: 0, padding: "28px 32px 36px" }}>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
