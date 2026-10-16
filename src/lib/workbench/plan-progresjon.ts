/**
 * Plan med farge og progresjon (utkast 3, Anders 16.10.2026): rene regler for ringen,
 * ukesøylene og «I rute»-setningen i Måned, År og Periode. Ingen database.
 *
 * «Skulle vært gjort til nå» er det som er fordelt i ukene som er gått. Gjennomført telles
 * i de samme ukene, så en uke uten fordeling verken trekker opp eller ned.
 */

import type { PyramidArea } from "@/lib/domain/workbench/types";

export const AKSER: readonly PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];
export type Akser = Record<PyramidArea, number>;
export type DelAkser = Partial<Record<PyramidArea, number>> | null | undefined;

/** Andel av «skulle vært gjort» som regnes som i rute. */
export const I_RUTE_GRENSE = 0.9;

export const tomAkser = (): Akser => ({ FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });

export function sum(m: DelAkser): number {
  return AKSER.reduce((s, a) => s + (m?.[a] ?? 0), 0);
}

export function leggSammen(rader: readonly DelAkser[]): Akser {
  const ut = tomAkser();
  for (const r of rader) for (const a of AKSER) ut[a] += r?.[a] ?? 0;
  return ut;
}

/** Én desimal, for SVG-mål (ikke visning). */
export const avrund1 = (n: number) => Math.round(n * 10) / 10;

export function prosent(del: number, av: number): number | null {
  return av > 0 ? Math.round((del / av) * 100) : null;
}

function plussDager(iso: string, n: number): string {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

/** Uka er over når søndagen er før i dag. */
export const ukeErGatt = (weekStart: string, idag: string) => plussDager(weekStart, 6) < idag;
export const ukeErNa = (weekStart: string, idag: string) => weekStart <= idag && !ukeErGatt(weekStart, idag);

/**
 * Hva ringen og stolpene måles mot: det som er fordelt, eller det som er lagt inn når
 * ingenting er fordelt. Er begge tomme, er det ingenting å måle mot.
 */
export function velgGrunnlag(fordelt: Akser, lagtInn: Akser): { grunnlag: Akser; kilde: "fordelt" | "lagt inn" | null } {
  if (sum(fordelt) > 0) return { grunnlag: fordelt, kilde: "fordelt" };
  if (sum(lagtInn) > 0) return { grunnlag: lagtInn, kilde: "lagt inn" };
  return { grunnlag: tomAkser(), kilde: null };
}

/** Aksen med flest minutter. Null når alt er 0. */
export function hovedakse(m: DelAkser): PyramidArea | null {
  let best: PyramidArea | null = null;
  for (const a of AKSER) if ((m?.[a] ?? 0) > 0 && (best === null || (m?.[a] ?? 0) > (m?.[best] ?? 0))) best = a;
  return best;
}

export type TempoUke = { weekStart: string; fordelt: DelAkser; gjennomfort: number };
export type Tempo =
  | { status: "rute" | "bak"; gjort: number; skulle: number; gatteUker: number }
  | { status: "ukjent"; grunn: "ingen-gatt" | "ikke-fordelt"; gatteUker: number };

/** I rute når gjennomført i ukene som er gått er minst 90 % av det som var fordelt i dem. */
export function tempo(uker: readonly TempoUke[], idag: string): Tempo {
  const gatte = uker.filter((u) => ukeErGatt(u.weekStart, idag));
  if (gatte.length === 0) return { status: "ukjent", grunn: "ingen-gatt", gatteUker: 0 };
  const medFordeling = gatte.filter((u) => sum(u.fordelt) > 0);
  const skulle = medFordeling.reduce((s, u) => s + sum(u.fordelt), 0);
  if (skulle === 0) return { status: "ukjent", grunn: "ikke-fordelt", gatteUker: gatte.length };
  const gjort = medFordeling.reduce((s, u) => s + u.gjennomfort, 0);
  return { status: gjort >= skulle * I_RUTE_GRENSE ? "rute" : "bak", gjort, skulle, gatteUker: gatte.length };
}
