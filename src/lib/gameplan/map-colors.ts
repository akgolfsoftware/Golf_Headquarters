/**
 * Kartpalett for Mapbox-lagene i Gameplan — samlet på ETT sted.
 *
 * UNNTAK fra ingen-rå-hex-regelen: Mapbox GL tegner på <canvas> og kan ikke
 * lese CSS-variabler, så fargene må være statiske strings. Hver konstant er
 * kommentert med Train-lock-tokenet den er avledet fra
 * (src/styles/train-lock-tokens.css). Endres tokens, endres denne fila i
 * samme commit. Portet fra Paper-avledning 28.08.2026 (lime/Presis er forbudt,
 * CLAUDE.md invariant 2).
 */

// Terreng-toner (kartografi, ikke merkevare-tokens — mot satellittfoto).
const TERRENG = {
  fairway: "#788C5D", // oliven — fairway-flate
  bunker: "#B8852A", // oker — bunker
  water: "#2563EB", // blå — vann
} as const;

export const MAP_COLORS = {
  green: "#7BC47F", // putting-green — lysere for kontrast mot satellitt (egen kart-tone)
  fairway: TERRENG.fairway,
  bunker: TERRENG.bunker,
  water: TERRENG.water,
  tee: "#B08968", // --tl-viz-dot — slag/tee-markør
  holeLine: "#B08968", // --tl-viz-dot
} as const;

/** Slag- og dispersjonslag (fase C4/C5). */
export const DISPERSION_COLORS = {
  shotPoint: "#B08968", // --tl-viz-dot — landingspunkter (aldri kølle-farge, aldri heat)
  shotPointStroke: "#000000", // --tl-scene (mørk) — kant rundt punktene for lesbarhet
  sigma1Fill: "#B08968", // --tl-viz-dot m/ lav opacity (settes i laget)
  sigma1Stroke: "#B08968", // --tl-viz-dot kant (1σ)
  sigma2Fill: "#8E8E93", // --tl-mute grå-flate m/ lav opacity (2σ — roligere enn 1σ)
  sigma2Stroke: "#8E8E93", // --tl-mute grå kant
  aimLine: "#0A84FF", // --tl-viz-target — siktelinje (stiplet i laget)
  activePlotPoint: "#30D158", // --tl-viz-good — punktet som plottes akkurat nå
} as const;

/** Gameplan interaktiv modus (C7) — sikte-markør + bra/aldri-soner. */
export const GAMEPLAN_COLORS = {
  sikte: "#0A84FF", // --tl-viz-target — sikte-markør
  soneBra: "#30D158", // --tl-viz-good — «bra å misse»-sone
  soneAldri: "#FF453A", // --tl-viz-disaster — «aldri hit»-sone
} as const;
