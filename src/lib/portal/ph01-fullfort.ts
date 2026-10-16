/**
 * PH-01 «Fullførte økter mot plan» (Precision Athletics, runde 20):
 * uker på rad over 70 % og milepæler for totalt antall gjennomførte økter.
 * Ren beregning — laster ligger i ph01-data.ts.
 */
import { startOfWeek, ukenummer } from "@/lib/uke-helpers";

export const FULLFORT_TERSKEL = 0.7;
export const MILEPAELER = [10, 50, 100] as const;

export type OktStatus = { dato: Date; status: string };
export type Milepael = { antall: number; naadd: Date | null };
export type FullfortHistorikk = {
  total: number;
  forste: Date | null;
  milepaeler: Milepael[];
  /** Hele uker på rad før inneværende uke med minst 70 % gjennomført. */
  rekke: number;
  /** Ukenumrene rekka dekker, eldste først (tom når rekka er 0). */
  rekkeUker: { fra: number; til: number } | null;
};

const TELLER = new Set(["PLANNED", "PUBLISHED", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "SKIPPED"]);

/**
 * `okter` er alle spillerens økter (begge øktmodeller) uten avlyste.
 * En uke uten økter bryter rekka, fordi den ikke har noen plan å måles mot.
 */
export function beregnFullfortHistorikk(okter: readonly OktStatus[], naa: Date): FullfortHistorikk {
  const fullforte = okter.filter((o) => o.status === "COMPLETED").map((o) => o.dato).sort((a, b) => a.getTime() - b.getTime());
  const milepaeler = MILEPAELER.map((antall) => ({ antall, naadd: fullforte[antall - 1] ?? null }));

  const perUke = new Map<number, { total: number; ferdig: number }>();
  for (const o of okter) {
    if (!TELLER.has(o.status)) continue;
    const k = startOfWeek(o.dato).getTime();
    const u = perUke.get(k) ?? { total: 0, ferdig: 0 };
    u.total += 1;
    if (o.status === "COMPLETED") u.ferdig += 1;
    perUke.set(k, u);
  }

  let rekke = 0;
  let uke = startOfWeek(naa);
  let eldste: Date | null = null;
  const forrige = startOfWeek(new Date(uke.getTime() - 3 * 86_400_000));
  for (;;) {
    uke = startOfWeek(new Date(uke.getTime() - 3 * 86_400_000));
    const u = perUke.get(uke.getTime());
    if (!u || u.total === 0 || u.ferdig / u.total < FULLFORT_TERSKEL) break;
    rekke += 1;
    eldste = uke;
  }
  return {
    total: fullforte.length,
    forste: fullforte[0] ?? null,
    milepaeler,
    rekke,
    rekkeUker: rekke > 0 && eldste ? { fra: ukenummer(eldste), til: ukenummer(forrige) } : null,
  };
}

export type UkeTelling = { gjennomfort: number; totalt: number; igjen: number; hoppetOver: number };

/** Denne uka: gjennomført mot alle planlagte økter (hoppet over teller med, avlyst gjør ikke). */
export function tellUke(statuser: readonly string[]): UkeTelling {
  const tellende = statuser.filter((s) => TELLER.has(s));
  return {
    gjennomfort: tellende.filter((s) => s === "COMPLETED").length,
    totalt: tellende.length,
    igjen: tellende.filter((s) => s === "PLANNED" || s === "PUBLISHED" || s === "SCHEDULED" || s === "IN_PROGRESS").length,
    hoppetOver: tellende.filter((s) => s === "SKIPPED").length,
  };
}
