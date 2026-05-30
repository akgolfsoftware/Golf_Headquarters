/**
 * AK Golf HQ — Designsystem-tokens (programmatic eksport)
 *
 * Kilde: src/app/globals.css
 * Brukes når du trenger tokens i JavaScript (charts, animasjoner, dynamic styles).
 *
 * Aldri hardcode farger andre steder — alltid via Tailwind-utilities eller denne fila.
 */

export const colors = {
  // Surfaces
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  card: "hsl(var(--card))",
  cardForeground: "hsl(var(--card-foreground))",
  popover: "hsl(var(--popover))",
  popoverForeground: "hsl(var(--popover-foreground))",

  // Brand
  primary: "hsl(var(--primary))",
  primaryForeground: "hsl(var(--primary-foreground))",
  accent: "hsl(var(--accent))",
  accentForeground: "hsl(var(--accent-foreground))",

  // Neutrals
  secondary: "hsl(var(--secondary))",
  secondaryForeground: "hsl(var(--secondary-foreground))",
  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",

  // Feedback
  destructive: "hsl(var(--destructive))",
  destructiveForeground: "hsl(var(--destructive-foreground))",
  success: "hsl(var(--success))",
  successForeground: "hsl(var(--success-foreground))",
  warning: "hsl(var(--warning))",
  warningForeground: "hsl(var(--warning-foreground))",
  info: "hsl(var(--info))",
  infoForeground: "hsl(var(--info-foreground))",

  // Charts
  chart1: "hsl(var(--chart-1))",
  chart2: "hsl(var(--chart-2))",
  chart3: "hsl(var(--chart-3))",
  chart4: "hsl(var(--chart-4))",
  chart5: "hsl(var(--chart-5))",
  chart6: "hsl(var(--chart-6))",

  // Form og fokus
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
} as const;

/**
 * Pyramide-farger — KANONISK spec (mode-invariant rå hex).
 * FYS=forest, TEK=ochre, SLAG=blå, SPILL=lime, TURN=rød.
 * Speiler --pyr-* i globals.css. Kilden er
 * .claude/skills/ak-golf-hq-design/colors_and_type.css.
 * Aldri endre uten beslutning.
 */
export const pyramidColors = {
  fys: "#005840", // forest
  tek: "#B8852A", // ochre
  slag: "#2563EB", // blå
  spill: "#D1F843", // lime
  turn: "#A32D2D", // rød
} as const;

export type PyramidArea = keyof typeof pyramidColors;

/**
 * Spacing-skala (8pt-grid).
 * Bruk Tailwind-utilities (p-2, m-4) primært. Disse er for inline-styles.
 */
export const spacing = {
  "0.5": "4px",
  "1": "8px",
  "2": "16px",
  "3": "24px",
  "4": "32px",
  "5": "40px",
  "6": "48px",
  "8": "64px",
  "10": "80px",
  "12": "96px",
  "16": "128px",
  "20": "160px",
  "24": "192px",
} as const;

/**
 * Border-radius-skala.
 */
export const radius = {
  sm: "8px", // badges, tags
  md: "12px", // buttons, inputs
  lg: "16px", // cards, panels
  xl: "20px", // modaler, hero-cards
  "2xl": "24px", // fullscreen-elementer
  full: "9999px", // pills, avatarer
} as const;

/**
 * Animation-tokens.
 */
export const motion = {
  duration: {
    fast: "120ms",
    base: "220ms",
    slow: "400ms",
  },
  easing: {
    out: "cubic-bezier(0.16, 1, 0.3, 1)",
    inOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

/**
 * Fontfamilier (via next/font CSS-variabler).
 */
export const fonts = {
  sans: "var(--font-inter), system-ui, -apple-system, sans-serif",
  display: "var(--font-inter-tight), system-ui, -apple-system, sans-serif",
  mono: "var(--font-jetbrains-mono), ui-monospace, monospace",
} as const;

/**
 * Type-skala.
 */
export const typography = {
  xs: { size: "12px", lineHeight: "16px" },
  sm: { size: "14px", lineHeight: "20px" },
  base: { size: "16px", lineHeight: "24px" },
  lg: { size: "18px", lineHeight: "28px" },
  xl: { size: "20px", lineHeight: "28px" },
  "2xl": { size: "24px", lineHeight: "32px" },
  "3xl": { size: "30px", lineHeight: "36px" },
  "4xl": { size: "36px", lineHeight: "40px" },
  display1: { size: "48px", lineHeight: "1.05" },
  display2: { size: "60px", lineHeight: "1.05" },
  display3: { size: "72px", lineHeight: "1" },
} as const;

/**
 * Chart-palett (6 farger for data-viz).
 */
export const chartPalette = [
  colors.chart1,
  colors.chart2,
  colors.chart3,
  colors.chart4,
  colors.chart5,
  colors.chart6,
] as const;
