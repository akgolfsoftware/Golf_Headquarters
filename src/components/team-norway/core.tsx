"use client";

import Image from "next/image";
import { useId, type ComponentProps, type CSSProperties, type ReactNode } from "react";
import { TN } from "@/lib/v2/team-norway";
import styles from "./tn-kontroller.module.css";
import type { TnIkonNavn } from "./tn-ikon";
import teamNorwayLogo from "../../../designsystem/team-norway/assets/logo/team-norway-golf.png";
import teamNorwayLogoHvit from "../../../designsystem/team-norway/assets/logo/team-norway-golf-knockout-white.png";

/**
 * Team Norway — delte primitiver. Fasit: docs/design-system/utkast-tn/felles/tn.css
 * (pakke 1 grunnmur, 14.10.2026). Bruker KUN TN.* (aldri AK-, Train-lock- eller
 * Precision-tokens). Retning «Skrå» (19.10.2026): myke kort med navy-skygge,
 * pilleformede merker og knapper, runde avatarer.
 * Skallet (sidemeny, topplinje, bunnmeny) bor i tn-shell.tsx og rail-mobil.tsx.
 * Avvik:
 *   - Formene følger retning «Skrå» (docs/design-system/utkast-tn/nye-veier.html,
 *     19.10.2026), ikke de kantete flatene i felles/tn.css.
 */

// ───────────────────────── Kort ─────────────────────────

/**
 * Den offisielle Team Norway-logoen. Merket gjenskapes aldri med tekst eller
 * CSS. På mørk flate brukes knockout-utgaven direkte — ingen hvit plate bak
 * merket (Anders 22.09.2026: ingen hvite flater eller streker i skinnen).
 */
export function TnLogo({
  hoyde = 32,
  prioritet = false,
  paaMork = false,
}: {
  hoyde?: number;
  prioritet?: boolean;
  paaMork?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: Math.max(44, hoyde + 16),
        padding: paaMork ? 0 : "8px 10px",
        borderRadius: TN.radius.sm,
        background: paaMork ? "transparent" : TN.white,
      }}
    >
      <Image
        src={paaMork ? teamNorwayLogoHvit : teamNorwayLogo}
        alt="Team Norway Golf"
        priority={prioritet}
        style={{ width: "auto", height: hoyde, objectFit: "contain" }}
      />
    </span>
  );
}

export function TnKort({
  children,
  style,
  padding = 18,
}: {
  children: ReactNode;
  style?: CSSProperties;
  padding?: number;
}) {
  return (
    <div
      style={{
        background: TN.surfaceCard,
        borderRadius: TN.radius.xl,
        boxShadow: TN.shadow.md,
        padding,
        fontFamily: TN.font.body,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ───────────────────────── Pille (status/merke) ─────────────────────────

export type TnPilleTone = "navy" | "green" | "amber" | "red" | "info" | "nøytral" | "invers";

/** Merke: pille 24 px med rund prikk. Grønt, gult og rødt er bare status. */
const PILLE_TONE: Record<TnPilleTone, { bg: string; fg: string; prikk: string }> = {
  navy: { bg: TN.status.infoBg, fg: TN.status.infoText, prikk: TN.navy600 },
  green: { bg: TN.status.greenBg, fg: TN.status.greenText, prikk: TN.status.green },
  amber: { bg: TN.status.amberBg, fg: TN.status.amberText, prikk: TN.status.amber },
  red: { bg: TN.status.redBg, fg: TN.status.redText, prikk: TN.status.red },
  info: { bg: TN.status.infoBg, fg: TN.status.infoText, prikk: TN.navy600 },
  nøytral: { bg: TN.ink100, fg: TN.ink700, prikk: TN.ink500 },
  invers: { bg: TN.navy900, fg: TN.white, prikk: TN.white },
};

export function TnPille({ children, tone = "nøytral" }: { children: ReactNode; tone?: TnPilleTone }) {
  const t = PILLE_TONE[tone];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        minHeight: 24,
        padding: "2px 10px",
        borderRadius: TN.radius.pill,
        background: t.bg,
        color: t.fg,
        fontFamily: TN.font.body,
        fontSize: 12,
        fontWeight: TN.weight.bold,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        flex: "none",
      }}
    >
      <span aria-hidden="true" style={{ width: 6, height: 6, flex: "none", borderRadius: TN.radius.round, background: t.prikk }} />
      {children}
    </span>
  );
}

// ───────────────────────── Avatar-initialer ─────────────────────────

export function TnAvatarInitialer({
  navn,
  size = 36,
  paaMork = false,
}: {
  navn: string;
  size?: number;
  /** Lysere navy plate med hvite bokstaver — for bruk på navy flater. */
  paaMork?: boolean;
}) {
  const initialer = navn
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((del) => del[0]?.toUpperCase() ?? "")
    .join("");
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: TN.radius.round,
        background: paaMork ? TN.rail.active : TN.navy100,
        color: paaMork ? TN.rail.on : TN.navy900,
        fontFamily: TN.font.mono,
        fontSize: TN.text.xs,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      {initialer || "?"}
    </span>
  );
}

// ───────────────────────── Knapp ─────────────────────────

// Fasit: designsystem/team-norway/components/core/Button.jsx.
// Native knapp-props bevarer disabled, skjemakobling og tilgjengelige navn.

export function TnKnapp({
  children,
  variant = "sekundaer",
  size = "md",
  type = "button",
  fullBredde = false,
  ikon,
  className,
  ...props
}: Omit<ComponentProps<"button">, "children"> & {
  children: ReactNode;
  variant?: "primaer" | "sekundaer" | "aksent" | "tekst" | "mork";
  size?: "sm" | "md" | "lg";
  fullBredde?: boolean;
  ikon?: ReactNode;
}) {
  return (
    <button
      {...props}
      type={type}
      className={[styles.knapp, className].filter(Boolean).join(" ")}
      data-variant={variant}
      data-size={size}
      data-full-bredde={fullBredde || undefined}
    >
      {ikon && <span aria-hidden="true" className={styles.ikon}>{ikon}</span>}
      {children}
    </button>
  );
}

// ───────────────────────── Meny-typer (skallet bor i tn-shell.tsx) ─────────────────────────

export type TnMenyLenke = { label: string; href: string; aktiv: boolean };
export type TnMenyGruppe = { id: string; label: string; ikon: TnIkonNavn; aktiv: boolean; punkter: TnMenyLenke[] };
export type TnBunnValg = TnMenyLenke & { ikon: TnIkonNavn };

// ───────────────────────── Input ─────────────────────────

/**
 * Fasit: components/core/Input.jsx i Claw-designsystemet (a03bf94a…).
 * `error` setter rød kant og ERSTATTER hint-teksten — de vises aldri samtidig.
 */
export function TnInput({
  label,
  value,
  onChange,
  placeholder,
  error,
  hint,
  type = "text",
  suffix,
  disabled,
  id,
  className,
  "aria-describedby": beskrevetAv,
  ...props
}: Omit<ComponentProps<"input">, "value" | "onChange"> & {
  label?: string;
  value?: string;
  onChange?: (verdi: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  suffix?: string;
}) {
  const generertId = useId();
  const feltId = id ?? generertId;
  const meldingId = `${feltId}-melding`;
  const beskrivelse = [beskrevetAv, error || hint ? meldingId : undefined].filter(Boolean).join(" ") || undefined;
  return (
    <div className={styles.felt}>
      {label && (
        <label htmlFor={feltId} className={styles.etikett}>{label}</label>
      )}
      <div
        className={styles.feltramme}
        data-feil={!!error || undefined}
        data-disabled={disabled || undefined}
      >
        <input
          {...props}
          id={feltId}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          aria-invalid={error ? true : props["aria-invalid"]}
          aria-describedby={beskrivelse}
          className={[styles.input, className].filter(Boolean).join(" ")}
        />
        {suffix && <span className={styles.suffiks}>{suffix}</span>}
      </div>
      {error ? (
        <span id={meldingId} className={styles.feil}>{error}</span>
      ) : hint ? (
        <span id={meldingId} className={styles.hint}>{hint}</span>
      ) : null}
    </div>
  );
}
