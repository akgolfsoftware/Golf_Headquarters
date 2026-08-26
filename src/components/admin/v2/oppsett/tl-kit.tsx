"use client";

/**
 * Train-lock — delt kit for AgencyOS Oppsett + Meg (T13, 26.08.2026).
 *
 * Samme rolle som `godkjenninger/tl-inspektor.tsx` (T3): et lite sett TL-
 * primitiver som gjenbrukes på tvers av flere skjermer i samme port-bølge,
 * slik at hver skjerm ikke oppfinner sin egen kort/rad/knapp på nytt.
 * Signaturene speiler `@/components/v2` (Caps/Tittel/Kort/TomTilstand/
 * CTAPill/TilbakeLenke/Rad) med vilje — de fleste settings-sidene som
 * portes i T13 hadde ingen egen fasit og brukte disse Paper-primitivene
 * direkte i page.tsx, så en nesten-drop-in-erstatning holder porten rask
 * og reduserer risiko for å endre logikk ved et uhell (CLAUDE.md §3
 * «Surgical Changes»).
 *
 * Tokens: KUN TL — CLAUDE.md invariant 2. Bland aldri T.* og TL.* i samme
 * skjerm. Geometri/type fra designsystem/train-lock/DESIGN-SYSTEM.md §2–3.
 */

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Icon } from "@/components/v2/icon";
import { TL } from "@/lib/v2/train-lock";
import { TlCaps } from "../godkjenninger/tl-inspektor";

export const TL_PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

/** Skjermtittel — 34/700/-0,02em (DESIGN-SYSTEM.md §3). */
export function TlTittel({ children, sub }: { children?: ReactNode; sub?: ReactNode }) {
  return (
    <div>
      <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text, lineHeight: 1.1 }}>{children}</h1>
      {sub && <div style={{ marginTop: 6, fontSize: 13, color: TL.mute }}>{sub}</div>}
    </div>
  );
}

export interface TlKortProps {
  eyebrow?: ReactNode;
  action?: ReactNode;
  children?: ReactNode;
  pad?: string;
  style?: CSSProperties;
}
/** Kort — elev-flate, radius-card, DESIGN-SYSTEM.md §2/§5. */
export function TlKort({ eyebrow, action, children, pad = "18px 20px", style }: TlKortProps) {
  return (
    <div
      style={{
        background: TL.elev,
        borderRadius: TL.radius.card,
        padding: pad,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {(eyebrow || action) && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 14 }}>
          {eyebrow ? <TlCaps>{eyebrow}</TlCaps> : <span />}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

/** Tom-tilstand — hel setning, aldri «Ingen data» (DESIGN-SYSTEM.md §7). */
export function TlTomTilstand({ icon = "circle", title, sub }: { icon?: string; title: ReactNode; sub?: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, textAlign: "center", padding: "34px 24px" }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 9999,
          background: TL.dock,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
        }}
      >
        <Icon name={icon} size={16} style={{ color: TL.mute }} />
      </span>
      <div>
        <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{title}</div>
        {sub && <p style={{ margin: "6px 0 0", fontSize: 13, color: TL.mute, lineHeight: 1.55, maxWidth: "44ch" }}>{sub}</p>}
      </div>
    </div>
  );
}

/** Knappe-matrise (DESIGN-SYSTEM.md §6): primær = hvit fyll, sekundær = dim, tertiær = hairline. */
function knappStil(variant: "primaer" | "sekundaer" | "tertiaer" | "fare", full?: boolean): CSSProperties {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: full ? "center" : undefined,
    gap: 8,
    height: 44,
    padding: "0 20px",
    borderRadius: TL.radius.pill,
    fontSize: TL.storrelse.kropp,
    fontWeight: TL.vekt.kropp,
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
    border: "none",
    width: full ? "100%" : undefined,
  };
  if (variant === "primaer") return { ...base, background: TL.fill, color: TL.onFill, fontWeight: TL.vekt.cta };
  if (variant === "fare") return { ...base, background: "transparent", color: TL.danger, boxShadow: `inset 0 0 0 1px ${TL.hair}` };
  if (variant === "tertiaer") return { ...base, background: "transparent", color: TL.mute, boxShadow: `inset 0 0 0 1px ${TL.hair}` };
  return { ...base, background: TL.dim, color: TL.text };
}

export interface TlKnappProps {
  icon?: string;
  children?: ReactNode;
  variant?: "primaer" | "sekundaer" | "tertiaer" | "fare";
  full?: boolean;
  disabled?: boolean;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  style?: CSSProperties;
}
export function TlKnapp({ icon, children, variant = "sekundaer", full, disabled, href, onClick, type = "button", style }: TlKnappProps) {
  const content = (
    <>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </>
  );
  const finalStyle = { ...knappStil(variant, full), opacity: disabled ? 0.55 : 1, ...style };
  if (href) {
    return (
      <Link href={href} className={TL_PRESS} style={finalStyle}>
        {content}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={TL_PRESS} style={finalStyle}>
      {content}
    </button>
  );
}

/** Tilbake-lenke — TL-variant av `@/components/v2` TilbakeLenke. */
export function TlTilbake({ href, children }: { href: string; children?: ReactNode }) {
  return (
    <Link href={href} className={TL_PRESS} style={{ ...knappStil("tertiaer"), textDecoration: "none" }}>
      <Icon name="arrow-left" size={14} />
      {children}
    </Link>
  );
}

export interface TlRadProps {
  title: ReactNode;
  sub?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  chevron?: boolean;
  last?: boolean;
  href?: string;
  onClick?: () => void;
}
/** Liste-rad — DESIGN-SYSTEM.md §5 «Liste-rad», hairline mellom rader. */
export function TlRad({ title, sub, meta, trailing, chevron = true, last, href, onClick }: TlRadProps) {
  const inner = (
    <>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: TL.text }}>{title}</div>
        {sub && <div style={{ marginTop: 2, fontSize: 13, color: TL.mute, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sub}</div>}
      </div>
      {meta && <span style={{ fontSize: 13, color: TL.mute, fontVariantNumeric: "tabular-nums", flex: "none" }}>{meta}</span>}
      {trailing}
      {chevron && (href || onClick) && <Icon name="chevron-right" size={16} style={{ color: TL.mute, flex: "none" }} />}
    </>
  );
  const rowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 14,
    padding: "15px 0",
    borderBottom: last ? "none" : `1px solid ${TL.hair}`,
    minWidth: 0,
    cursor: href || onClick ? "pointer" : undefined,
    textDecoration: "none",
    color: "inherit",
  };
  if (href) {
    return (
      <Link href={href} className={TL_PRESS} style={rowStyle}>
        {inner}
      </Link>
    );
  }
  return (
    <div onClick={onClick} className={onClick ? TL_PRESS : undefined} style={rowStyle}>
      {inner}
    </div>
  );
}

/** Radgruppe — elev-kort med rader (fasitens «rad-liste i kort»). */
export function TlRadGruppe({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ background: TL.elev, borderRadius: TL.radius.card, padding: "4px 20px", ...style }}>
      {children}
    </div>
  );
}

export { TlCaps, TlInspektorBlokk, TlInspektorKpi, TlInspektorLinje, TlInspektorpanel, TlInspektorTom } from "../godkjenninger/tl-inspektor";
export { MasterDetalj, useInspektorSynlig } from "@/components/v2/inspektorpanel";
