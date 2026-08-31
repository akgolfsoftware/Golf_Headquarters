"use client";

/**
 * Train-lock-primitiver for AgenticOS (T12 visuell, AO-00/01).
 * Tokens: KUN TL. Ok-grønn brukes ikke her.
 */

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { TL } from "@/lib/v2/train-lock";

export const AO_PRESS =
  "motion-safe:transition-transform motion-safe:duration-[180ms] motion-safe:ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97]";

export function AoCaps({
  children,
  color,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: color ?? TL.mute,
      }}
    >
      {children}
    </span>
  );
}

export function AoTittel({ children, size = 22 }: { children: ReactNode; size?: number }) {
  return (
    <h1
      style={{
        margin: 0,
        fontSize: size,
        fontWeight: 700,
        letterSpacing: "-0.02em",
        color: TL.text,
        lineHeight: 1.15,
      }}
    >
      {children}
    </h1>
  );
}

export function AoKort({
  children,
  pad = "20px 22px",
  radius = 18,
  hair,
  style,
}: {
  children: ReactNode;
  pad?: string;
  radius?: number;
  hair?: boolean;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        background: hair ? "transparent" : TL.elev,
        borderRadius: radius,
        padding: pad,
        boxShadow: hair ? `inset 0 0 0 1px ${TL.hair}` : undefined,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * `dim` her er fasitens SEKUNDÆR (hairline-ring, mute tekst) — navnet er en
 * historisk uheldig kollisjon med `TL.dim`-tokenet, ikke det samme. Fasitens
 * TERTIÆR (dim-flate, `TL.text`) er egen variant: `tertiaer`.
 */
type AoKnappVariant = "primaer" | "dim" | "tertiaer" | "lenke";

/**
 * `full`: AO-01 Cockpit 393 / AO-12g Godkjenn 393 bruker en 44px
 * full-bredde-CTA på telefon, som blir fasitens 40px auto-bredde-pille fra
 * Mac-railens brekkpunkt (1101 — samme grense som AgenticosSkall bruker for
 * rail vs. mobil-piller). Høyde/bredde styres da av Tailwind, ikke inline,
 * så CSS-media-spørringen faktisk virker.
 */
const AO_FULL_CLASS = "w-full h-11 justify-center min-[1101px]:w-auto min-[1101px]:h-10";

function knappStil(variant: AoKnappVariant, full?: boolean): CSSProperties {
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    padding: variant === "primaer" ? "0 20px" : "0 16px",
    borderRadius: 999,
    fontSize: variant === "lenke" ? 12 : 14,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
    textDecoration: "none",
    border: "none",
    background: "transparent",
  };
  if (!full) {
    base.height = 40;
    base.minHeight = 40;
  }
  if (variant === "primaer") return { ...base, background: TL.fill, color: TL.onFill };
  if (variant === "lenke") return { ...base, height: "auto", minHeight: 0, padding: 0, color: TL.viz.target };
  if (variant === "tertiaer") return { ...base, background: TL.dim, color: TL.text };
  return { ...base, color: TL.mute, boxShadow: `inset 0 0 0 1px ${TL.hair}` };
}

export function AoKnapp({
  children,
  variant = "dim",
  href,
  onClick,
  disabled,
  full,
  type = "button",
}: {
  children: ReactNode;
  variant?: AoKnappVariant;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  full?: boolean;
  type?: "button" | "submit";
}) {
  const style = { ...knappStil(variant, full), opacity: disabled ? 0.55 : 1 };
  const className = full ? `${AO_PRESS} ${AO_FULL_CLASS}` : AO_PRESS;
  if (href && !disabled) {
    return (
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={className} style={style}>
      {children}
    </button>
  );
}

export function AoPrikk({ color, title }: { color: string; title?: string }) {
  return (
    <span
      title={title}
      aria-hidden
      style={{ width: 7, height: 7, borderRadius: "50%", background: color, flex: "none" }}
    />
  );
}

export function AoToggle({ paa }: { paa: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        width: 40,
        height: 24,
        borderRadius: 999,
        background: paa ? TL.fill : "transparent",
        boxShadow: paa ? undefined : `inset 0 0 0 1px ${TL.hair}`,
        display: "flex",
        alignItems: "center",
        justifyContent: paa ? "flex-end" : "flex-start",
        padding: 2,
        flex: "none",
      }}
    >
      <span
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: paa ? TL.onFill : TL.mute,
        }}
      />
    </span>
  );
}

export function AoWarmHake() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 13 L10 18 L19 7"
        stroke={TL.warm}
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AoTom({
  tittel,
  tekst,
  cta,
}: {
  tittel: string;
  tekst: string;
  cta?: ReactNode;
}) {
  return (
    <div
      data-screen-label="AO-11 tom ko"
      style={{
        padding: "44px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 10,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text }}>{tittel}</div>
      <p style={{ margin: 0, fontSize: 13, color: TL.mute, lineHeight: 1.6, maxWidth: 360 }}>{tekst}</p>
      {cta ? <div style={{ marginTop: 8 }}>{cta}</div> : null}
    </div>
  );
}

/**
 * AO-11 «Runtime nede». I fasiten er dette en egen, eksklusiv skjerm — der
 * har `primaer` lov til å være hvit. Overalt i denne appen vises kortet
 * derimot som et varselbanner ØVERST på en skjerm som kan ha sin egen hvite
 * primær lenger ned (Cockpits Kjør/Godkjenn, Run-detaljs Godkjenn resultat).
 * Send derfor `primaer` inn med `AoKnapp`s default (hairline) variant når
 * skjermen har en annen primær — kun når dette kortet er skjermens ENESTE
 * handling skal `primaer` få `variant="primaer"` — ellers ender skjermen med
 * to hvite knapper, som bryter regelen «én hvit primær per skjerm».
 */
export function AoFeilKort({
  tittel,
  tekst,
  primaer,
  sekundaer,
}: {
  tittel: string;
  tekst: string;
  primaer?: ReactNode;
  sekundaer?: ReactNode;
}) {
  return (
    <div
      data-screen-label="AO-11 runtime nede"
      style={{
        background: TL.dock,
        borderRadius: 22,
        boxShadow: `inset 0 0 0 1px ${TL.hair}`,
        padding: "24px 26px 22px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <AoPrikk color={TL.danger} />
        <AoCaps>Runtime nede</AoCaps>
      </div>
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em", color: TL.text }}>{tittel}</div>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: TL.mute, lineHeight: 1.55 }}>{tekst}</p>
      </div>
      {(primaer || sekundaer) && (
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {primaer}
          {sekundaer}
        </div>
      )}
    </div>
  );
}

export function AoRad({
  children,
  last,
}: {
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 0",
        borderTop: `1px solid ${TL.hair}`,
        borderBottom: last ? `1px solid ${TL.hair}` : undefined,
        minWidth: 0,
      }}
    >
      {children}
    </div>
  );
}
