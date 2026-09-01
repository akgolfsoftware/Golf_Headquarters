/**
 * Mapping-fil for Train-lock sign-off-riggen (scripts/train-lock-pixel-diff.mjs).
 *
 * Kartlegger data-screen-label (fasit) → app-rute → viewport → cropTop
 * (fasitens bakte-inn statuslinje, kun mobil-rammer med dynamic island har
 * dette — Mac-rammer har cropTop 0). Kun skjermer med `seedScript` satt har
 * en fixture som gir en meningsfull diff — resten er kartlagt, men ikke
 * kalibrert ennå (se README.md i denne mappa for hvorfor).
 */
export type SkjermMapping = {
  label: string;
  rute: string;
  tema: "dark" | "light";
  cropTop: number;
  /** Script som setter opp data slik at appen matcher fasitens tilstand. */
  seedScript?: string;
  /** Kjent, forventet gjenstående avvik etter kalibrering — se README. */
  kalibrertAvvikPst?: number;
  status: "kalibrert" | "kartlagt-ikke-kalibrert";
};

export const SKJERM_MAPPING: SkjermMapping[] = [
  {
    label: "PH-01 I dag",
    rute: "/portal",
    tema: "dark",
    cropTop: 54,
    seedScript: "scripts/seed-ph01-signoff-fixture.ts",
    kalibrertAvvikPst: 11.07,
    status: "kalibrert",
  },
  // De øvrige åtte skjermene fra px3/px4/ao-bølgene i scripts/signoff-trainlock.mjs
  // (TE-01, TM-04, TM-01, AO-01, AO-ko, AO-godkjenn, P-05, RU-04) har rute-mapping,
  // men INGEN fixture-seed ennå — å kjøre pixel-diff-piloten på dem nå vil vise
  // stort avvik fra ekte, useedet screentest-data, ikke fra portering. Se
  // README.md §Neste skjermer for oppskriften kalibrert av PH-01.
];
