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
 * Referanse: Mark Broadie, "Every Shot Counts" (2014).
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
 * Alle distanser i meter — PUTT-terskler er oppgitt i fot i Broadie (2014)
 * og konvertert her med konstanten FT_M (1 fot = 0,3048 m).
 */
type BenchmarkGroup = {
  /** Øvre grense for distanse-gruppen (meter), inklusiv */
  maxMeters: number;
  /** Forventet antall slag som kreves for å hule (fairway/green-snitt) */
  forventet: number;
};

/** 1 fot i meter */
const FT_M = 0.3048;

const BENCHMARK_OTT: ReadonlyArray<BenchmarkGroup> = [
  { maxMeters: 180, forventet: 3.7 },
  { maxMeters: 220, forventet: 3.8 },
  { maxMeters: 260, forventet: 3.85 },
  { maxMeters: 300, forventet: 3.95 },
  { maxMeters: 340, forventet: 4.05 },
  { maxMeters: 380, forventet: 4.15 },
  { maxMeters: 430, forventet: 4.3 },
  { maxMeters: Infinity, forventet: 4.5 },
];

const BENCHMARK_APP: ReadonlyArray<BenchmarkGroup> = [
  { maxMeters: 50, forventet: 2.55 },
  { maxMeters: 90, forventet: 2.75 },
  { maxMeters: 120, forventet: 2.9 },
  { maxMeters: 150, forventet: 3.0 },
  { maxMeters: 180, forventet: 3.15 },
  { maxMeters: 210, forventet: 3.3 },
  { maxMeters: 240, forventet: 3.5 },
  { maxMeters: Infinity, forventet: 3.75 },
];

const BENCHMARK_ARG: ReadonlyArray<BenchmarkGroup> = [
  { maxMeters: 3, forventet: 2.2 },
  { maxMeters: 6, forventet: 2.35 },
  { maxMeters: 10, forventet: 2.5 },
  { maxMeters: 15, forventet: 2.6 },
  { maxMeters: 20, forventet: 2.7 },
  { maxMeters: 25, forventet: 2.8 },
  { maxMeters: 30, forventet: 2.9 },
  { maxMeters: Infinity, forventet: 3.05 },
];

/** Broadie oppgir putt-terskler i fot; faktoren foran FT_M er fot-verdien. */
const BENCHMARK_PUTT: ReadonlyArray<BenchmarkGroup> = [
  { maxMeters: 1 * FT_M, forventet: 1.05 },
  { maxMeters: 2 * FT_M, forventet: 1.45 },
  { maxMeters: 3 * FT_M, forventet: 1.7 },
  { maxMeters: 5 * FT_M, forventet: 1.85 },
  { maxMeters: 8 * FT_M, forventet: 1.95 },
  { maxMeters: 12 * FT_M, forventet: 2.05 },
  { maxMeters: 18 * FT_M, forventet: 2.15 },
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
function kategoriEtterSlag(outcome: SgOutcome, distanceAfter: number): SgCategory {
  if (outcome === "GREEN") return "PUTT";
  if (distanceAfter <= 30) return "ARG";
  if (distanceAfter <= 180) return "APP";
  return "OTT";
}

/**
 * Beregner SG-verdien for ett enkelt slag.
 */
function beregnSgPerSlag(shot: SgShot): number {
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
