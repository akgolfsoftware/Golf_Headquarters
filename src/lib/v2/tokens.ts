/**
 * AK Golf HQ v2 — token-speil (retning C «Presis», mørk først).
 * 1:1 med `T`-objektet i mockup-kilden (v2-core.jsx) + fontskala fra
 * src/styles/v2/tokens.css. Komponentene i src/components/v2/ bruker dette
 * for inline styles (raskeste vei til diff-null mot mockup). CSS-variabel-
 * speilet ligger i src/styles/v2/tokens.css. Endres kun ved designbeslutning.
 */
export const T = {
  // Flater
  bg: "#0D0E0D",
  panel: "#151715",
  panel2: "#131513",
  panel3: "#1B1D1B",
  tint: "linear-gradient(140deg, rgba(0,88,64,0.38) 0%, rgba(21,23,21,0) 55%)",
  // Benchmark-/nivåskala (kald→varm): mørk grønn → forest → oliven → lime. Egne
  // gradient-stopp uten enkelttoken; innkapslet her så komponentfilene forblir hex-frie.
  nivaGrad: "linear-gradient(90deg, #26332B 0%, #005840 45%, #6E9A4E 75%, #D1F843 100%)",
  // Streker
  border: "rgba(255,255,255,0.08)",
  borderS: "rgba(255,255,255,0.14)",
  track: "rgba(255,255,255,0.08)",
  // Tekst
  fg: "#EEF0EC",
  fg2: "#A6A9A3",
  mut: "#797C76",
  // Merkevare + signal
  forest: "#005840",
  lime: "#D1F843",
  onLime: "#0D0E0D",
  up: "#4FD08A",
  down: "#F0683E",
  warn: "#E8B43C",
  info: "#5AA9F0",
  // Akse-farger (pyramiden, uendret kanon)
  ax: { FYS: "#3DBE78", TEK: "#E8B43C", SLAG: "#5AA9F0", SPILL: "#D1F843", TURN: "#F0683E" } as const,
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
