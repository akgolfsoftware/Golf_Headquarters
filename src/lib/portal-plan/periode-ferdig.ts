/**
 * PlayerHQ pakke 17b · Perioden er ferdig: gjennomført mot planlagt tid per akse i en periode som er over.
 * Samme regel som etterlevelse (beslutning 26.09.2026, lib/domain/etterlevelse.ts): planlagt er alle økter
 * spilleren ser i planen (også hoppet over og avbrutt), gjennomført er økter med status COMPLETED.
 * Minutter er øktens planlagte varighet. Ingen database.
 */

export const PERIODE_AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;
export type PeriodeAkse = (typeof PERIODE_AKSER)[number];

export type PeriodeOktInn = { pyramid: string; durationMinutes: number; status: string };
export type AkseTall = { gjort: number; plan: number };
export type PeriodeTall = {
  perAkse: Record<PeriodeAkse, AkseTall>;
  gjort: number; plan: number;
  /** Null når ingen tid var planlagt. */
  pct: number | null;
  okterGjort: number; okterTotalt: number;
};

const erAkse = (v: string): v is PeriodeAkse => (PERIODE_AKSER as readonly string[]).includes(v);

export function periodeTall(okter: readonly PeriodeOktInn[]): PeriodeTall {
  const perAkse = Object.fromEntries(PERIODE_AKSER.map((a) => [a, { gjort: 0, plan: 0 }])) as Record<PeriodeAkse, AkseTall>;
  let gjort = 0, plan = 0, okterGjort = 0, okterTotalt = 0;
  for (const o of okter) {
    const min = Number.isFinite(o.durationMinutes) ? Math.max(0, o.durationMinutes) : 0;
    okterTotalt++;
    plan += min;
    if (erAkse(o.pyramid)) perAkse[o.pyramid].plan += min;
    if (o.status === "COMPLETED") {
      okterGjort++;
      gjort += min;
      if (erAkse(o.pyramid)) perAkse[o.pyramid].gjort += min;
    }
  }
  return { perAkse, gjort, plan, pct: plan > 0 ? Math.round((gjort / plan) * 100) : null, okterGjort, okterTotalt };
}

/** «17 t 5 min», «45 min», «2 t». */
export function timerTekst(min: number): string {
  const m = Math.max(0, Math.round(min));
  const t = Math.floor(m / 60), r = m % 60;
  if (!t) return `${r} min`;
  return r ? `${t} t ${r} min` : `${t} t`;
}
