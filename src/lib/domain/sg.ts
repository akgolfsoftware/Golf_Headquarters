/**
 * Strokes Gained-beregning mot PGA Tour Top 40-benchmarks.
 *
 * Forenklet implementasjon for beta:
 *  - 4 SG-kategorier: OTT (off-the-tee), APP (approach), ARG (around-the-green), PUTT
 *  - Bare PGA Top 40-benchmarks (utvides senere med A1, A2, B1, B2)
 *  - 8 distansegrupper per kategori
 *
 * SG-verdien for et slag = benchmark for startposisjon
 *                          − benchmark for sluttposisjon
 *                          − 1 (slaget selv)
 *
 * Totalen er summen av SG-verdier per kategori.
 *
 * Referanser: Team Norway IUP Ref-ark 2025 (putting) + Mark Broadie, "Every Shot Counts" (2014).
 */

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type SgCategory = "OTT" | "APP" | "ARG" | "PUTT";

export type SgOutcome = "FAIRWAY" | "ROUGH" | "GREEN" | "SAND" | "RECOVERY" | "HOLED";

export type SgShot = {
  /** Hvilken kategori dette slaget tilhører */
  category: SgCategory;
  /** Distanse fra hull (meter) ved start av slaget */
  distance: number;
  /** Hvor slaget endte opp */
  outcome: SgOutcome;
  /** Distanse fra hull etter slaget (meter) — null hvis HOLED */
  distanceAfter?: number | null;
};

export type SgResultat = {
  /** SG off-the-tee (driving) */
  ott: number;
  /** SG approach (innspill) */
  app: number;
  /** SG around-the-green (chip/pitch/bunker) */
  arg: number;
  /** SG putting */
  putt: number;
  /** Sum av alle SG-kategorier */
  total: number;
};

// ---------------------------------------------------------------------------
// Benchmark-tabeller (PGA Tour Top 40)
// ---------------------------------------------------------------------------

/**
 * Forventet antall slag for å fullføre hullet fra gitt posisjon.
 * 8 distansegrupper per kategori, basert på PGA Top 40-snitt.
 *
 * Alle distanser i meter.
 */
type BenchmarkGroup = {
  /** Øvre grense for distanse-gruppen (meter), inklusiv */
  maxMeters: number;
  /** Forventet antall slag som kreves for å hule (fairway/green-snitt) */
  forventet: number;
};

/*
 * KALIBRERING (2026-06-10, Anders-godkjent):
 *  - PUTT: Team Norway IUP Ref-ark (team-norway-iup-2025.xlsx · «Ref») —
 *    meter-intervaller 0–18 m, NGF/Team Norway-fasit. 1 m → 1,13 (var 1,85!).
 *  - OTT/APP/ARG: Mark Broadie, "Every Shot Counts" (2014), PGA Tour-baseline,
 *    interpolert fra yards til meter-gruppene under.
 *
 * VISNINGSENHET PUTT (bekreftet av Anders 2026-07-06): putt-avstand vises i FOT
 * i alt brukergrensesnitt — meter kan vises som forklaring, ikke som standard.
 * Dette er kun en visningsregel: BENCHMARK_PUTT under forblir meter-indeksert
 * (datakilden er meter-basert), ingen re-kalibrering av forventet-slag-verdiene.
 * Konverter med `meterTilFot()` fra src/lib/min-golf/format.ts ved visning —
 * ikke dupliser konverteringen her.
 */

const BENCHMARK_OTT: ReadonlyArray<BenchmarkGroup> = [
  { maxMeters: 120, forventet: 3.0 },
  { maxMeters: 150, forventet: 3.1 },
  { maxMeters: 180, forventet: 3.22 },
  { maxMeters: 220, forventet: 3.36 },
  { maxMeters: 260, forventet: 3.55 },
  { maxMeters: 300, forventet: 3.74 },
  { maxMeters: 340, forventet: 3.9 },
  { maxMeters: 380, forventet: 4.06 },
  { maxMeters: 430, forventet: 4.33 },
  { maxMeters: Infinity, forventet: 4.7 },
];

const BENCHMARK_APP: ReadonlyArray<BenchmarkGroup> = [
  { maxMeters: 30, forventet: 2.5 },
  { maxMeters: 50, forventet: 2.66 },
  { maxMeters: 70, forventet: 2.74 },
  { maxMeters: 90, forventet: 2.79 },
  { maxMeters: 110, forventet: 2.85 },
  { maxMeters: 130, forventet: 2.9 },
  { maxMeters: 150, forventet: 2.99 },
  { maxMeters: 170, forventet: 3.11 },
  { maxMeters: 190, forventet: 3.22 },
  { maxMeters: 210, forventet: 3.36 },
  { maxMeters: 240, forventet: 3.53 },
  { maxMeters: Infinity, forventet: 3.7 },
];

const BENCHMARK_ARG: ReadonlyArray<BenchmarkGroup> = [
  { maxMeters: 3, forventet: 2.18 },
  { maxMeters: 6, forventet: 2.28 },
  { maxMeters: 10, forventet: 2.36 },
  { maxMeters: 15, forventet: 2.45 },
  { maxMeters: 20, forventet: 2.51 },
  { maxMeters: 25, forventet: 2.57 },
  { maxMeters: 30, forventet: 2.62 },
  { maxMeters: Infinity, forventet: 2.75 },
];

/** Team Norway IUP Ref-ark — forventede slag per putt-avstand (meter). */
const BENCHMARK_PUTT: ReadonlyArray<BenchmarkGroup> = [
  { maxMeters: 0.9, forventet: 1.04 },
  { maxMeters: 1.2, forventet: 1.13 },
  { maxMeters: 1.5, forventet: 1.23 },
  { maxMeters: 1.8, forventet: 1.34 },
  { maxMeters: 2.1, forventet: 1.42 },
  { maxMeters: 2.4, forventet: 1.5 },
  { maxMeters: 2.7, forventet: 1.56 },
  { maxMeters: 3.0, forventet: 1.61 },
  { maxMeters: 4.5, forventet: 1.78 },
  { maxMeters: 6.0, forventet: 1.87 },
  { maxMeters: 9.0, forventet: 1.98 },
  { maxMeters: 12.0, forventet: 2.06 },
  { maxMeters: 15.0, forventet: 2.14 },
  { maxMeters: 18.0, forventet: 2.21 },
  { maxMeters: Infinity, forventet: 2.3 },
];

// ---------------------------------------------------------------------------
// Internfunksjoner
// ---------------------------------------------------------------------------

function velgBenchmark(category: SgCategory): ReadonlyArray<BenchmarkGroup> {
  switch (category) {
    case "OTT":
      return BENCHMARK_OTT;
    case "APP":
      return BENCHMARK_APP;
    case "ARG":
      return BENCHMARK_ARG;
    case "PUTT":
      return BENCHMARK_PUTT;
  }
}

function forventetSlag(category: SgCategory, distance: number): number {
  const tabell = velgBenchmark(category);
  for (const gruppe of tabell) {
    if (distance <= gruppe.maxMeters) {
      return gruppe.forventet;
    }
  }
  // Aldri her — siste gruppe har Infinity.
  return tabell[tabell.length - 1].forventet;
}

/**
 * Etter et slag fortsetter spillet i en ny kategori (basert på outcome og distanse).
 * For en forenklet SG-beregning kategoriserer vi sluttposisjonen slik:
 *  - HOLED → 0 (intet gjenstår)
 *  - distanceAfter ≤ 30 m og outcome GREEN → PUTT
 *  - distanceAfter ≤ 30 m → ARG
 *  - distanceAfter ≤ 180 m → APP
 *  - distanceAfter > 180 m → OTT
 */
export function kategoriEtterSlag(outcome: SgOutcome, distanceAfter: number): SgCategory {
  if (outcome === "GREEN") return "PUTT";
  if (distanceAfter <= 30) return "ARG";
  if (distanceAfter <= 180) return "APP";
  return "OTT";
}

/**
 * Beregner SG-verdien for ett enkelt slag (uavrundet).
 * Eksportert for runde-logg (granulære SG-buckets trenger per-slag-verdier
 * uten mellom-avrunding — beregnSg avrunder kun kategoritotalene).
 */
export function beregnSgPerSlag(shot: SgShot): number {
  const startForventet = forventetSlag(shot.category, shot.distance);

  if (shot.outcome === "HOLED" || shot.distanceAfter == null || shot.distanceAfter <= 0) {
    // Slaget gikk i hullet — SG = startForventet − 1
    return startForventet - 1;
  }

  const sluttKategori = kategoriEtterSlag(shot.outcome, shot.distanceAfter);
  const sluttForventet = forventetSlag(sluttKategori, shot.distanceAfter);

  // SG = start-forventning − slutt-forventning − 1 (slaget selv)
  return startForventet - sluttForventet - 1;
}

// ---------------------------------------------------------------------------
// Eksporterte funksjoner
// ---------------------------------------------------------------------------

/**
 * Beregner totalt SG per kategori og samlet.
 *
 * @example
 *   beregnSg([
 *     { category: "OTT", distance: 350, outcome: "FAIRWAY", distanceAfter: 100 },
 *     { category: "APP", distance: 100, outcome: "GREEN", distanceAfter: 3 },
 *     { category: "PUTT", distance: 3, outcome: "HOLED", distanceAfter: 0 },
 *   ])
 *   // → { ott, app, arg, putt, total }
 */
export function beregnSg(shots: ReadonlyArray<SgShot>): SgResultat {
  let ott = 0;
  let app = 0;
  let arg = 0;
  let putt = 0;

  for (const shot of shots) {
    const sg = beregnSgPerSlag(shot);
    switch (shot.category) {
      case "OTT":
        ott += sg;
        break;
      case "APP":
        app += sg;
        break;
      case "ARG":
        arg += sg;
        break;
      case "PUTT":
        putt += sg;
        break;
    }
  }

  // Avrund til 2 desimaler for å unngå floating-point-støy
  const rund = (n: number): number => Math.round(n * 100) / 100;

  return {
    ott: rund(ott),
    app: rund(app),
    arg: rund(arg),
    putt: rund(putt),
    total: rund(ott + app + arg + putt),
  };
}

/**
 * Formaterer en SG-verdi til norsk visningsformat med eksplisitt fortegn.
 *
 * @example
 *   formaterSg(1.234)  → "+1,2"
 *   formaterSg(-0.78)  → "-0,8"
 *   formaterSg(0)      → "0,0"
 */
export function formaterSg(sg: number): string {
  const avrundet = Math.round(sg * 10) / 10;
  if (avrundet === 0) return "0,0";
  const abs = Math.abs(avrundet).toFixed(1).replace(".", ",");
  return avrundet > 0 ? `+${abs}` : `-${abs}`;
}
