"use client";

/* AK Golf HQ v2 — KJERNEBIBLIOTEK (retning C «Presis», fase 4).
   Alle v2-skjermer komponeres av disse. Nye databehov → ny komponent HER
   (Anders' mandat 9. juli: skreddersy komponenter for dataene — aldri ad-hoc
   i skjermfiler). Port av ui_kits/v2/v2-core.jsx → produksjons-TSX (diff-null).
   Delt grunnstein: T/fmtSg (@/lib/v2/tokens), useCountUp/useMount/EASE/reduced
   (@/lib/v2/hooks), Icon (@/components/v2/icon). */

import type { CSSProperties, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { T, fmtSg, type AkseKey } from "@/lib/v2/tokens";
import { useCountUp, useMount, EASE, reduced } from "@/lib/v2/hooks";
import { Icon } from "@/components/v2/icon";
import { HjelpTips } from "@/components/v2/hjelp";
import type { HjelpNokkel } from "@/lib/v2/hjelpetekster";

/* Re-eksport av grunnstein-primitivene så søster-familier kan importere fra "./core"
   (samme overflate som mockupens window.V2). */
export { T, fmtSg } from "@/lib/v2/tokens";
export { useCountUp, useMount } from "@/lib/v2/hooks";

/* Interaksjonspolish injiseres én gang: press-scale + fokusring + hover-løft/rad. */
function ensureStyles(): void {
  if (typeof document === "undefined" || document.getElementById("v2-core-style")) return;
  const el = document.createElement("style");
  el.id = "v2-core-style";
  el.textContent =
    `.v2-press{transition:transform 180ms ${EASE};}` +
    `.v2-press:active{transform:scale(0.98);}` +
    `.v2-focus:focus-visible{outline:none;box-shadow:0 0 0 2px ${T.bg},0 0 0 3.5px color-mix(in srgb,${T.lime} 55%,transparent);}` +
    `.v2-row-h{transition:background 180ms ${EASE};}` +
    `.v2-row-h:hover{background:${T.panel2};}` +
    `.v2-kort-h:hover{transform:translateY(-2px);border-color:${T.borderS};}` +
    `@media (prefers-reduced-motion: reduce){.v2-press,.v2-press:active,.v2-kort-h:hover{transform:none;}}`;
  document.head.appendChild(el);
}
if (typeof document !== "undefined") ensureStyles();

/* ── Merkevare ────────────────────────────────────────── */
export interface LogoAKProps {
  size?: number;
  color?: string;
  style?: CSSProperties;
}
/* Ekte AK Golf-logo (baneform + lime-prikk). Banen følger color-prop/T.fg
   (cream på mørk), prikken er alltid lime — uavhengig av color-prop. */
export function LogoAK({ size = 26, color = T.fg, style }: LogoAKProps) {
  return (
    <svg width={size} height={Math.round((size * 470) / 538)} viewBox="0 0 538 470" fill="none" style={style} aria-label="AK Golf">
      <g transform="translate(0,470) scale(0.1,-0.1)">
        <path d="M3190 4486 c-23 -13 -109 -48 -585 -241 -99 -40 -198 -81 -220 -91 l-40 -18 45 -7 c127 -19 217 -102 271 -249 l24 -65 3 -1772 2 -1773 280 0 280 0 2 721 3 720 71 -83 c40 -46 132 -155 205 -243 73 -88 185 -221 249 -295 64 -74 152 -178 195 -230 44 -52 137 -162 209 -245 71 -82 167 -194 213 -247 l84 -98 355 0 c194 0 354 2 354 4 0 2 -73 89 -162 194 -90 104 -219 256 -288 337 -319 376 -552 649 -790 925 -59 69 -130 153 -158 187 -28 34 -56 64 -62 68 -5 3 -10 10 -10 14 0 7 90 83 221 186 42 33 163 130 270 215 107 86 223 178 259 206 378 292 550 427 550 430 0 2 -126 4 -279 4 l-280 0 -25 -82 c-25 -83 -102 -228 -159 -303 -108 -139 -178 -205 -502 -470 -87 -71 -189 -156 -225 -187 -100 -85 -293 -238 -297 -234 -2 1 -3 618 -3 1369 0 1297 -1 1367 -17 1367 -10 -1 -29 -7 -43 -14z M1200 3110 c-155 -15 -305 -58 -435 -123 -225 -112 -384 -275 -446 -457 -28 -82 -30 -194 -6 -267 25 -71 88 -139 162 -174 49 -24 73 -29 135 -29 62 0 85 5 135 29 75 36 116 79 150 155 35 80 41 138 21 214 -30 116 -119 209 -223 233 -29 7 -53 14 -53 16 0 3 13 23 29 47 60 86 146 146 260 180 68 20 222 21 313 2 254 -54 462 -285 542 -601 34 -138 47 -250 44 -380 l-3 -110 -95 -21 c-291 -66 -546 -127 -630 -149 -450 -122 -720 -290 -829 -517 -44 -91 -71 -205 -71 -296 0 -100 29 -241 65 -312 70 -140 152 -223 279 -285 98 -48 172 -66 302 -72 316 -16 613 107 885 365 l99 94 0 -191 0 -191 275 0 275 0 1 338 c0 185 0 618 -1 962 -1 576 -3 632 -21 720 -28 138 -55 216 -108 314 -111 207 -274 352 -496 437 -155 61 -371 87 -555 69z m630 -1846 l0 -486 -60 -56 c-91 -84 -157 -131 -235 -167 -265 -123 -559 -66 -692 134 -62 92 -78 148 -78 271 0 76 5 119 19 158 24 71 106 191 163 242 95 83 231 162 410 236 81 34 432 150 461 153 9 1 12 -102 12 -485z" fill={color}></path>
        <circle cx="4840" cy="3620" r="310" fill={T.lime}></circle>
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
export function Caps({ size = 10, color = T.mut, children, style }: CapsProps) {
  return <span style={{ fontFamily: T.mono, fontSize: size, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color, display: "block", ...style }}>{children}</span>;
}
export interface TittelProps {
  children?: ReactNode;
  mobile?: boolean;
  em?: string;
}
/* skjermtittel m/ valgfri kursiv lime-aksent */
export function Tittel({ children, mobile, em }: TittelProps) {
  return <h1 style={{ fontFamily: T.disp, fontWeight: 700, fontSize: mobile ? 30 : 36, letterSpacing: "-0.03em", color: T.fg, margin: 0, lineHeight: 1.04 }}>{children}{em && <> <em style={{ fontStyle: "italic", color: T.lime }}>{em}</em></>}</h1>;
}

/* ── Chips + status ───────────────────────────────────── */
export interface DeltaChipProps {
  v: string;
  dir?: "up" | "down";
}
export function DeltaChip({ v, dir }: DeltaChipProps) {
  const c = dir === "down" ? T.down : T.up;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: c, background: `color-mix(in srgb,${c} 13%,transparent)`, borderRadius: 5, padding: "3px 6px", whiteSpace: "nowrap" }}><Icon name={dir === "down" ? "trending-down" : "trending-up"} size={10} />{v}</span>;
}

export type StatusTone = "lime" | "up" | "warn" | "down" | "info";
export interface StatusPillProps {
  children?: ReactNode;
  tone?: StatusTone;
}
/* ● STIGENDE · LIVE · NÅ */
export function StatusPill({ children, tone = "lime" }: StatusPillProps) {
  const c: string = { lime: T.lime, up: T.up, warn: T.warn, down: T.down, info: T.info }[tone];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: T.mono, fontSize: 9, fontWeight: 700, letterSpacing: "0.06em", color: c, background: `color-mix(in srgb,${c} 10%,transparent)`, borderRadius: 9999, padding: "4px 9px", textTransform: "uppercase" }}><span style={{ width: 5, height: 5, borderRadius: 9999, background: c }} />{children}</span>;
}

export type SevKey = "sterk" | "medium" | "lav" | "ok";
export interface SevChipProps {
  s: SevKey;
}
/* alvorlighet i kø-rader — klarspråk, aldri sperre-språk */
export function SevChip({ s }: SevChipProps) {
  const map: Record<string, { c: string; l: string }> = {
    sterk: { c: T.down, l: "Sterkt avvik" },
    medium: { c: T.warn, l: "Venter" },
    lav: { c: T.info, l: "Spørsmål" },
    ok: { c: T.up, l: "I rute" },
  };
  const m = map[s] || map.lav;
  return <span style={{ fontFamily: T.mono, fontSize: 8.5, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: m.c, background: `color-mix(in srgb,${m.c} 12%,transparent)`, borderRadius: 5, padding: "3px 7px", whiteSpace: "nowrap" }}>{m.l}</span>;
}

/* Aksenavn i klarspråk — display only, datanøklene (FYS/TEK/SLAG/SPILL/TURN) er uendret. */
export const AKSE_NAVN: Record<AkseKey, string> = { FYS: "Fysisk", TEK: "Teknikk", SLAG: "Slag", SPILL: "Spill", TURN: "Turnering" };

export interface AkseChipProps {
  a: AkseKey;
}
/* Fysisk/Teknikk/Slag/Spill/Turnering m/ kategorifarge-prikk (sentence-case, ingen uppercase) */
export function AkseChip({ a }: AkseChipProps) {
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.fg2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 5, padding: "3px 7px" }}><span style={{ width: 6, height: 6, borderRadius: 9999, background: T.ax[a] || T.mut }} />{AKSE_NAVN[a] || a}</span>;
}

export interface MikroMetaProps {
  icon: string;
  children?: ReactNode;
}
/* Liten mono-meta: ikon + tekst (sted, serie/gjentakelse osv.). */
export function MikroMeta({ icon, children }: MikroMetaProps) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: T.mono, fontSize: 9, fontWeight: 700, color: T.mut }}>
      <Icon name={icon} size={10} style={{ color: T.mut }} />{children}
    </span>
  );
}

/* ── Flater ───────────────────────────────────────────── */
/* Dybdesystem (kvalitetsplan §12): innvendig topp-highlight + myk stor skygge —
   kortene skal føles lagdelt på mørk flate, aldri flate rektangler. */
const DYBDE = "inset 0 1px 0 rgba(255,255,255,0.045), 0 12px 32px rgba(0,0,0,0.35)";
export interface KortProps {
  tint?: boolean;
  eyebrow?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  pad?: string;
  hover?: boolean;
  style?: CSSProperties;
}
export function Kort({ tint, eyebrow, action, children, pad = "18px 20px", hover, style }: KortProps) {
  return (
    <div className={hover ? "v2-kort-h" : undefined} style={{ background: tint ? `${T.tint}, ${T.panel}` : T.panel, border: `1px solid ${T.border}`, borderRadius: T.rCard, padding: pad, minWidth: 0, display: "flex", flexDirection: "column", boxShadow: DYBDE, transition: `transform 180ms ${EASE}, border-color 180ms ${EASE}`, ...(hover ? { cursor: "pointer" } : null), ...style }}>
      {(eyebrow || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
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
  value: number | string;
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
  const shown = useCountUp(value);
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
        <span style={{ fontFamily: T.mono, fontSize: size, fontWeight: 700, color: accent ? T.lime : T.fg, lineHeight: 0.9, letterSpacing: "-0.03em", fontVariantNumeric: "tabular-nums" }}>{shown}</span>
        {unit && <span style={{ fontFamily: T.mono, fontSize: Math.round(size * 0.3), color: T.mut }}>{unit}</span>}
        {delta && <DeltaChip v={delta} dir={dir} />}
      </div>
      {sub && <span style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, display: "block", marginTop: 10 }}>{sub}</span>}
    </div>
  );
}
export interface KpiFlisProps {
  label?: ReactNode;
  value: number | string;
  delta?: string;
  dir?: "up" | "down";
  tint?: boolean;
  varsle?: boolean;
  hjelp?: HjelpNokkel;
  /** Dropp tell-opp-fra-0-animasjonen. Bruk for absolutte tall der 0 aldri er en
   *  reell mellomverdi (f.eks. golf-brutto­score) — ellers vises en umulig verdi
   *  i overgangen (0 → mål) i de første rammene etter montering. */
  instant?: boolean;
}
export function KpiFlis({ label, value, delta, dir, tint, varsle, hjelp, instant }: KpiFlisProps) {
  const animert = useCountUp(value);
  const shown = instant ? String(value) : animert;
  return (
    <Kort tint={tint || varsle}>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <Caps size={9}>{label}</Caps>
        {hjelp && <HjelpTips k={hjelp} size={11} />}
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 12, flexWrap: "wrap", minWidth: 0 }}>
        <span style={{ fontFamily: T.mono, fontSize: 38, fontWeight: 700, color: T.fg, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>{shown}</span>
        {delta && <DeltaChip v={delta} dir={dir} />}
      </div>
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
            <button key={t.id} className="v2-press v2-focus" onClick={() => onChange && onChange(t.id)} style={{ appearance: "none", cursor: "pointer", fontFamily: T.ui, fontSize: 13, fontWeight: 600, padding: "8px 15px", borderRadius: 9999, color: on ? T.onLime : T.fg2, background: on ? T.lime : T.panel2, border: `1px solid ${on ? "transparent" : T.border}`, whiteSpace: "nowrap" }}>{t.l}</button>
          );
        })}
      </div>
      {overflow && (
        <Icon name="chevron-right" size={12} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(calc(-50% - 1px))", color: T.mut, pointerEvents: "none" }} />
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
/* periodevelger — aktiv = lys pille */
export function PillVelger({ options, value, onChange }: PillVelgerProps) {
  return (
    <div style={{ display: "flex", gap: 2, background: T.panel2, border: `1px solid ${T.border}`, borderRadius: 9999, padding: 3, width: "fit-content" }}>
      {options.map((o) => {
        const on = value === o.v;
        return (
          <button key={o.v} className="v2-press v2-focus" onClick={() => onChange && onChange(o.v)} style={{ appearance: "none", cursor: "pointer", fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, padding: "6px 13px", borderRadius: 9999, color: on ? T.bg : T.fg2, background: on ? T.fg : "transparent", border: "none", whiteSpace: "nowrap" }}>{o.l}</button>
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
   Mørk chip-stil (audit 2026-07-12): umarkert = T.panel3 + border (som badges/chips ellers
   i appen), valgt = lime m/ T.onLime — aldri lyse piller på mørk flate. */
export function FilterChips({ items, active = [], onToggle, axis }: FilterChipsProps) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {items.map((x, i) => {
        const on = active.indexOf(x) !== -1;
        return (
          <button key={i} className="v2-press v2-focus" onClick={() => onToggle && onToggle(x)} style={{ appearance: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, height: 30, padding: "0 12px", borderRadius: 9999, background: on ? T.lime : T.panel3, border: `1px solid ${on ? "transparent" : T.borderS}`, color: on ? T.onLime : T.fg, fontFamily: T.ui, fontSize: 12.5, fontWeight: on ? 600 : 500 }}>
            {on && <Icon name="check" size={12} />}
            {axis && T.ax[x as AkseKey] && <span style={{ width: 7, height: 7, borderRadius: 9999, background: T.ax[x as AkseKey] }} />}
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
}
export function CTAPill({ icon, children, ghost, full }: CTAPillProps) {
  return (
    <span className="v2-press v2-focus" tabIndex={0} role="button" style={{ display: "inline-flex", alignItems: "center", justifyContent: full ? "center" : undefined, gap: 8, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: ghost ? T.fg : T.onLime, background: ghost ? T.panel3 : T.lime, border: ghost ? `1px solid ${T.borderS}` : "none", borderRadius: 9999, padding: "9px 16px", cursor: "pointer", width: full ? "100%" : undefined }}>
      {icon && <Icon name={icon} size={14} />}{children}
    </span>
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
  onClick?: () => void;
  /** "submit" for skjema-knapper — default "button". */
  type?: "button" | "submit";
  /** Stil-overstyring (f.eks. minHeight: 44 for touch-mål). */
  style?: CSSProperties;
}
/* Interaktiv CTA-pille (ekte <button>): onClick + full-bredde + disabled.
   CTAPill er den statiske varianten; Knapp brukes i flerstegs-flyter. */
export function Knapp({ icon, children, ghost, full, disabled, onClick, type = "button", style }: KnappProps) {
  return (
    <button
      type={type}
      className="v2-press v2-focus"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{ appearance: "none", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: T.ui, fontSize: 12.5, fontWeight: 600, color: ghost ? T.fg : T.onLime, background: ghost ? T.panel3 : T.lime, border: ghost ? `1px solid ${T.borderS}` : "1px solid transparent", borderRadius: 9999, padding: "10px 18px", cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1, width: full ? "100%" : "auto", ...style }}
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
export function AvatarInit({ navn, size = 30 }: AvatarInitProps) {
  return <span style={{ width: size, height: size, borderRadius: 9999, background: T.panel3, border: `1px solid ${T.border}`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: size * 0.33, fontWeight: 700, color: T.fg2, flex: "none" }}>{navn.split(" ").map((x) => x[0]).join("").slice(0, 2)}</span>;
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
    <span style={{ width: size, height: size, borderRadius: 9999, overflow: "hidden", flex: "none", display: "inline-block", border: `1px solid ${T.borderS}`, boxShadow: ring ? `0 0 0 2px ${T.bg}, 0 0 0 3.5px color-mix(in srgb,${T.lime} 55%,transparent)` : "none" }}>
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
        maskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 55%, transparent 90%)",
        WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0.5) 55%, transparent 90%)" }} />
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
    <div onClick={onClick} className={onClick ? "v2-row-h" : undefined} style={{ display: "flex", alignItems: "center", gap: 12, padding: onClick ? "11px 10px" : "11px 0", margin: onClick ? "0 -10px" : 0, borderRadius: onClick ? 10 : 0, borderBottom: last ? "none" : `1px solid ${T.border}`, cursor: onClick ? "pointer" : "default" }}>
      {leading}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: T.ui, fontSize: 13.5, fontWeight: 600, color: T.fg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
        {sub && <div style={{ fontFamily: T.ui, fontSize: 11.5, color: T.mut, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sub}</div>}
      </div>
      {meta}
      {naa && <StatusPill>Nå</StatusPill>}
      {trailing !== null && (trailing || <Icon name="chevron-right" size={14} style={{ color: T.mut }} />)}
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
    <div style={{ display: "flex", alignItems: "center", gap: 11, paddingBottom: 5, borderBottom: `1px solid ${T.border}` }}>
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
}
/* signal=true → opp/ned-DATA (SG o.l.): positiv grønn / negativ rød (aldri lime på data).
   Uten signal → MENGDE/andel: lime-fyll (aksent, ikke signal). */
export function FordelingRad({ code, label, pct, value, neg, signal, kol2, last }: FordelingRadProps) {
  const grown = useMount();
  const fyll = signal ? (neg ? T.down : T.up) : (neg ? T.down : T.lime);
  const valgFg = signal ? (neg ? T.down : T.up) : (neg ? T.down : T.fg);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      {code && <span style={{ width: 40, fontFamily: T.mono, fontSize: 10, fontWeight: 700, color: T.fg2, flex: "none" }}>{code}</span>}
      {label && <span style={{ width: 110, flex: "none", fontFamily: T.ui, fontSize: 13, color: T.fg2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{label}</span>}
      <div style={{ flex: 1, height: 7, borderRadius: 9999, background: T.track, overflow: "hidden" }}>
        <div style={{ width: (grown ? Math.max(3, Math.min(100, pct)) : 0) + "%", height: "100%", background: fyll, opacity: (neg || signal) ? 1 : 0.9, borderRadius: 9999, transition: `width 500ms ${EASE}` }} />
      </div>
      {typeof pct === "number" && <span style={{ width: 36, flex: "none", textAlign: "right", fontFamily: T.mono, fontSize: 12, fontWeight: 700, color: T.fg2, fontVariantNumeric: "tabular-nums" }}>{Math.round(pct)}%</span>}
      <span style={{ width: kol2 ? 84 : 48, flex: "none", textAlign: "right", fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: valgFg, fontVariantNumeric: "tabular-nums" }}>{value}</span>
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
    <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "9px 0", borderBottom: last ? "none" : `1px solid ${T.border}` }}>
      <span style={{ width: 64, fontFamily: T.ui, fontSize: 11.5, fontWeight: 600, color: T.fg2, flex: "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{AKSE_NAVN[a] || a}</span>
      <div style={{ flex: 1, height: 7, borderRadius: 9999, background: T.track, position: "relative" }}>
        <div style={{ width: (grown ? Math.min(100, (v / max) * 100) : 0) + "%", height: "100%", background: T.ax[a] || T.lime, opacity: 0.85, borderRadius: 9999, transition: `width 500ms ${EASE}` }} />
        <span style={{ position: "absolute", left: Math.min(100, (m / max) * 100) + "%", top: -3, width: 2, height: 13, background: T.fg, borderRadius: 1 }} />
      </div>
      <span style={{ fontFamily: T.mono, fontSize: 11, color: T.fg2, width: 60, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{v}<span style={{ color: T.mut }}>/{m} {enhet}</span></span>
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
export function Prikker({ n = 84, hits, on = T.lime, cols = 28 }: PrikkerProps) {
  const seed = hits || [3, 7, 9, 12, 16, 17, 22, 26, 28, 31, 36, 38, 43, 45, 50, 52, 57, 61, 64, 68, 71, 75, 78, 82];
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 3 }}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: 9999, background: seed.indexOf(i) !== -1 ? on : "rgba(255,255,255,0.10)" }} />
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
      <div style={{ position: "relative", height: 8, borderRadius: 9999, background: T.nivaGrad }}>
        <span style={{ position: "absolute", left: (grown ? pct : 0) + "%", top: -4, width: 16, height: 16, borderRadius: 9999, background: T.lime, border: `2px solid ${T.panel}`, transform: "translateX(-8px)", transition: `left 500ms ${EASE}` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {stops.map((s) => <span key={s} style={{ fontFamily: T.mono, fontSize: 8.5, color: T.mut }}>{s}</span>)}
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
          <stop offset="0%" stopColor={T.lime} stopOpacity="0.22" />
          <stop offset="100%" stopColor={T.lime} stopOpacity="0" />
        </linearGradient>
        <filter id={gid + "g"} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      {grid.map((v, i) => (
        <g key={i}>
          <line x1={PADL} x2={W_ - PADR} y1={Y(v)} y2={Y(v)} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <text x={PADL - 7} y={Y(v) + 3} textAnchor="end" fontFamily='"JetBrains Mono",monospace' fontSize="8.5" fill={T.mut}>{f(v)}</text>
        </g>
      ))}
      {baseline != null && baseline >= lo && baseline <= hi && (
        <line x1={PADL} x2={W_ - PADR} y1={Y(baseline)} y2={Y(baseline)} stroke="rgba(255,255,255,0.16)" strokeWidth="1" strokeDasharray="3 4" />
      )}
      <polygon points={omr} fill={`url(#${gid})`} style={{ opacity: drawn ? 1 : 0, transition: `opacity 700ms ${EASE}` }} />
      <polyline ref={lineRef} points={pts} fill="none" stroke={T.lime} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" filter={`url(#${gid + "g"})`}
        style={len ? { strokeDasharray: len, strokeDashoffset: drawn ? 0 : len, transition: `stroke-dashoffset 700ms ${EASE}` } : undefined} />
      <circle cx={sisteX} cy={sisteY} r="7" fill={T.lime} opacity="0.18" />
      <circle cx={sisteX} cy={sisteY} r="3.2" fill={T.lime} stroke={T.panel} strokeWidth="1.5" />
      {xLabels && xLabels.map((l, i) => (
        <text key={i} x={PADL + (i / (xLabels.length - 1)) * iw} y={height - 4} textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"} fontFamily='"JetBrains Mono",monospace' fontSize="8" fill={T.mut} letterSpacing="0.08em">{l}</text>
      ))}
    </svg>
  );
}
export interface InnsiktChipProps {
  children?: ReactNode;
  cta?: ReactNode;
}
/* AI-innsikt — stille, aldri ropende */
export function InnsiktChip({ children, cta }: InnsiktChipProps) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12, background: T.panel2, border: `1px solid ${T.border}` }}>
      <Icon name="sparkles" size={13} style={{ color: T.lime, flex: "none", marginTop: 1 }} />
      <span style={{ fontFamily: T.ui, fontSize: 12, color: T.fg2, lineHeight: 1.5 }}>{children}{cta && <> <span style={{ color: T.lime, fontWeight: 600 }}>{cta} →</span></>}</span>
    </div>
  );
}
export interface TomTilstandProps {
  icon?: string;
  title?: ReactNode;
  sub?: ReactNode;
}
export function TomTilstand({ icon = "circle", title, sub }: TomTilstandProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center", padding: "26px 16px" }}>
      <span style={{ width: 44, height: 44, borderRadius: 14, background: T.panel2, border: `1px dashed ${T.borderS}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Icon name={icon} size={19} style={{ color: T.mut }} /></span>
      <div>
        <div style={{ fontFamily: T.disp, fontWeight: 700, fontSize: 15, color: T.fg }}>{title}</div>
        {sub && <p style={{ fontFamily: T.ui, fontSize: 12, color: T.mut, lineHeight: 1.6, margin: "6px 0 0" }}>{sub}</p>}
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
   60px ikon-rail m/ mikro-labels, lime-indikator, ⌘K nederst + avatar.
   Mobbin-mønster: Fabric/Hootsuite-rail + Fey/Vapi-kommandopalett. */
export function IkonRail({ aktiv, navn = "Øyvind Rohjan" }: IkonRailProps) {
  return (
    <div style={{ width: 60, flex: "none", borderRight: `1px solid ${T.border}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0 14px", gap: 2 }}>
      <LogoAK size={26} style={{ marginBottom: 16 }} />
      {NAV.map((n) => {
        const on = aktiv === n.id;
        return (
          <div key={n.id} title={n.l} className="v2-press v2-focus" tabIndex={0} style={{ width: 46, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0 6px", borderRadius: 12, background: on ? "color-mix(in srgb, var(--v2-lime) 9%, transparent)" : "transparent", cursor: "pointer", position: "relative" }}>
            {on && <span style={{ position: "absolute", left: -7, top: 12, bottom: 12, width: 2, borderRadius: 2, background: T.lime }} />}
            <Icon name={n.i} size={18} style={{ color: on ? T.lime : T.mut }} strokeWidth={on ? 2 : 1.5} />
            <span style={{ fontFamily: T.mono, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: on ? T.fg : T.mut }}>{n.l}</span>
          </div>
        );
      })}
      <div style={{ flex: 1 }} />
      <div title="Søk og hopp til · ⌘K" className="v2-press v2-focus" tabIndex={0} style={{ width: 34, height: 34, borderRadius: 10, background: T.panel2, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginBottom: 8 }}>
        <Icon name="search" size={15} style={{ color: T.fg2 }} />
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
export function BunnNav({ aktiv }: BunnNavProps) {
  return (
    <div style={{ flex: "none", display: "flex", justifyContent: "space-around", padding: "8px 8px 16px", borderTop: `1px solid ${T.border}`, background: `color-mix(in srgb,${T.bg} 82%,transparent)`, backdropFilter: "blur(10px)" }}>
      {NAV.map((n) => {
        const on = aktiv === n.id;
        return (
          <div key={n.id} className="v2-press" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, padding: "4px 0", color: on ? T.lime : T.mut }}>
            <Icon name={n.i} size={20} strokeWidth={on ? 2 : 1.5} /><span style={{ fontFamily: T.mono, fontSize: 9, fontWeight: 600 }}>{n.l}</span>
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
    <div style={{ width: 390, minHeight: 800, background: T.bg, borderRadius: 40, border: `1px solid ${T.borderS}`, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative" }}>
      <AmbientBakgrunn />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 24px 5px", flex: "none", position: "relative" }}>
        <span style={{ fontFamily: T.mono, fontSize: 12.5, fontWeight: 700, color: T.fg }}>9:41</span>
        <Icon name="activity" size={13} style={{ color: T.fg }} />
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px 20px", position: "relative" }}>{children}</div>
      <BunnNav aktiv={aktiv} />
    </div>
  );
  return (
    /* Vignett (§12) + ambient profilbilde-glød (Spotify-idiomet) */
    <div style={{ width: 1280, background: `radial-gradient(1100px 460px at 24% -8%, rgba(0,88,64,0.16), transparent 62%), ${T.bg}`, borderRadius: 20, border: `1px solid ${T.borderS}`, overflow: "hidden", display: "flex", position: "relative" }}>
      <AmbientBakgrunn />
      <div style={{ position: "relative", display: "flex", width: "100%" }}>
        <Sidebar aktiv={aktiv} />
        <div style={{ flex: 1, minWidth: 0, padding: "28px 32px 36px" }}>
          <div style={{ maxWidth: T.maxw, margin: "0 auto", display: "flex", flexDirection: "column", gap: T.gap }}>{children}</div>
        </div>
      </div>
    </div>
  );
}
