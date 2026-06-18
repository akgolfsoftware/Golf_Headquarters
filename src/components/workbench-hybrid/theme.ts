/**
 * Workbench Hybrid — colocated "forest terminal" theme.
 *
 * Disse fargene er Workbench-spesifikke (mørk terminal-grønn) og er BEVISST
 * ikke en del av globals.css-token-settet. Flaten er alltid mørk, uavhengig av
 * produkt (PlayerHQ lyst / AgencyOS mørkt) fordi Workbench er ÉN delt komponent.
 * Verdiene er hentet 1:1 fra fasiten
 * (public/design-handover/.../Workbench Interaktiv (standalone-src).dc.html).
 */

/** Kategori- / akse-farger (AK-pyramide). */
export const CAT_COLORS = {
  FYS: "#56C59A",
  TEK: "#E8A33D",
  SLAG: "#84A9FF",
  SPILL: "#D1F843",
  TURN: "#F2908C",
} as const;

export type Cat = keyof typeof CAT_COLORS;

/** Turneringstyper (sidebar/måned-tidslinje). */
export const TOUR_TYPES = {
  TRENING: { label: "Treningsturnering", short: "Trening", color: "#56C59A" },
  UTVIKLING: { label: "Utviklingsturnering", short: "Utvikling", color: "#84A9FF" },
  PRESTASJON: { label: "Prestasjonsturnering", short: "Prestasjon", color: "#F2908C" },
} as const;

/** Surface- og tekst-tokens for terminal-flaten. */
export const WB = {
  pageBg: "#e7e4dc",
  panelBg: "#0F2A22",
  panelBorder: "#2B4F42",
  railBg: "#0A1F17",
  cardBg: "#163027",
  cardBgAlt: "#11281e",
  innerBorder: "#2B4F42",
  innerBorderSoft: "#21392e",
  hairline: "#16271f",
  hairlineSoft: "#1d3a2e",
  text: "#F5F5F2",
  muted: "#9CA39E",
  muted2: "#cdd4cf",
  muted3: "#5f7d70",
  subText: "#5E5C57",
  lime: "#D1F843",
  limeDark: "#0A1F17",
  forest: "#005840",
  ok: "#56C59A",
  warn: "#E8A33D",
  err: "#F2908C",
} as const;

export const FONT = {
  sans: "'Inter', sans-serif",
  display: "'Inter Tight', sans-serif",
  mono: "'JetBrains Mono', monospace",
} as const;
