/**
 * FYS-score — fysisk testbatteri → én samlet score (Anders 2026-06-22, v1).
 *
 * Fem tester, ulike enheter, kombineres slik:
 *   1. STYRKELØFT relativt til kroppsvekt: markløft + benkpress → kg løftet ÷ kroppsvekt.
 *      Lengde, ballkast og CHS brukes ABSOLUTT (Anders' valg 2026-06-22).
 *   2. STALL-RELATIV normalisering (v1): hver (ev. kroppsvekt-justerte) verdi gjøres om til
 *      0–100 mot stallen — beste i stallen = 100, proporsjonalt nedover. Selvkalibrerende,
 *      ingen hardkodede referanseverdier (= bryter ikke «ikke fabrikér referanseverdier»).
 *   3. VEKTET SNITT med Anders' vekter:
 *        markløft 100 % · benkpress 100 % · stille lengde 50 % · ballkast knestående 16,6 % · CHS 100 %
 *      FYS = Σ(vekt · delscore) ÷ Σ(vekt) for testene som er logget (manglende test re-vektes bort).
 *
 * v1-forbehold: stall-relativ = relativ, ikke absolutt form. Faste mål-verdier (per test eller
 * per A–K-kategori) kan erstatte normaliseringen senere uten å endre vektene. Høyere = bedre i alle.
 */

export type FysTestKey = "markloft" | "benkpress" | "lengde" | "ballkast" | "chs";

/** Anders' vekter (2026-06-22). */
export const FYS_VEKTER: Record<FysTestKey, number> = {
  markloft: 1.0, // Trapbarmarkløft (kg) · 100 %
  benkpress: 1.0, // Benkpress (kg) · 100 %
  lengde: 0.5, // Stille lengde (cm) · 50 %
  ballkast: 0.166, // Ballkast knestående (cm) · 16,6 %
  chs: 1.0, // CHS (TM inne) MPH · 100 %
};

/** Hvilke tester justeres relativt til kroppsvekt (styrkeløft). */
export const KROPPSVEKT_RELATIV: Record<FysTestKey, boolean> = {
  markloft: true,
  benkpress: true,
  lengde: false,
  ballkast: false,
  chs: false,
};

/** Én spillers rå testverdier (null = ikke logget). */
export type FysRaw = Record<FysTestKey, number | null> & {
  /** Kroppsvekt (kg) — kreves for styrkeløftene; null gjør dem ekskludert. */
  kroppsvektKg: number | null;
};

/** Stall-spenn (min/max) per test, beregnet over JUSTERTE verdier (etter kroppsvekt). */
export type FysStallSpenn = Record<FysTestKey, { min: number; max: number } | null>;

/** Justert verdi for en test (styrkeløft ÷ kroppsvekt; ellers rå). null hvis mangler data. */
export function justertVerdi(raw: FysRaw, key: FysTestKey): number | null {
  const v = raw[key];
  if (v == null) return null;
  if (KROPPSVEKT_RELATIV[key]) {
    if (raw.kroppsvektKg == null || raw.kroppsvektKg <= 0) return null;
    return v / raw.kroppsvektKg;
  }
  return v;
}

/** Stall-relativ delscore 0–100 (beste i stallen = 100, proporsjonalt). null hvis ikke beregnbar. */
export function delscore(justert: number | null, spenn: { min: number; max: number } | null): number | null {
  if (justert == null || spenn == null || spenn.max <= 0) return null;
  return Math.max(0, Math.min(100, Math.round((justert / spenn.max) * 100)));
}

export type FysResultat = {
  /** Samlet FYS-score 0–100 (vektet snitt), eller null hvis ingen tester logget. */
  score: number | null;
  /** Delscore per test (0–100 eller null). */
  delscorer: Record<FysTestKey, number | null>;
  /** Antall tester som inngikk. */
  antallTester: number;
};

const ALLE_KEYS: FysTestKey[] = ["markloft", "benkpress", "lengde", "ballkast", "chs"];

/** Beregn samlet FYS-score for én spiller gitt stall-spennet. */
export function fysScore(raw: FysRaw, spenn: FysStallSpenn): FysResultat {
  const delscorer = {} as Record<FysTestKey, number | null>;
  let vektetSum = 0;
  let vektSum = 0;
  let antall = 0;

  for (const key of ALLE_KEYS) {
    const ds = delscore(justertVerdi(raw, key), spenn[key]);
    delscorer[key] = ds;
    if (ds != null) {
      vektetSum += FYS_VEKTER[key] * ds;
      vektSum += FYS_VEKTER[key];
      antall += 1;
    }
  }

  return {
    score: vektSum > 0 ? Math.round(vektetSum / vektSum) : null,
    delscorer,
    antallTester: antall,
  };
}

/** Hjelper: bygg stall-spenn fra alle spilleres justerte verdier. */
export function byggStallSpenn(alleRaw: FysRaw[]): FysStallSpenn {
  const spenn = {} as FysStallSpenn;
  for (const key of ALLE_KEYS) {
    const verdier = alleRaw
      .map((r) => justertVerdi(r, key))
      .filter((v): v is number => v != null);
    spenn[key] = verdier.length > 0
      ? { min: Math.min(...verdier), max: Math.max(...verdier) }
      : null;
  }
  return spenn;
}
