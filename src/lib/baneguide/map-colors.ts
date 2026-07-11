/**
 * Kartpalett for Mapbox-lagene i baneguiden — samlet på ETT sted.
 *
 * UNNTAK fra ingen-rå-hex-regelen: Mapbox GL tegner på <canvas> og kan ikke
 * lese CSS-variabler, så fargene må være statiske strings. Hver konstant er
 * avledet fra en navngitt kilde-token (pyramidColors i lib/design-tokens.ts /
 * T i lib/v2/tokens.ts) og kommentert med den. Endres tokens, endres denne
 * fila i samme commit. Paletten skal godkjennes av Anders (design-gap meldt
 * i baneguide-planen).
 */

import { pyramidColors } from "@/lib/design-tokens";

export const MAP_COLORS = {
  green: "#7BC47F", // putting-green — lysere enn forest for kontrast mot satellitt (egen kart-tone)
  fairway: pyramidColors.fys, // #005840 forest
  bunker: pyramidColors.tek, // #B8852A sand/oker
  water: pyramidColors.slag, // #2563EB blå
  tee: pyramidColors.spill, // #D1F843 lime (= T.lime)
  holeLine: pyramidColors.spill, // #D1F843 lime
} as const;

/** Slag- og dispersjonslag (fase C4/C5). */
export const DISPERSION_COLORS = {
  shotPoint: pyramidColors.spill, // #D1F843 lime — landingspunkter
  shotPointStroke: "#0D0E0D", // T.bg nær-svart — kant rundt punktene for lesbarhet
  sigma1Fill: pyramidColors.spill, // lime-flate m/ lav opacity (settes i laget)
  sigma1Stroke: pyramidColors.spill, // lime kant (1σ)
  sigma2Fill: "#A6A9A3", // T.fg2 grå-flate m/ lav opacity (2σ — roligere enn 1σ)
  sigma2Stroke: "#A6A9A3", // T.fg2 grå kant
  aimLine: "#EEF0EC", // T.fg — siktelinje (stiplet i laget)
  activePlotPoint: "#4FD08A", // T.up grønn — punktet som plottes akkurat nå
} as const;
