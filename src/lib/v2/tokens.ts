/**
 * AK Golf HQ v2 — token-speil (Open Design showroom-fasit, Fase F).
 * Verdiene bor som --v2-* i src/app/globals.css: LYS default på :root,
 * mørk via html[data-v2-tema="dark"]. Komponenter bruker T for inline styles.
 * Endres kun ved designbeslutning.
 *
 * C smalt (2026-07-31): T.handling = «Én ting nå»-monopolet (#D97757).
 * Maks én gang per skjerm. Ikke bytt ut forest/lime for vanlige knapper.
 * TOKEN-SEMANTIKK (Paper bridge, 2026-08-09 — preflight):
 * - T.lime / --v2-lime = var(--p-cta) = INK #141413 på lys (IKKE Presis-lime).
 * - T.handling / --v2-handling = clay #D97757 = «Én ting nå»-monopolet.
 * - Neon AK-lime bare via T.farge.limeMerke (eller eksplisitt brand) — ikke T.lime.
 * - Se docs/port/PAPER-PREFLIGHT-CONFLICTS-2026-08-09.md
 */
export const T = {
  // Flater — lys default; mørk via data-v2-tema="dark"
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
  // Merkevare + signal (lys: lime-token = forest — aldri lime-på-lys CTA)
  forest: "var(--v2-forest)",
  forestSoft: "var(--v2-forest-soft)",
  // Tekst på forest-fyll (showroom: `.btn-forest { color: #fff }`) — hvit i
  // begge temaer, derfor ikke en CSS-var. Innkapslet her så komponentfilene
  // forblir hex-frie.
  onForest: "#FFFFFF",
  lime: "var(--v2-lime)",
  onLime: "var(--v2-on-lime)",
  // Paper aliases (tydelig semantikk — samme CSS-vars)
  cta: "var(--v2-lime)",           // ink CTA fill (#141413 lys)
  onCta: "var(--v2-on-lime)",
  onBrand: "#141413",
  // Paper rail / faner (alltid mørk chrome)
  rail: "var(--p-rail, #141413)",
  railFg: "var(--p-rail-fg, #b0aea5)",
  railOn: "var(--p-rail-on, #faf9f5)",
  // Primærhandling-monopol («Én ting nå») — C smalt, låst 2026-07-31
  handling: "var(--v2-handling)",
  onHandling: "var(--v2-on-handling)",
  handlingSoft: "var(--v2-handling-soft)",
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
  // Stripe sin merkelilla, brukt i betalings-illustrasjonen i klubb-onboarding.
  // Tredjeparts merkevare — skal IKKE temafarges, men bor her så skjermfila
  // holder seg hex-fri (lint-porten i scripts/check-token-gap.mjs).
  stripeMerke: "#635BFF",
  // Bakgrunnsgradienter + tekstfarger for stats-wrapped-slide/-player (delt
  // Spotify Wrapped-stil delekort). Faste farger uavhengig av tema — kortet
  // eksporteres som bilde og kan derfor IKKE lese var(--p-*). Verdiene er
  // Paper-palettens egne hex (steg 10, 2026-08-14): «forest» → blekk,
  // «lime» → clay. Navnene er beholdt fordi seks konsumenter bruker dem som
  // variant-nøkler; de beskriver nå posisjon i kortserien, ikke farge.
  wrapped: {
    bgForest: "linear-gradient(160deg, #141413 0%, #26241f 100%)",
    bgForestDark: "linear-gradient(160deg, #0e0d0c 0%, #000000 100%)",
    bgLime: "linear-gradient(160deg, #d97757 0%, #c6613f 100%)",
    bgOffwhite: "linear-gradient(160deg, #faf9f5 0%, #f0eee6 100%)",
    textOnDark: "#faf9f5",
    textOnLight: "#141413",
  } as const,
  // Typografi — Paper (Poppins / Lora / IBM Plex Mono via CSS vars)
  disp: "var(--p-disp, var(--font-display), system-ui, sans-serif)",
  ui: "var(--p-ui, var(--font-sans), system-ui, sans-serif)",
  bodyFont: "var(--p-font-serif, Georgia, serif)",
  mono: "var(--p-font-mono, var(--font-mono), ui-monospace, monospace)",
  // Fontskala (px — fra tokens.css)
  displayXl: 36,
  numHero: 56,
  numLg: 38,
  numMd: 26,
  body: 13.5,
  bodySm: 12,
  caps: 10,
  capsSm: 9,
  // Geometri — Paper: --r-sm 8, --r 12 (app), --r-md 16, sheet larger
  rTag: 8,
  rCard: 12,
  rRow: 12,
  // rInput = Paper --r-sm (8px, «knapper, felter, chips» — designport steg 5B).
  // Eneste konsument er src/components/v2/skjema.tsx (verifisert 03.08.2026),
  // så endringen er trygt avgrenset til skjema-familien.
  rInput: 8,
  rSheet: 28,
  rPill: 9999,
  gap: 16,
  maxw: 1120,
  // Skygge på valgt segment i segmentert kontroll (fasit: ikke lime, men løft)
  segSkygge: "var(--v2-seg-skygge)",
  // Sentraliserte fargeliteraler fra inline style (steg 6, 2026-08-03) — IKKE
  // tema-styrt, samme mønster som tee/milepael/wrapped over.
  //
  // NAVNENE LYVER (steg 10, 2026-08-14). `forestMerke*` og `limeMerke*` het
  // etter Presis-paletten. Verdiene er nå Paper: forest → blekk #141413,
  // lime → --p-up #63784A, med samme alfa som før. Navnene står igjen fordi
  // ~25 komponentfiler leser dem, og omdøping er en egen, mekanisk PR som
  // ikke skal blandes inn i en fargeport. Les alltid VERDIEN, ikke navnet.
  // Konsolidering til færre, tema-styrte navn er en egen designbeslutning.
  farge: {
    svartA50: "rgba(0,0,0,0.5)",
    svartA35: "rgba(0,0,0,0.35)",
    forestMerkeA20: "rgba(20,20,19,0.2)",
    svartA55: "rgba(0,0,0,0.55)",
    nestenSvartA62: "rgba(6,7,6,0.62)",
    hvitA75: "rgba(255,255,255,0.75)",
    hvitA5: "rgba(255,255,255,0.05)",
    forestMerkeA55: "rgba(20,20,19,0.55)",
    hvitA10: "rgba(255,255,255,0.1)",
    forestMerkeA14: "rgba(20,20,19,0.14)",
    hvitA85: "rgba(255,255,255,0.85)",
    hvitA70: "rgba(255,255,255,0.7)",
    hvitA60: "rgba(255,255,255,0.6)",
    svartA40: "rgba(0,0,0,0.4)",
    forestMerkeA6: "rgba(20,20,19,0.06)",
    hvitA6: "rgba(255,255,255,0.06)",
    hvitA12: "rgba(255,255,255,0.12)",
    linjeMerke: "#E5E3DD",
    svartA45: "rgba(0,0,0,0.45)",
    sandMerke: "#F1EEE5",
    hvitA96: "rgba(255,255,255,0.96)",
    hvitA15: "rgba(255,255,255,0.15)",
    illuForestMork: "#003A2A",
    forestMerkeA25: "rgba(20,20,19,0.25)",
    hvitA65: "rgba(255,255,255,0.65)",
    hvitA8: "rgba(255,255,255,0.08)",
    // Paper-krem på mørk rail — skillestreker og aktiv-flate i skallet.
    kremA8: "rgba(250,249,245,0.08)",
    kremA14: "rgba(250,249,245,0.14)",
    illuForestLys: "#006C50",
    noytralGra: "#908D86",
    hvitA90: "rgba(255,255,255,0.9)",
    hvitA14: "rgba(255,255,255,0.14)",
    limeMerkeA28: "rgba(99,120,74,0.28)",
    // Steg 10: Presis-navnene beholdt (mange konsumenter), Paper-verdier inn.
    // forestMerke var Presis-grønn → Paper-primær er blekk (--p-cta).
    forestMerke: "var(--p-cta)",
    sandLysA88: "rgba(250,250,247,0.88)",
    sandLysA80: "rgba(250,250,247,0.8)",
    hvitA50: "rgba(255,255,255,0.5)",
    illuOlivenLys: "#88B45A",
    illuOlivenMork: "#5E8538",
    svartA62: "rgba(0,0,0,0.62)",
    hvitA95: "rgba(255,255,255,0.95)",
    grafittMerkeA72: "rgba(13,14,13,0.72)",
    sandLysA90: "rgba(250,250,247,0.9)",
    hvitA55: "rgba(255,255,255,0.55)",
    // limeMerke var Presis-lime og bar «positiv/høydepunkt» → Paper --p-up.
    limeMerke: "var(--p-up)",
    myntGronnA18: "rgba(73,202,159,0.18)",
    taakeMerkeA85: "rgba(238,240,236,0.85)",
    myntLysA10: "rgba(79,208,138,0.1)",
    korallMerkeA10: "rgba(240,104,62,0.1)",
    grafittMerkeA0: "rgba(13,14,13,0)",
    grafittMerkeA55: "rgba(13,14,13,0.55)",
    varselMerkeA35: "rgba(232,180,60,0.35)",
    varselMerkeA8: "rgba(232,180,60,0.08)",
    inkMerkeA70: "rgba(10,31,23,0.7)",
    forestMerkeA22: "rgba(20,20,19,0.22)",
    svart: "#000000",
    forestMerkeA4: "rgba(20,20,19,0.04)",
    forestMerkeA18: "rgba(20,20,19,0.18)",
    rodMerkeA8: "rgba(216,57,57,0.08)",
    rodMerkeA25: "rgba(216,57,57,0.25)",
    forestVariant: "#006B4F",
    sandLysA70: "rgba(250,250,247,0.7)",
    inkMerkeA5: "rgba(10,31,23,0.05)",
    forestMerkeA70: "rgba(20,20,19,0.7)",
    sandLysA85: "rgba(250,250,247,0.85)",
    feilMerkeA8: "rgba(163,45,45,0.08)",
    feilMerkeA30: "rgba(163,45,45,0.3)",
    inkMerkeA6: "rgba(10,31,23,0.06)",
    forestMerkeA8: "rgba(20,20,19,0.08)",
    inkMerkeA10: "rgba(10,31,23,0.1)",
    forestMerkeA5: "rgba(20,20,19,0.05)",
    sandLysA78: "rgba(250,250,247,0.78)",
    hvitA92: "rgba(255,255,255,0.92)",
    hvitA98: "rgba(255,255,255,0.98)",
    hvitA7: "rgba(255,255,255,0.07)",
    hvitA88: "rgba(255,255,255,0.88)",
    hvitA40: "rgba(255,255,255,0.4)",
    hvitA28: "rgba(255,255,255,0.28)",
    hvitA35: "rgba(255,255,255,0.35)",
    limeMerkeA0: "rgba(99,120,74,0)",
    limeHover: "#C2EE2F",
    inkMerke2A62: "rgba(10,31,24,0.62)",
    kremMerkeA85: "rgba(245,244,238,0.85)",
    taakeMerkeA65: "rgba(238,240,236,0.65)",
    taakeMerkeA60: "rgba(238,240,236,0.6)",
    svartKode: "#111111",
    svartA18: "rgba(0,0,0,0.18)",
    svartA20: "rgba(0,0,0,0.2)",
    limeMerkeA10: "rgba(99,120,74,0.1)",
    grafittMerkeA15: "rgba(13,14,13,0.15)",
    grafittMerkeA85: "rgba(13,14,13,0.85)",
    himmelBlaA14: "rgba(90,169,240,0.14)",
    limeMerkeA12: "rgba(99,120,74,0.12)",
    svartA75: "rgba(0,0,0,0.75)",
    limeMerkeA35: "rgba(99,120,74,0.35)",
    limeMerkeA6: "rgba(99,120,74,0.06)",
    grafittMerkeA18: "rgba(13,14,13,0.18)",
    gullMerkeA10: "rgba(184,133,42,0.1)",
    gullMerkeA30: "rgba(184,133,42,0.3)",
    gullMerkeA40: "rgba(184,133,42,0.4)",
    liveBgKant: "#12271E",
    okMerke: "#1A7D56",
    offwhiteMerkeA65: "rgba(247,247,244,0.65)",
    offwhiteMerkeA45: "rgba(247,247,244,0.45)",
    suksessLys: "#84D2A5",
    varselBakgrunn: "#FEF3C7",
    varselTekst: "#78350F",
    inkMerkeA92: "rgba(10,31,23,0.92)",
    liveBgTopp: "#0D2218",
    inkMerke: "#0A1F17",
    hvitA18: "rgba(255,255,255,0.18)",
    hvitA82: "rgba(255,255,255,0.82)",
    myntLysA12: "rgba(79,208,138,0.12)",
    korallMerkeA30: "rgba(240,104,62,0.3)",
    varselMerkeA10: "rgba(232,180,60,0.1)",
    varselMerkeA30: "rgba(232,180,60,0.3)",
    myntLysA30: "rgba(79,208,138,0.3)",
    forestMerkeA35: "rgba(20,20,19,0.35)",
    hvitA4: "rgba(255,255,255,0.04)",
    hvitA80: "rgba(255,255,255,0.8)",
    grafittMerke2A0: "rgba(21,23,21,0)",
    varselMerkeA14: "rgba(232,180,60,0.14)",
    svartA10: "rgba(0,0,0,0.1)",
    inkMerkeA8: "rgba(10,31,23,0.08)",
    diagramOliven: "#8A9940",
    feilBakgrunn: "#FEE2E2",
    limeMerke2: "#B8E020",
    feilLys: "#F87171",
    feilTekstMork: "#7F1D1D",
    sandLysA30: "rgba(250,250,247,0.3)",
    inkMerkeA20: "rgba(10,31,23,0.2)",
    forestMerkeA16: "rgba(20,20,19,0.16)",
    forestMerkeA45: "rgba(20,20,19,0.45)",
    forestMerkeA60: "rgba(20,20,19,0.6)",
    grafittPanel: "#222522",
    hvitA22: "rgba(255,255,255,0.22)",
    svartA25: "rgba(0,0,0,0.25)",
  } as const,
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

/** Tom tallverdi i UI — alltid em-dash (fasit). */
export const TOM_TALL = "—";

/** Returner em-dash for null/undefined/tom streng; ellers verdien. */
export function fmtTall(v: number | string | null | undefined): string {
  if (v === null || v === undefined || v === "") return TOM_TALL;
  return String(v);
}
