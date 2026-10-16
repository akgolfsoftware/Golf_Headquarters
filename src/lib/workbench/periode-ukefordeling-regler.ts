/**
 * Plannivåene henger sammen (Anders 14.10.2026): regler for hvordan en periode
 * fordeler timer per akse nedover til ukeplanene. Gjelder fra og med inneværende
 * uke — uker som er gått røres aldri. Lett uke (weekType VEDLIKEHOLD) bruker periodens lette tall.
 */

import type { AxisMinutes } from "@/lib/workbench/perioder";
import { isoUkeIdentitet, isoUkeMandag } from "@/lib/workbench/ukeplan-schema";

export type PeriodeUke = { isoYear: number; weekNumber: number; mandag: string };

export type UkeTimer = {
  plannedHoursFys: number | null;
  plannedHoursTek: number | null;
  plannedHoursSlag: number | null;
  plannedHoursSpill: number | null;
  plannedHoursTurn: number | null;
};

/** Resultat som lagringen kvitterer med. */
export type FordelingKvittering = { antallUker: number; fraUke: string | null; tilUke: string | null };

function leggTilDager(isoDato: string, antall: number): string {
  const d = new Date(`${isoDato}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + antall);
  return d.toISOString().slice(0, 10);
}

/**
 * Ukene som tilhører perioden og ikke er gått: en uke hører til perioden der
 * torsdagen ligger (samme regel som ISO-ukeåret), så en uke på grensen mellom to
 * perioder aldri eies av begge. Inneværende uke teller med.
 */
export function ukerForPeriode(startDato: string, sluttDato: string, iDag: string): PeriodeUke[] {
  const start = isoUkeIdentitet(startDato);
  let mandag = isoUkeMandag(start.isoYear, start.weekNumber);
  const uker: PeriodeUke[] = [];
  // Perioder er aldri lengre enn noen år; tak mot uendelig løkke ved ugyldige datoer.
  for (let i = 0; i < 600 && leggTilDager(mandag, 3) <= sluttDato; i++) {
    const torsdag = leggTilDager(mandag, 3);
    const sondag = leggTilDager(mandag, 6);
    if (torsdag >= startDato && sondag >= iDag) {
      const { isoYear, weekNumber } = isoUkeIdentitet(mandag);
      uker.push({ isoYear, weekNumber, mandag });
    }
    mandag = leggTilDager(mandag, 7);
  }
  return uker;
}

const AKSER = ["FYS", "TEK", "SLAG", "SPILL", "TURN"] as const;

function timer(min: number | undefined): number | null {
  return min == null ? null : Math.round((min / 60) * 100) / 100;
}

/** Minutter per akse → timer per akse i ukeplanens felter. Mangler en akse = ikke satt. */
export function ukeTimerFraMinutter(m: AxisMinutes): UkeTimer {
  const [fys, tek, slag, spill, turn] = AKSER.map((a) => timer(m[a]));
  return {
    plannedHoursFys: fys, plannedHoursTek: tek, plannedHoursSlag: slag,
    plannedHoursSpill: spill, plannedHoursTurn: turn,
  };
}

/** Lett uke bruker de lette tallene; mangler de, røres uka ikke. */
export function minutterForUke(
  periode: { axisMinutes: AxisMinutes | null; axisMinutesLight: AxisMinutes | null },
  lett: boolean,
): AxisMinutes | null {
  return lett ? periode.axisMinutesLight : periode.axisMinutes;
}

/** Teksten brukeren ser når en periode er lagret. null = ingen uker ble berørt. */
export function fordelingKvittering(k: FordelingKvittering | undefined, feilet?: boolean): string | null {
  if (feilet) return "Perioden er lagret, men ukene ble ikke oppdatert. Prøv å lagre på nytt.";
  if (!k || k.antallUker === 0) return null;
  const uker = k.antallUker === 1 ? "1 uke" : `${k.antallUker} uker`;
  return `Perioden er lagret. ${uker} oppdatert fra og med inneværende uke.`;
}
