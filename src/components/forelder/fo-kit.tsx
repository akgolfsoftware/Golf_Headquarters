"use client";

/**
 * Forelder · FO-kit — Train-lock-primitivene for hele /forelder (PX-5).
 *
 * Fasit: designsystem/train-lock/FO-01 Forelder les.dc.html …
 * FO-10 Varsler.dc.html (+ FO-01L…FO-10L lys). Primitivene her er PORTING.md
 * §2-settet slik FO-filene tegner dem: caps-etikett 11/600/0.08em, h1 34/700/
 * -0.02em, kort = elev + radius 20, liste-rad med hairline, toggle 51×31,
 * avatar-initial på TL.avatar, primær 48px-pille (én per skjerm) og sekundær
 * 44px-pille med inset hairline. KUN TL-tokens — lys/mørk gjøres av
 * `html[data-v2-tema]`, aldri av varianter i komponentene (PORTING.md §1).
 */

import type { CSSProperties, ReactNode } from "react";
import { TL } from "@/lib/v2/train-lock";

/* ── Caps-etikett — 11/600/0.08em uppercase mute (FO-01 linje «Forelder · …») ── */
export function FoCaps({
  children,
  size = 11,
  color = TL.mute,
  style,
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        fontFamily: TL.font.sans,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Skjermhode — caps + h1 34/700 + undertekst 13 mute tabular ── */
export function FoHode({
  caps,
  tittel,
  under,
  badge,
}: {
  caps: string;
  tittel: string;
  under?: ReactNode;
  /** Valgfri 9px-caps-badge under tittelen (FO-01 «LESEVISNING»). */
  badge?: string;
}) {
  return (
    <div>
      <FoCaps>{caps}</FoCaps>
      <h1
        style={{
          margin: "6px 0 0",
          fontFamily: TL.font.sans,
          fontSize: 34,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
          color: TL.text,
        }}
      >
        {tittel}
      </h1>
      {badge && (
        <div style={{ marginTop: 4 }}>
          <span
            style={{
              fontFamily: TL.font.sans,
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: TL.mute,
              whiteSpace: "nowrap",
            }}
          >
            {badge}
          </span>
        </div>
      )}
      {under && (
        <div
          style={{
            marginTop: 6,
            fontFamily: TL.font.sans,
            fontSize: 13,
            color: TL.mute,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {under}
        </div>
      )}
    </div>
  );
}

/* ── Kort — elev-flate, radius 20 (rammeløst, FO-01/FO-02) ── */
export function FoKort({
  children,
  pad = "16px 18px",
  style,
  onClick,
}: {
  children: ReactNode;
  pad?: string;
  style?: CSSProperties;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: TL.elev,
        borderRadius: 20,
        padding: pad,
        ...(onClick ? { cursor: "pointer" } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Liste-rad — tittel 15/600, sub 13 mute tabular, hairline under (FO-01/05/10) ── */
export function FoRad({
  title,
  sub,
  right,
  last,
  muted,
  onClick,
}: {
  title: ReactNode;
  sub?: ReactNode;
  /** Høyre-slot: tall (13 mute tabular), hake eller caps-merke. */
  right?: ReactNode;
  last?: boolean;
  /** FO-03 «Tidligere»: hele raden i opacity 0.5 — aldri gråtone-erstatning. */
  muted?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 0",
        borderBottom: last ? "none" : `1px solid ${TL.hair}`,
        ...(muted ? { opacity: 0.5 } : null),
        ...(onClick ? { cursor: "pointer" } : null),
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: TL.font.sans,
            fontSize: 15,
            fontWeight: 600,
            color: TL.text,
          }}
        >
          {title}
        </div>
        {sub && (
          <div
            style={{
              marginTop: 2,
              fontFamily: TL.font.sans,
              fontSize: 13,
              color: TL.mute,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1.4,
            }}
          >
            {sub}
          </div>
        )}
      </div>
      {right}
    </div>
  );
}

/* ── Høyre-tall i rad — 13 mute tabular nowrap (FO-05/FO-10) ── */
export function FoRadTall({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        fontFamily: TL.font.sans,
        fontSize: 13,
        color: TL.mute,
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/* ── Warm fullført-hake 12×12 (FO-01) — aldri grønn ── */
export function FoHake({ size = 12 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={TL.warm}
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4.5 12.5 L10 18 L19.5 6.5" />
    </svg>
  );
}

/* ── Chevron 7×12 mute (FO-02/FO-03) ── */
export function FoChevron() {
  return (
    <svg
      width={7}
      height={12}
      viewBox="0 0 7 12"
      fill="none"
      stroke={TL.mute}
      strokeWidth={1.8}
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M1 1 L6 6 L1 11" />
    </svg>
  );
}

/* ── Avatar — initial på TL.avatar (uendret i begge tema), 38/40/44/48 ── */
export function FoAvatar({
  navn,
  size = 44,
}: {
  navn: string;
  size?: 38 | 40 | 44 | 48;
}) {
  const font = size >= 48 ? 20 : size >= 44 ? 18 : size >= 40 ? 17 : 16;
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: TL.avatar,
        color: TL.onAvatar,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: TL.font.sans,
        fontSize: font,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {(navn.trim()[0] ?? "?").toUpperCase()}
    </div>
  );
}

/* ── Toggle 51×31 — på: spor TL.text/knott TL.scene · av: spor TL.dim (FO-06/FO-08) ── */
export function FoToggle({
  on,
  onChange,
  label,
  disabled,
}: {
  on: boolean;
  onChange?: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!on)}
      style={{
        appearance: "none",
        border: "none",
        width: 51,
        height: 31,
        borderRadius: 999,
        background: on ? TL.text : TL.dim,
        padding: 2,
        display: "flex",
        justifyContent: on ? "flex-end" : "flex-start",
        flexShrink: 0,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <span
        style={{
          width: 27,
          height: 27,
          borderRadius: "50%",
          background: TL.scene,
        }}
      />
    </button>
  );
}

/* ── Primær CTA — 48px hvit/sort pille 16/700. ÉN per skjerm (FO-04/05/07) ── */
export function FoCtaPrimar({
  children,
  onClick,
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        appearance: "none",
        border: "none",
        width: "100%",
        height: 48,
        borderRadius: 999,
        background: TL.fill,
        color: TL.onFill,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: TL.font.sans,
        fontSize: 16,
        fontWeight: 700,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ── Sekundær — 44px pille, inset hairline, 15/600 mute (FO-04/06/08/10) ── */
export function FoCtaSekundar({
  children,
  onClick,
  disabled,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        appearance: "none",
        border: "none",
        width: "100%",
        height: 44,
        borderRadius: 999,
        background: "transparent",
        boxShadow: `inset 0 0 0 1px ${TL.hair}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: TL.font.sans,
        fontSize: 15,
        fontWeight: 600,
        color: TL.mute,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/* ── Fotnote — 12/1.6 mute (bunnteksten på hver FO-skjerm) ── */
export function FoFotnote({
  children,
  size = 12,
  style,
}: {
  children: ReactNode;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        fontFamily: TL.font.sans,
        fontSize: size,
        color: TL.mute,
        lineHeight: 1.6,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ── Bento-tallkort — caps + 34/700 tabular (FO-05/FO-09) ── */
export function FoTallKort({
  label,
  value,
  suffix,
}: {
  label: string;
  value: ReactNode;
  /** «av 5»-suffikset i 15/600 mute (FO-09 Oppmøte). */
  suffix?: string;
}) {
  return (
    <div style={{ background: TL.elev, borderRadius: 20, padding: "14px 16px" }}>
      <FoCaps>{label}</FoCaps>
      <div
        style={{
          marginTop: 6,
          fontFamily: TL.font.sans,
          fontSize: 34,
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          letterSpacing: "-0.02em",
          color: TL.text,
        }}
      >
        {value}
        {suffix && (
          <span style={{ fontSize: 15, fontWeight: 600, color: TL.mute }}>
            {" "}
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Skjerm-stack — kolonnen alle FO-skjermer lever i (innhold, ikke telefonramme) ── */
export function FoSkjerm({ children }: { children: ReactNode }) {
  return (
    <div
      data-fo-skjerm
      style={{
        maxWidth: 480,
        margin: "0 auto",
        width: "100%",
        fontVariantNumeric: "tabular-nums",
        paddingBottom: 24,
      }}
    >
      {children}
    </div>
  );
}

/* ── Tom-tilstand — sentrert kort (FO-09 «Ingen barn er koblet ennå») ── */
export function FoTom({
  tittel,
  sub,
}: {
  tittel: string;
  sub: string;
}) {
  return (
    <div
      style={{
        marginTop: 14,
        background: TL.elev,
        borderRadius: 20,
        padding: "28px 20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: TL.font.sans,
          fontSize: 17,
          fontWeight: 700,
          color: TL.text,
        }}
      >
        {tittel}
      </div>
      <div
        style={{
          marginTop: 6,
          fontFamily: TL.font.sans,
          fontSize: 13,
          color: TL.mute,
          lineHeight: 1.5,
        }}
      >
        {sub}
      </div>
    </div>
  );
}
