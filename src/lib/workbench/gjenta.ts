/**
 * «Gjenta økt» i spillerens Workbench (PH-11-GJENTA, plan.html, godkjent 14.10.2026).
 *
 * Ren utregning av hvilke datoer en økt skal gjentas på. Selve lagringen gjør
 * `repeatSession` i wb-actions. Datoer er «YYYY-MM-DD» og regnes i UTC, så
 * sommertid aldri flytter en dag (gotchas §Tid og datoer).
 */

export type GjentaModus = "uke" | "annenhver" | "dager";

/** Øvre grense for hvor mange nye økter ett Gjenta kan lage. */
export const MAKS_GJENTATTE = 60;

const dag = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const iso = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const DOGN = 86_400_000;

/** 0 = mandag … 6 = søndag. */
export function ukedag(isoDato: string): number {
  return (new Date(dag(isoDato)).getUTCDay() + 6) % 7;
}

export type GjentaUtregning = {
  /** Datoene det legges inn en ny økt på (uten selve økta). */
  datoer: string[];
  /** Datoer som ble hoppet over fordi de krasjer med en konkurransedag. */
  hoppet: string[];
};

/**
 * Datoene etter `fra` (ikke med) til og med `slutt`.
 * - `uke`: samme ukedag hver uke.
 * - `annenhver`: samme ukedag annenhver uke.
 * - `dager`: valgte ukedager hver uke (0 = mandag).
 * `hopp` er datoer som ikke skal få økt (konkurransedager som er krysset av).
 */
export function beregnGjentaDatoer(input: {
  fra: string;
  modus: GjentaModus;
  slutt: string;
  ukedager?: readonly number[];
  hopp?: ReadonlySet<string>;
}): GjentaUtregning {
  const start = dag(input.fra);
  const slutt = dag(input.slutt);
  const datoer: string[] = [];
  const hoppet: string[] = [];
  if (!(slutt > start)) return { datoer, hoppet };
  const startUke = start - ukedag(input.fra) * DOGN;
  const valgte = new Set(input.modus === "dager" ? input.ukedager ?? [] : [ukedag(input.fra)]);
  for (let t = start + DOGN; t <= slutt && datoer.length < MAKS_GJENTATTE; t += DOGN) {
    const d = iso(t);
    if (!valgte.has(ukedag(d))) continue;
    const uker = Math.floor((t - startUke) / (7 * DOGN));
    if (input.modus === "annenhver" && uker % 2 !== 0) continue;
    if (input.hopp?.has(d)) { hoppet.push(d); continue; }
    datoer.push(d);
  }
  return { datoer, hoppet };
}
