/**
 * Kartpalett for Mapbox-lagene i Gameplan — samlet på ETT sted.
 *
 * UNNTAK fra ingen-rå-hex-regelen: Mapbox GL tegner på <canvas> og kan ikke
 * lese CSS-variabler, så fargene må være statiske strings. Hver konstant er
 * kommentert med kilde-tokenet den er avledet fra (pyramide-aksefargene /
 * T i lib/v2/tokens.ts). Endres tokens, endres denne fila i samme commit.
 * Paletten skal godkjennes av Anders (design-gap meldt i Gameplan-planen).
 */

import { T } from "@/lib/v2/tokens";

// Pyramide-aksefargene (lys modus, --pyr-*/--axis-* i globals.css).
const PYR = {
  fys: "#005840", // forest
  tek: "#B8852A", // ochre
  slag: "#2563EB", // blå
  spill: T.farge.limeMerke, // lime (= T.lime)
} as const;

export const MAP_COLORS = {
  green: "#7BC47F", // putting-green — lysere enn forest for kontrast mot satellitt (egen kart-tone)
  fairway: PYR.fys,
  bunker: PYR.tek,
  water: PYR.slag,
  tee: PYR.spill,
  holeLine: PYR.spill,
} as const;

/** Slag- og dispersjonslag (fase C4/C5). */
export const DISPERSION_COLORS = {
  shotPoint: PYR.spill, // #D1F843 lime — landingspunkter
  shotPointStroke: "#0D0E0D", // T.bg nær-svart — kant rundt punktene for lesbarhet
  sigma1Fill: PYR.spill, // lime-flate m/ lav opacity (settes i laget)
  sigma1Stroke: PYR.spill, // lime kant (1σ)
  sigma2Fill: "#A6A9A3", // T.fg2 grå-flate m/ lav opacity (2σ — roligere enn 1σ)
  sigma2Stroke: "#A6A9A3", // T.fg2 grå kant
  aimLine: "#EEF0EC", // T.fg — siktelinje (stiplet i laget)
  activePlotPoint: "#4FD08A", // T.up grønn — punktet som plottes akkurat nå
} as const;

/** Gameplan interaktiv modus (C7) — sikte-markør + bra/aldri-soner. */
export const GAMEPLAN_COLORS = {
  sikte: PYR.spill, // #D1F843 lime — samme sikte-farge som tee/holeLine
  soneBra: "#4FD08A", // T.up grønn — «bra å misse»-sone
  soneAldri: "#E05D44", // status-rød — «aldri hit»-sone
} as const;
