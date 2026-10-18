/**
 * Forbedringsområder på I dag (PH-01, utkast 4): de SG-kategoriene der spilleren taper mest,
 * snitt over de siste runder med Strokes Gained. Regler for nok data (runde 8, 28.09.2026):
 * under 4 runder ingen konklusjon; tee og innspill sikre fra 12 runder, nærspill og putting fra 24.
 * Ren funksjon, så regelen kan låses med test.
 */
export type SgRunde = { sgOtt: number | null; sgApp: number | null; sgArg: number | null; sgPutt: number | null };
export type Forbedringsomraade = {
  kode: "OTT" | "APP" | "ARG" | "PUTT";
  navn: string;
  akse: "slag";
  verdi: number;
  /** Eldst til nyest, for trendlinja. */
  trend: number[];
  runder: number;
  /** Null når tallet er sikkert; ellers antall runder som trengs. */
  forelopigTil: number | null;
};

const KATEGORIER = [
  { kode: "OTT", felt: "sgOtt", navn: "Utslag", sikker: 12 },
  { kode: "APP", felt: "sgApp", navn: "Innspill", sikker: 12 },
  { kode: "ARG", felt: "sgArg", navn: "Nærspill", sikker: 24 },
  { kode: "PUTT", felt: "sgPutt", navn: "Putting", sikker: 24 },
] as const;

export const MIN_RUNDER = 4;

/** `runder` er nyest først, slik databasen gir dem. Gir høyst `antall` områder der snittet er negativt. */
export function forbedringsomraader(runder: readonly SgRunde[], antall = 2): Forbedringsomraade[] {
  const ut: Forbedringsomraade[] = [];
  for (const k of KATEGORIER) {
    const verdier = runder.map((r) => r[k.felt]).filter((v): v is number => v != null && Number.isFinite(v));
    if (verdier.length < MIN_RUNDER) continue;
    const snitt = Math.round(verdier.reduce((s, v) => s + v, 0) / verdier.length * 10) / 10;
    if (snitt >= 0) continue;
    ut.push({ kode: k.kode, navn: k.navn, akse: "slag", verdi: snitt, trend: [...verdier].reverse(), runder: verdier.length,
      forelopigTil: verdier.length >= k.sikker ? null : k.sikker });
  }
  return ut.sort((a, b) => a.verdi - b.verdi).slice(0, antall);
}
