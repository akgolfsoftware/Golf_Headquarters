import * as React from "react";

export type ThemeValue = "system" | "light" | "dark";

export interface ThemeToggleProps {
  /** Kontrollert verdi. Utelates for selvstyrt (intern state + evt. storageKey). */
  value?: ThemeValue;
  /** Startverdi når ukontrollert. Default "system". */
  defaultValue?: ThemeValue;
  /** Kalles ved valg: (verdi, oppløstTema) der oppløstTema er "light"|"dark". */
  onChange?: (value: ThemeValue, resolved: "light" | "dark") => void;
  /** Hva temaet skrives på: element eller CSS-selektor. Default <html>. */
  target?: Element | string;
  /** Skriv `.light`/`.dark` + data-theme + color-scheme på target. Default true. */
  apply?: boolean;
  /** localStorage-nøkkel for å huske valget (kun ukontrollert). */
  storageKey?: string;
  size?: "sm" | "md";
  /** Vis tekst-etiketter. false = kun ikoner. Default true. */
  visEtiketter?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * ThemeToggle — tre-veis utseende-velger (System · Lys · Mørk).
 * «System» følger prefers-color-scheme live. Nøytral segmentert pille (aldri
 * lime). Skriver klasse/data-theme/color-scheme på target. AgencyOS: toppbar
 * (default mørk). PlayerHQ: Meg › Innstillinger › Utseende (default lys).
 */
export declare function ThemeToggle(props: ThemeToggleProps): JSX.Element;
