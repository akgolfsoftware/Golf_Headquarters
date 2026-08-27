/**
 * Månedsrutenett for AgencyOS-kalenderen (T7 / KA-02).
 *
 * Rene funksjoner uten Prisma. Datoer er ISO (YYYY-MM-DD) i UTC-kalenderdager
 * — samme «naiv veggklokke»-konvensjon som `kalender-lag.ts` (kalleren eier
 * tidssone). Ukedag regnes mandag-først via UTC, aldri rå `Date#getDay()`.
 */

export interface ManedsCelle {
  dato: string;
  iManed: boolean;
}

const DAGGER_I_MANED = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

const MANED_NB = [
  "januar",
  "februar",
  "mars",
  "april",
  "mai",
  "juni",
  "juli",
  "august",
  "september",
  "oktober",
  "november",
  "desember",
] as const;

function erSkuddaar(aar: number): boolean {
  return aar % 4 === 0 && (aar % 100 !== 0 || aar % 400 === 0);
}

export function dagerIManed(aar: number, maaned: number): number {
  if (maaned === 2 && erSkuddaar(aar)) return 29;
  return DAGGER_I_MANED[maaned - 1] ?? 0;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function manedNokkel(aar: number, maaned: number): string {
  return `${aar}-${pad2(maaned)}`;
}

/** `YYYY-MM` → { aar, maaned } eller null. */
export function parseManedParam(v?: string): { aar: number; maaned: number } | null {
  if (!v) return null;
  const m = /^(\d{4})-(\d{2})$/.exec(v);
  if (!m) return null;
  const aar = Number(m[1]);
  const maaned = Number(m[2]);
  if (maaned < 1 || maaned > 12) return null;
  return { aar, maaned };
}

export function skiftManed(aar: number, maaned: number, delta: number): { aar: number; maaned: number } {
  const idx = aar * 12 + (maaned - 1) + delta;
  const aarUt = Math.floor(idx / 12);
  const maanedUt = idx - aarUt * 12 + 1;
  return { aar: aarUt, maaned: maanedUt };
}

export function manedEtikett(aar: number, maaned: number): string {
  const navn = MANED_NB[maaned - 1] ?? "";
  const stor = navn.charAt(0).toUpperCase() + navn.slice(1);
  return `${stor} ${aar}`;
}

/**
 * Mandag-først rutenett som dekker hele måneden (5 eller 6 uker).
 * Celler utenfor måneden er med (forrige/neste) og merket `iManed: false`.
 */
export function manedsrutenett(aar: number, maaned: number): ManedsCelle[] {
  const antall = dagerIManed(aar, maaned);
  if (antall === 0) return [];
  // UTC-ukedag for den 1.: 0 = søn … 6 = lør. Mandag-først: 0 = man.
  const forsteUtcDag = new Date(Date.UTC(aar, maaned - 1, 1)).getUTCDay();
  const offset = (forsteUtcDag + 6) % 7;
  const start = new Date(Date.UTC(aar, maaned - 1, 1 - offset));
  const rader = Math.ceil((offset + antall) / 7);
  const ut: ManedsCelle[] = [];
  for (let i = 0; i < rader * 7; i++) {
    const d = new Date(start.getTime() + i * 86_400_000);
    const y = d.getUTCFullYear();
    const m = d.getUTCMonth() + 1;
    const dag = d.getUTCDate();
    ut.push({
      dato: `${y}-${pad2(m)}-${pad2(dag)}`,
      iManed: y === aar && m === maaned,
    });
  }
  return ut;
}
