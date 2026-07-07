/**
 * Workbench Hybrid — tema-lag, re-mappet til v13 golfdata-tokens (2026-07-06).
 *
 * Tidligere var dette et bespoke «forest terminal»-tema med rå hex. Nå peker
 * alle konstanter på CSS-variabler fra .golfdata-scope (src/styles/
 * golfdata-tokens.css) — flaten følger dermed lys/mørk automatisk (PlayerHQ
 * lys, AgencyOS via .dark-forelder). Ingen rå hex her; nye farger skal inn
 * som token først (se .claude/rules/designsystem.md).
 */

/** Kategori- / akse-farger (AK-pyramide) — v13 data-viz-tokens. */
export const CAT_COLORS = {
  FYS: "var(--axis-fys)",
  TEK: "var(--axis-tek)",
  SLAG: "var(--axis-slag)",
  SPILL: "var(--axis-spill)",
  TURN: "var(--axis-turn)",
} as const;

/** Soft/tint-variant per akse (bakgrunner bak akse-farget innhold). */
export const CAT_SOFT = {
  FYS: "var(--axis-fys-soft)",
  TEK: "var(--axis-tek-soft)",
  SLAG: "var(--axis-slag-soft)",
  SPILL: "var(--axis-spill-soft)",
  TURN: "var(--axis-turn-soft)",
} as const;

/** Tekst-lesbar variant per akse (tekst på flate, ikke på fylt akse). */
export const CAT_TEXT = {
  FYS: "var(--axis-fys-text)",
  TEK: "var(--axis-tek-text)",
  SLAG: "var(--axis-slag-text)",
  SPILL: "var(--axis-spill-text)",
  TURN: "var(--axis-turn-text)",
} as const;

export type Cat = keyof typeof CAT_COLORS;

/** Turneringstyper (sidebar/måned-tidslinje) — akse-tokens med samme hue som før. */
export const TOUR_TYPES = {
  TRENING: { label: "Treningsturnering", short: "Trening", color: "var(--axis-fys)" },
  UTVIKLING: { label: "Utviklingsturnering", short: "Utvikling", color: "var(--axis-slag)" },
  PRESTASJON: { label: "Prestasjonsturnering", short: "Prestasjon", color: "var(--axis-turn)" },
} as const;

/** Surface- og tekst-tokens for Workbench-flaten (v13-aliaser). */
export const WB = {
  pageBg: "var(--bg)",
  panelBg: "var(--surface)",
  panelBorder: "var(--border-strong)",
  railBg: "var(--surface-2)",
  cardBg: "var(--surface)",
  cardBgAlt: "var(--surface-2)",
  cardBgActive: "var(--surface-hover)",
  innerBorder: "var(--border-strong)",
  innerBorderSoft: "var(--border)",
  hairline: "var(--border)",
  hairlineSoft: "var(--border)",
  text: "var(--text)",
  muted: "var(--text-muted)",
  muted2: "var(--text-2)",
  muted3: "var(--text-faint)",
  subText: "var(--text-muted)",
  lime: "var(--signal)",
  limeDark: "var(--on-signal)",
  forest: "var(--signal)",
  ok: "var(--success)",
  warn: "var(--warning)",
  err: "var(--destructive)",
  /* Avledede tinter — erstatter tidligere `${hex}22`-konkatenering. */
  limeFaint: "color-mix(in srgb, var(--signal) 7%, transparent)",
  limeSoft: "color-mix(in srgb, var(--signal) 13%, transparent)",
  limeBorder: "color-mix(in srgb, var(--signal) 32%, transparent)",
  okSoft: "var(--success-bg)",
  warnSoft: "var(--warning-bg)",
  errSoft: "color-mix(in srgb, var(--destructive) 12%, transparent)",
  errBorder: "color-mix(in srgb, var(--destructive) 35%, transparent)",
  mutedSoft: "color-mix(in srgb, var(--text-muted) 14%, transparent)",
  /* Overlay-scrim (modaler/ark) — mørk uansett tema, standard mønster. */
  scrim: "rgba(10, 11, 10, 0.62)",
} as const;

/**
 * Compliance-farger for økt-kort (plan vs. gjennomført) — v13 kalender-tokens.
 * Fremtidige økter compliance-farges ikke.
 */
export const COMPLIANCE_COLORS = {
  "pa-plan": "var(--compliance-on)",
  avvik: "var(--compliance-off)",
  "ikke-gjennomfort": "var(--compliance-none)",
} as const;

export const FONT = {
  sans: "var(--font-ui)",
  display: "var(--font-display)",
  mono: "var(--font-mono)",
} as const;
