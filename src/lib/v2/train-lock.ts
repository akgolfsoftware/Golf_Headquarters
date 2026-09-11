/**
 * Train-locks TypeScript-navn peker på CSS-variabler; verdiene dupliseres ikke.
 * Basis: src/styles/train-lock-tokens.css (eldre flater).
 * Valgt PlayerHQ/AgencyOS: src/styles/train-lock-valgt.css, ZIP (4), 10.09.2026.
 * Kilde: designsystem/train-lock/valgt-zip-4/README.md.
 * Basislagets historiske kilder beholdes for sporbarhet:
 * - AG-00 LOCK.dc.html: PlayerHQ/AgencyOS delte verdier før valgt v3.
 * - B4 Lys iPad Mac.dc.html: basislagets lyse variant på større skjermer.
 * - MAT-01 Mac Okt FYS hero.dc.html: opphavet til FYS-fotofeltet; ikke bevis
 *   på at denne referansen eller den nye v3-fotovarianten er visuelt kontrollert.
 *
 * Appen har én temamekanisme, html[data-v2-tema="dark"]. Markøren
 * data-train-lock="4" avgrenser valgt versjon til /portal og /admin.
 * Et oppdatert tokenlag er ikke bevis på at alle skjermene er portert.
 * Se docs/design-audit/portering-fire-flater-2026-09-10.md for avvik og kontroll.
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
  /** v3: fremdrift og «nå» som grafikk. Liten tekst bruker warmText.
   * Fullført kan bruke den nye StatusPill sin ok-variant; eldre skjermer
   * med warm-fullføring vurderes under porteringen av hver familie. */
  warm: "var(--tl-warm)",
  /** v3: warm-ink på hvite kort. På lys papirbakgrunn brukes warmText. */
  warmInk: "var(--tl-warm-ink, var(--tl-warm))",
  /** Liten tekst på både scene og kort; nøytral i lys for lesbarhet. */
  warmText: "var(--tl-warm-text, var(--tl-warm))",
  warmTint: "var(--tl-warm-tint, transparent)",
  shadowCard: "var(--tl-shadow-card, none)",
  photoOpacity: "var(--tl-photo-opacity, 1)",
  glow: "var(--tl-glow, none)",
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
