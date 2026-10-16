/**
 * PH-11-MND Måned og PH-11-MNDSKJEMA (pakke 3): rene regler for spillerens månedsvisning.
 * Ingen database. Ukene som hører til måneden følger torsdagsregelen (maanedsplan-regler),
 * «fordelt» er ukeplanens timer per akse (WeekPlan.plannedHours*), og «lagt inn» er øktene.
 */

import type { PyramidArea } from "@/lib/domain/workbench/types";
import type { AxisMinutes } from "@/lib/workbench/perioder";
import { alleUkerIMaaned, ukeNokkel, type UkeOverstyringer } from "@/lib/workbench/maanedsplan-regler";

export const MAANED_AKSER: readonly PyramidArea[] = ["FYS", "TEK", "SLAG", "SPILL", "TURN"];

/** Ukeplanens felter, slik basen har dem (timer, null = ikke satt). */
export type UkeplanTimer = {
  isoYear: number;
  weekNumber: number;
  plannedHoursFys: number | null;
  plannedHoursTek: number | null;
  plannedHoursSlag: number | null;
  plannedHoursSpill: number | null;
  plannedHoursTurn: number | null;
};

/** Ukeplanens timer som minutter per akse. Null når ingen akse er satt. */
export function minutterFraUkeplan(rad: UkeplanTimer | undefined): AxisMinutes | null {
  if (!rad) return null;
  const timer: Record<PyramidArea, number | null> = {
    FYS: rad.plannedHoursFys, TEK: rad.plannedHoursTek, SLAG: rad.plannedHoursSlag,
    SPILL: rad.plannedHoursSpill, TURN: rad.plannedHoursTurn,
  };
  const ut: AxisMinutes = {};
  for (const a of MAANED_AKSER) {
    const t = timer[a];
    if (t != null) ut[a] = Math.round(t * 60);
  }
  return Object.keys(ut).length > 0 ? ut : null;
}

type MaanedOkt = { date: string; durationMinutes: number; pyramid: PyramidArea; status: string };

export type MaanedUke = {
  /** «ÅÅÅÅ-Uxx», samme nøkkel som månedsplanen. */
  nokkel: string;
  weekStart: string;
  weekNumber: number;
  /** Timer per akse uka har fått fra perioden eller måneden. Null = ikke fordelt. */
  fordelt: AxisMinutes | null;
  /** Lagt inn per akse (alle økter som ikke er avlyst eller hoppet over). */
  lagtInn: Record<PyramidArea, number>;
  gjennomfort: number;
  /** Uka har månedens egne tall («Endret i måneden»). */
  endret: boolean;
};

const tomme = (): Record<PyramidArea, number> => ({ FYS: 0, TEK: 0, SLAG: 0, SPILL: 0, TURN: 0 });

function leggTil(iso: string, dager: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dager);
  return d.toISOString().slice(0, 10);
}

/** Ukene som hører til måneden, med fordelt, lagt inn og gjennomført. */
export function byggMaanedUker(input: {
  year: number;
  month: number;
  okter: readonly MaanedOkt[];
  ukeplaner: readonly UkeplanTimer[];
  overstyringer: UkeOverstyringer;
}): MaanedUke[] {
  const planer = new Map(input.ukeplaner.map((p) => [ukeNokkel(p.isoYear, p.weekNumber), p]));
  return alleUkerIMaaned(input.year, input.month).map((u) => {
    const nokkel = ukeNokkel(u.isoYear, u.weekNumber);
    const slutt = leggTil(u.mandag, 6);
    const lagtInn = tomme();
    let gjennomfort = 0;
    for (const o of input.okter) {
      if (o.date < u.mandag || o.date > slutt) continue;
      if (o.status === "CANCELLED" || o.status === "SKIPPED") continue;
      lagtInn[o.pyramid] += Math.max(0, o.durationMinutes);
      if (o.status === "COMPLETED") gjennomfort += Math.max(0, o.durationMinutes);
    }
    return {
      nokkel, weekStart: u.mandag, weekNumber: u.weekNumber,
      fordelt: minutterFraUkeplan(planer.get(nokkel)),
      lagtInn, gjennomfort, endret: Boolean(input.overstyringer[nokkel]),
    };
  });
}

export function sumAkser(m: Partial<Record<PyramidArea, number>> | null | undefined): number {
  return MAANED_AKSER.reduce((s, a) => s + (m?.[a] ?? 0), 0);
}

/** Minutter som «3:45» i skjemaet. */
export function tilTimerMin(minutter: number): string {
  const m = Math.max(0, Math.round(minutter));
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
}

/**
 * «3:45», «3.45», «3» (timer) eller «45 min» → minutter. Tomt felt = 0.
 * Ugyldig tekst gir null, så skjemaet kan si fra i stedet for å lagre feil tall.
 */
export function fraTimerMin(tekst: string): number | null {
  const t = tekst.trim().toLowerCase();
  if (t === "") return 0;
  const min = /^(\d{1,3})\s*min$/.exec(t);
  if (min) return Number(min[1]);
  const tm = /^(\d{1,2})(?:[:.,](\d{1,2}))?$/.exec(t);
  if (!tm) return null;
  const minutter = tm[2] === undefined ? 0 : Number(tm[2]);
  if (minutter > 59) return null;
  return Number(tm[1]) * 60 + minutter;
}

/**
 * Hvilke uker månedsplanen skal lagre som egne tall: uker som alt er endret i måneden,
 * og uker der spilleren har endret et tall i forhold til det uka hadde da skjemaet åpnet.
 * Uker som er gått, sendes aldri (lagringen skriver bare fra inneværende uke).
 */
export function ukerSomLagres(input: {
  uker: readonly Pick<MaanedUke, "nokkel" | "fordelt" | "endret">[];
  verdier: Record<string, Record<PyramidArea, number>>;
  apne: ReadonlySet<string>;
  folgPerioden: ReadonlySet<string>;
}): UkeOverstyringer {
  const ut: UkeOverstyringer = {};
  for (const u of input.uker) {
    if (!input.apne.has(u.nokkel) || input.folgPerioden.has(u.nokkel)) continue;
    const v = input.verdier[u.nokkel];
    if (!v) continue;
    const endretNa = MAANED_AKSER.some((a) => v[a] !== (u.fordelt?.[a] ?? 0));
    if (!u.endret && !endretNa) continue;
    ut[u.nokkel] = Object.fromEntries(MAANED_AKSER.map((a) => [a, v[a]])) as AxisMinutes;
  }
  return ut;
}
