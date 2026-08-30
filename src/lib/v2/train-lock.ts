/**
 * AK Golf HQ · Train-lock — TS-speil av --tl-* (D2, 25.08.2026).
 *
 * Verdiene bor som CSS-variabler i src/styles/train-lock-tokens.css:
 * LYS på :root, MØRK via html[data-v2-tema="dark"] (appens eneste
 * tema-mekanisme). Denne fila peker BARE på var(--tl-*) — den dupliserer
 * ingen hex, slik at scripts/check-token-gap.mjs slipper en allowlist og
 * fasiten har nøyaktig ett sted å endres.
 *
 * FASIT: designsystem/train-lock/ (HANDOFF.md · TRAIN LOCK.dc.html ·
 * AG-00 LOCK.dc.html · AX-01 Skall rail og tabbar.dc.html ·
 * GAP-00 Kart.dc.html · MAT-00 Materialer.dc.html).
 * Train-lock er designfasit for ALLE skjermer i PlayerHQ OG AgencyOS
 * (CLAUDE.md invariant 2). AG-00 viser at AgencyOS arver samme tokens —
 * derfor ett objekt, ikke to. GAP-00 er IKKE en skjerm — det er
 * Paper→Train-ID-kartet (hvilken gammel Paper-jobb som bor hvor nå, hvilken
 * bølge den hører til). Referert her fordi denne fila er det naturlige
 * skjerm-ID-krysspunktet i kode; ingen UI bygges av GAP-00 selv (PX-7,
 * 29.08.2026).
 * MAT-00 er materiale-spesimen (logo-prikk, Fullført-hake, pyramide-
 * streker, foto-stripe), ikke en skjerm — reglene den viser ER allerede
 * håndhevet mekanisk her og i CLAUDE.md invariant 2 («Fullført = warm
 * TL.warm + hake. TL.ok er BARE godkjent-av-coach»), verifisert PX-7 mot
 * OktArk.tsx (`session.status === "COMPLETED" ? TL.warm : …`). MAT-01
 * (Mac Økt FYS hero-foto) er IKKE portert — hero-foto på øktvisning finnes
 * ikke i koden ennå og er ny UI utover tilstand/brekk, se PR-beskrivelsen.
 *
 * FORHOLD TIL T (src/lib/v2/tokens.ts): T er Paper-speilet og er UTGÅENDE.
 * Det står urørt så lenge skjermene fortsatt leser det. Ny Train-lock-kode
 * bruker TL. Ingen skjerm er portet i D2 — TL har null konsumenter ennå.
 *
 * REGLER SOM FØLGER MED TOKENENE (fra fasiten, ikke smak):
 * - Én hvit (lys: sort) primær CTA per skjerm. Alt annet er dim eller ren
 *   tekst. Aktiv fane / valgt dag / aktiv live-tapper er TILSTAND, ikke CTA.
 * - Fullført = TL.warm + hake. TL.ok er BARE «godkjent av coach»
 *   (Godta / PUBLISERT-merke). TL.danger er BARE feiltilstander.
 * - Material er opaque. Ingen backdrop-filter, ingen Liquid Glass.
 * - Ingen linear/radial-gradient. `repeating-linear-gradient` er tillatt
 *   KUN som timeline-hairline i rutenett.
 * - Negativ verdi = samme tekstfarge med opasitet + fortegn i tallet.
 *   Aldri rød, aldri fargekodet ferdighet, aldri heatmap/radar/lime.
 * - tabular-nums på alle tall. Norsk format: 1 000,00 · +0,18 ·
 *   22.08.2026 · 09.00.
 *
 * LYS PÅ TVERS AV SKJERMER (B3/B4, PX-7 2026-08-29 — full begrunnelse i
 * src/styles/train-lock-tokens.css-headeren). Fasit:
 * - designsystem/train-lock/B3 Lys nøkkelskjermer.dc.html
 * - designsystem/train-lock/B3 Lys resterende skjermer.dc.html
 * - designsystem/train-lock/B4 Lys iPad Mac.dc.html
 * Lys/mørk er ÉN mekanisme — enhver skjerm som leser TL/--tl-* får korrekt
 * lys automatisk, uansett brekkpunkt. Repo-bred grep (PX-7) fant ingen nye
 * hardkodet-mørk-lekkasjer utover det C8 (#636) allerede dokumenterte.
 */
export const TL = {
  // ── Flater ──
  scene: "var(--tl-scene)",
  elev: "var(--tl-elev)",
  dock: "var(--tl-dock)",
  hair: "var(--tl-hair)",
  dim: "var(--tl-dim)",

  // ── Tekst ──
  text: "var(--tl-text)",
  mute: "var(--tl-mute)",
  textHover: "var(--tl-text-hover)",

  // ── Handling (én primær per skjerm) ──
  fill: "var(--tl-fill)",
  onFill: "var(--tl-on-fill)",

  // ── Identitet ──
  avatar: "var(--tl-avatar)",
  onAvatar: "var(--tl-on-avatar)",
  /** Logo-prikk + fullført-hake/ring. Fullført er ALDRI grønn.
   *  Fasit: designsystem/train-lock/MAT-00 Materialer.dc.html +
   *  MAT-01 Mac Okt FYS hero.dc.html (PX-7, 2026-08-29) — logo-prikk 64/28/16,
   *  fullført = hake + 1px varm ring (aldri grønn fylt flate), pyramide-
   *  streker er posisjon (F5F5F5 aktiv / 2C2C2E resten), ikke farge, og foto
   *  får bare bredde på FYS/hero — aldri bak tall. */
  warm: "var(--tl-warm)",
  /** Varsel som IKKE sperrer (publiser med advarsel, «mangler drill»). Aldri generell fargekoding. */
  warn: "var(--tl-warn)",
  /** Kant på warn-pille: `inset 0 0 0 1px TL.warnHair`. */
  warnHair: "var(--tl-warn-hair)",

  // ── Signal (smal bruk — se filhodet) ──
  danger: "var(--tl-danger)",
  ok: "var(--tl-ok)",
  /** Tekst på en danger-flate (Kø-badge). */
  onDanger: "var(--tl-on-danger)",

  // ── Utkast / ark ──
  draftBorder: "var(--tl-draft-border)",
  grabber: "var(--tl-grabber)",
  scrim: "var(--tl-scrim)",

  /** Geometri — TRAIN LOCK §03. */
  radius: {
    card: "var(--tl-r-card)",
    pill: "var(--tl-r-pill)",
    row: "var(--tl-r-row)",
    field: "var(--tl-r-field)",
    sheet: "var(--tl-r-sheet)",
  },
  /** Loft — fasitens fire avstandstrinn. */
  loft: {
    s1: "var(--tl-loft-1)",
    s2: "var(--tl-loft-2)",
    s3: "var(--tl-loft-3)",
    s4: "var(--tl-loft-4)",
  },
  /** Treffmål. */
  tap: {
    min: "var(--tl-tap)",
    cta: "var(--tl-tap-cta)",
    capture: "var(--tl-tap-capture)",
  },
  /** Skall — dock, rail, kolonner. */
  skall: {
    dockH: "var(--tl-dock-h)",
    dockW: "var(--tl-dock-w)",
    dockPad: "var(--tl-dock-pad)",
    dockLift: "var(--tl-dock-lift)",
    railMac: "var(--tl-rail-mac)",
    railPlayerMac: "var(--tl-rail-player-mac)",
    skinneIpad: "var(--tl-skinne-ipad)",
    artefakt: "var(--tl-artefakt)",
    kilder: "var(--tl-kilder)",
  },

  /** Type — TRAIN LOCK §02. Vekt/tracking står i `vekt`/`track`. */
  font: {
    sans: "var(--tl-font-sans)",
    mono: "var(--tl-font-mono)",
  },
  storrelse: {
    tittel: "var(--tl-text-title)",
    kortTittel: "var(--tl-text-card)",
    cta: "var(--tl-text-cta)",
    kropp: "var(--tl-text-body)",
    meta: "var(--tl-text-meta)",
    caps: "var(--tl-text-caps)",
    capsSm: "var(--tl-text-caps-sm)",
    tallMin: "var(--tl-text-num-min)",
    tallMax: "var(--tl-text-num-max)",
  },
  /** Dynamic Type XL (PH-01): tekst bryter, klippes aldri; CTA vokser i høyde. */
  storrelseXL: {
    tittel: "var(--tl-text-title-xl)",
    kortTittel: "var(--tl-text-card-xl)",
    cta: "var(--tl-text-cta-xl)",
    kropp: "var(--tl-text-body-xl)",
    meta: "var(--tl-text-meta-xl)",
    caps: "var(--tl-text-caps-xl)",
  },
  /** Vekt per rolle — fasitens «34/700»-notasjon. */
  vekt: {
    tittel: 700,
    kortTittel: 700,
    cta: 700,
    kropp: 600,
    meta: 400,
    caps: 600,
    tall: 700,
  },
  track: {
    tittel: "var(--tl-track-title)",
    kortTittel: "var(--tl-track-card)",
    caps: "var(--tl-track-caps)",
    capsSm: "var(--tl-track-caps-sm)",
  },

  /** Motion — kun transform + opacity, aldri left/top. */
  motion: {
    ease: "var(--tl-ease)",
    press: "var(--tl-dur-press)",
    reduced: "var(--tl-dur-reduced)",
    dock: "var(--tl-dur-dock)",
    ark: "var(--tl-dur-sheet)",
    kort: "var(--tl-dur-card)",
    stagger: "var(--tl-stagger-card)",
    pressScale: "var(--tl-press-scale)",
    kortInnY: "var(--tl-card-in-y)",
  },

  /** Tilstand er opasitet, aldri farge. */
  opasitet: {
    negativ: "var(--tl-op-negativ)",
    outlier: "var(--tl-op-outlier)",
    muted: "var(--tl-op-muted)",
    sekundaer: "var(--tl-op-sekundaer)",
  },

  /**
   * Viz — de fire signalfargene brukes KUN i dispersion-bøtter, mållinje og
   * publisert-merke. Ikke generell fargekoding.
   */
  viz: {
    target: "var(--tl-viz-target)",
    good: "var(--tl-viz-good)",
    acceptable: "var(--tl-viz-acceptable)",
    disaster: "var(--tl-viz-disaster)",
    dot: "var(--tl-viz-dot)",
    ellipseLine: "var(--tl-viz-ellipse-line)",
    ellipseFill: "var(--tl-viz-ellipse-fill)",
  },
  /** Hullkart — stilisert, aldri satellitt/3D/grønt. */
  bane: {
    base: "var(--tl-course-base)",
    rough: "var(--tl-course-rough)",
    fairway: "var(--tl-course-fairway)",
    green: "var(--tl-course-green)",
    fringe: "var(--tl-course-fringe)",
    bunker: "var(--tl-course-bunker)",
    tee: "var(--tl-course-tee)",
  },
} as const;

/**
 * Brekkpunkter — HANDOFF §Skall / brekkpunkter. Chrome følger VINDUSBREDDEN,
 * aldri enheten (iPad multitasking: halv → skinne, tredjedel → tab bar
 * øverst, kvadrant → dock nederst).
 */
export const TL_BREKK = {
  /** Telefon 390×844 / 393×852: dock nederst, composer over dock (I dag). */
  compact: 390,
  /** iPad smal (768 stående): tab bar øverst, én kolonne 560. */
  ipadSmal: 768,
  /** iPad regular (1180×820): skinne 250, split liste|detalj inni rommet. */
  ipadRegular: 1180,
  /** AgencyOS Mac-rail overtar fra 1101 (HANDOFF §Meny per enhet). */
  macRail: 1101,
  /** Mac 1440×900: rail + innhold + artefakt-panel 380. */
  mac: 1440,
} as const;
