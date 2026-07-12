/**
 * AK Golf HQ v2 — token-speil (retning C «Presis», mørk først).
 * 1:1 med `T`-objektet i mockup-kilden (v2-core.jsx). Komponentene i
 * src/components/v2/ bruker dette for inline styles. DS2 (2026-07-12):
 * fargeverdiene bor som --v2-*-variabler i src/app/globals.css med mørk
 * (default) + lys skala — veksles via data-v2-tema på <html>.
 * Endres kun ved designbeslutning.
 */
export const T = {
  // Flater — DS2 (2026-07-12): verdiene bor i globals.css som --v2-* med
  // mørk (default, lysnet) + lys skala; veksles via data-v2-tema på <html>.
  bg: "var(--v2-bg)",
  panel: "var(--v2-panel)",
  panel2: "var(--v2-panel2)",
  panel3: "var(--v2-panel3)",
  tint: "var(--v2-tint)",
  // Benchmark-/nivåskala (kald→varm): mørk grønn → forest → oliven → lime.
  nivaGrad: "var(--v2-niva-grad)",
  // Streker
  border: "var(--v2-border)",
  borderS: "var(--v2-border-s)",
  track: "var(--v2-track)",
  // Tekst
  fg: "var(--v2-fg)",
  fg2: "var(--v2-fg2)",
  mut: "var(--v2-mut)",
  // Merkevare + signal (lys modus: lime-aksenten blir forest — aldri lime-på-lys)
  forest: "var(--v2-forest)",
  lime: "var(--v2-lime)",
  onLime: "var(--v2-on-lime)",
  up: "var(--v2-up)",
  down: "var(--v2-down)",
  warn: "var(--v2-warn)",
  info: "var(--v2-info)",
  // Akse-farger (pyramiden, uendret kanon — mørkere varianter i lys modus)
  ax: { FYS: "var(--v2-ax-fys)", TEK: "var(--v2-ax-tek)", SLAG: "var(--v2-ax-slag)", SPILL: "var(--v2-ax-spill)", TURN: "var(--v2-ax-turn)" } as const,
  // Tee-markørfarger (ekte fysiske teefarger, ikke merkevare-tokens — innkapslet
  // her så komponent-/skjermfilene forblir hex-frie)
  tee: { hvit: "#F5F5F5", gul: "#FFD600", rod: "#E53935" } as const,
  // Milepæl-badgefarger (stats/2026-sesongoversikt — ikke merkevare-tokens,
  // innkapslet her så page.tsx forblir hex-fri)
  milepael: { topp10: "#2EA66B", proDebut: "#7B61FF" } as const,
  // Ekstra sammenligningsfarge for putt-explorer-stolpediagram (4. serie,
  // ikke merkevare-token — innkapslet her så explorer.tsx forblir hex-fri)
  chartFaint: "#B8B5AC",
  // Lys mint-bakgrunn for "college"-tier-badge på stats/spillere (fg = forest)
  tierCollegeBg: "#E8F5F0",
  // Bakgrunnsgradienter + tekstfarger for stats-wrapped-slide/-player (delt
  // Spotify Wrapped-stil delekort). Faste merkevarefarger uavhengig av tema
  // (kortet er en eksporterbar/delbar grafikk) — innkapslet her så
  // komponentfilene forblir hex-frie. accentColor/dot-farger gjenbruker
  // T.forest/T.lime over.
  wrapped: {
    bgForest: "linear-gradient(160deg, #005840 0%, #003D2C 100%)",
    bgForestDark: "linear-gradient(160deg, #002A1A 0%, #001510 100%)",
    bgLime: "linear-gradient(160deg, #D1F843 0%, #B8E020 100%)",
    bgOffwhite: "linear-gradient(160deg, #FAFAF7 0%, #F1EEE5 100%)",
    textOnDark: "#F7F7F4",
    textOnLight: "#101613",
  } as const,
  // Typografi
  disp: '"Familjen Grotesk",Inter,system-ui,sans-serif',
  ui: "Inter,system-ui,sans-serif",
  mono: '"JetBrains Mono",ui-monospace,monospace',
  // Fontskala (px — fra tokens.css)
  displayXl: 36,
  numHero: 56,
  numLg: 38,
  numMd: 26,
  body: 13.5,
  bodySm: 12,
  caps: 10,
  capsSm: 9,
  // Geometri
  rCard: 20,
  rRow: 12,
  rPill: 9999,
  gap: 16,
  maxw: 1120,
  // Motion
  ease: "cubic-bezier(0.2,0,0,1)",
  dur: 180,
} as const;

/** Akse-nøkler i pyramiden (FYS/TEK/SLAG/SPILL/TURN). */
export type AkseKey = keyof typeof T.ax;

/** SG-formatering: komma-desimal + fortegn (+/−), 1 desimal. Speil av mockupens fmtSg. */
export function fmtSg(v: number): string {
  return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1).replace(".", ",");
}
