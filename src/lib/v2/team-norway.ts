/**
 * AK Golf HQ · Team Norway — TS-speil av --tn-* (Claw batch 3, 01.09.2026).
 *
 * Verdiene bor som CSS-variabler i src/styles/team-norway-tokens.css. Denne
 * fila peker BARE på var(--tn-*) — ingen hex duplisert, fasiten har nøyaktig
 * ett sted å endres. Mønster: src/lib/v2/train-lock.ts (TL).
 *
 * FASIT: designsystem/team-norway/ (readme.md · tokens/ · templates/).
 * Claw-brandingen er designfasit for `/team-norway/*` ALENE — Train-lock og
 * TN er to parallelle systemer, en skjerm bruker aldri begge samtidig
 * (.claude/rules/beslutninger.md §TEAM NORWAY-SKJERMENE DESIGNES I CLAUDE-
 * BRANDINGEN). Unntak: Analyse/DataGolf under /team-norway/* er Train-lock
 * med TN-skinn — de importerer TL, ikke TN.
 *
 * REGLER SOM FØLGER MED TOKENENE:
 * - Merkevarerød (TN.red600) er identitet — logo, skinne, "denne utøveren"
 *   i data. ALDRI status. Status bruker TN.status.* (egen rød, #C2352B).
 * - TN.ink400 er lyseste gråtone som får bære tekst — TN.ink300 og lysere
 *   er kanter/linjer, gjelder også 9–11px etiketter.
 * - Mørk (TN.dark.*) er en ROLLE (hero/seksjonsskille/presentasjon), ikke
 *   et tema — ingen html[data-tn-tema]-bryter finnes eller skal innføres.
 * - Diagonalen (TN.clipDiagonalB/T, 56px) kun på hero/seksjonsskille, aldri
 *   kort eller kontroller.
 * - tabular-nums på alle tall. Aldri ease-in på grensesnitt.
 */

export const TN = {
  navy900: "var(--tn-navy-900)",
  navy800: "var(--tn-navy-800)",
  navy700: "var(--tn-navy-700)",
  navy600: "var(--tn-navy-600)",
  navy400: "var(--tn-navy-400)",
  navy300: "var(--tn-navy-300)",
  navy100: "var(--tn-navy-100)",
  navy50: "var(--tn-navy-50)",

  /** Merkevareidentitet — logo, skinne, "denne utøveren". ALDRI status. */
  red600: "var(--tn-red-600)",
  red700: "var(--tn-red-700)",
  red400: "var(--tn-red-400)",
  red100: "var(--tn-red-100)",

  dark: {
    d900: "var(--tn-dark-900)",
    d800: "var(--tn-dark-800)",
    d700: "var(--tn-dark-700)",
    d600: "var(--tn-dark-600)",
    line: "var(--tn-dark-line)",
  },

  ink900: "var(--tn-ink-900)",
  ink700: "var(--tn-ink-700)",
  ink500: "var(--tn-ink-500)",
  /** Lyseste gråtone som får bære tekst — lysere enn dette er kanter/linjer. */
  ink400: "var(--tn-ink-400)",
  ink300: "var(--tn-ink-300)",
  ink200: "var(--tn-ink-200)",
  ink100: "var(--tn-ink-100)",
  ink50: "var(--tn-ink-50)",
  white: "var(--tn-white)",

  status: {
    green: "var(--tn-status-green)",
    greenText: "var(--tn-status-green-text)",
    greenBg: "var(--tn-status-green-bg)",
    amber: "var(--tn-status-amber)",
    amberText: "var(--tn-status-amber-text)",
    amberBg: "var(--tn-status-amber-bg)",
    red: "var(--tn-status-red)",
    redText: "var(--tn-status-red-text)",
    redBg: "var(--tn-status-red-bg)",
    info: "var(--tn-status-info)",
    infoText: "var(--tn-status-info-text)",
    infoBg: "var(--tn-status-info-bg)",
  },

  data: {
    d1: "var(--tn-data-1)",
    d2: "var(--tn-data-2)",
    d3: "var(--tn-data-3)",
    d4: "var(--tn-data-4)",
    d5: "var(--tn-data-5)",
    accent: "var(--tn-data-accent)",
  },

  surfacePage: "var(--tn-surface-page)",
  surfaceCard: "var(--tn-surface-card)",
  surfaceSunken: "var(--tn-surface-sunken)",
  surfaceInverse: "var(--tn-surface-inverse)",
  surfaceDark: "var(--tn-surface-dark)",
  surfaceDarkCard: "var(--tn-surface-dark-card)",
  surfaceDarkRaised: "var(--tn-surface-dark-raised)",

  borderSubtle: "var(--tn-border-subtle)",
  borderDefault: "var(--tn-border-default)",
  borderStrong: "var(--tn-border-strong)",
  borderDark: "var(--tn-border-dark)",

  textPrimary: "var(--tn-text-primary)",
  textSecondary: "var(--tn-text-secondary)",
  textTertiary: "var(--tn-text-tertiary)",
  textInverse: "var(--tn-text-inverse)",
  textOnDark: "var(--tn-text-on-dark)",
  textOnDarkMuted: "var(--tn-text-on-dark-muted)",

  accentPrimary: "var(--tn-accent-primary)",
  accentSecondary: "var(--tn-accent-secondary)",
  link: "var(--tn-link)",
  linkHover: "var(--tn-link-hover)",
  focusRing: "var(--tn-focus-ring)",

  radius: {
    xs: "var(--tn-radius-xs)",
    sm: "var(--tn-radius-sm)",
    md: "var(--tn-radius-md)",
    lg: "var(--tn-radius-lg)",
    xl: "var(--tn-radius-xl)",
    full: "var(--tn-radius-full)",
  },

  shadow: {
    sm: "var(--tn-shadow-sm)",
    md: "var(--tn-shadow-md)",
    lg: "var(--tn-shadow-lg)",
    dark: "var(--tn-shadow-dark)",
  },

  /** Kun hero/seksjonsskille — aldri kort eller kontroller. */
  clipDiagonalB: "var(--tn-clip-diagonal-b)",
  clipDiagonalT: "var(--tn-clip-diagonal-t)",

  duration: {
    press: "var(--tn-duration-press)",
    fast: "var(--tn-duration-fast)",
    base: "var(--tn-duration-base)",
    slow: "var(--tn-duration-slow)",
    sheet: "var(--tn-duration-sheet)",
  },
  ease: {
    out: "var(--tn-ease-out)",
    inOut: "var(--tn-ease-in-out)",
    sheet: "var(--tn-ease-sheet)",
    hover: "var(--tn-ease-hover)",
  },
  pressScale: "var(--tn-press-scale)",

  space: {
    s1: "var(--tn-space-1)",
    s2: "var(--tn-space-2)",
    s3: "var(--tn-space-3)",
    s4: "var(--tn-space-4)",
    s5: "var(--tn-space-5)",
    s6: "var(--tn-space-6)",
    s7: "var(--tn-space-7)",
    s8: "var(--tn-space-8)",
    s9: "var(--tn-space-9)",
    s10: "var(--tn-space-10)",
    s11: "var(--tn-space-11)",
  },
  gutterCard: "var(--tn-gutter-card)",
  gutterSection: "var(--tn-gutter-section)",
  maxContent: "var(--tn-max-content)",

  font: {
    display: "var(--tn-font-display)",
    body: "var(--tn-font-body)",
    mono: "var(--tn-font-mono)",
  },
  text: {
    displayXl: "var(--tn-text-display-xl)",
    display: "var(--tn-text-display)",
    h1: "var(--tn-text-h1)",
    h2: "var(--tn-text-h2)",
    h3: "var(--tn-text-h3)",
    lg: "var(--tn-text-lg)",
    base: "var(--tn-text-base)",
    sm: "var(--tn-text-sm)",
    xs: "var(--tn-text-xs)",
    micro: "var(--tn-text-micro)",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  tracking: {
    display: "var(--tn-tracking-display)",
    heading: "var(--tn-tracking-heading)",
    normal: "var(--tn-tracking-normal)",
    small: "var(--tn-tracking-small)",
    eyebrow: "var(--tn-tracking-eyebrow)",
  },
  leading: {
    tight: "var(--tn-leading-tight)",
    snug: "var(--tn-leading-snug)",
    normal: "var(--tn-leading-normal)",
    relaxed: "var(--tn-leading-relaxed)",
  },
} as const;
