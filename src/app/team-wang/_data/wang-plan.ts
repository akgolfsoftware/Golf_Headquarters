// =========================================================================
// WANG Toppidrett Fredrikstad — felles dato- og kalenderhjelpere.
//
// Filen var tidligere sesongmodellen til den gamle fellessiden, med
// demoøkter og faste demohendelser. Den siden ble ikke lenger
// brukt av noen rute og er slettet (16.10.2026). Det som står igjen er
// bare navn, datohjelpere og sesongrekkefølgen som årsplanen og
// trenerflaten bruker. Ingen demoøkter skal legges inn her igjen:
// fellessiden leser årsplanen (arsplan-fasit-2026-27.ts), trenerflaten
// leser gruppas ekte data (hent-wang-gruppe.ts).
//
// Deterministisk: all dato-aritmetikk skjer i UTC på faste konstanter.
// =========================================================================

export const MONTHS_NO = [
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
];
export const MON_SHORT = [
  "jan",
  "feb",
  "mar",
  "apr",
  "mai",
  "jun",
  "jul",
  "aug",
  "sep",
  "okt",
  "nov",
  "des",
];
export const WD_SHORT = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];

function pad(n: number): string {
  return n < 10 ? "0" + n : "" + n;
}

/** ISO-dato ('YYYY-MM-DD') → Date ved UTC-midnatt (tidssone-uavhengig). */
export function d(isoStr: string): Date {
  return new Date(isoStr + "T00:00:00Z");
}

export function iso(dt: Date): string {
  return (
    dt.getUTCFullYear() +
    "-" +
    pad(dt.getUTCMonth() + 1) +
    "-" +
    pad(dt.getUTCDate())
  );
}

export const SPAN_START_ISO = "2026-08-10";

export type WangFarge =
  "navy" | "teal" | "mint" | "blue" | "orange" | "purple" | "pink" | "gray";

/** [månedsindeks 0–11, år] i sesongrekkefølge aug 2026 → jul 2027. */
export const MONTH_ORDER: [number, number][] = [
  [7, 2026],
  [8, 2026],
  [9, 2026],
  [10, 2026],
  [11, 2026],
  [0, 2027],
  [1, 2027],
  [2, 2027],
  [3, 2027],
  [4, 2027],
  [5, 2027],
  [6, 2027],
];
