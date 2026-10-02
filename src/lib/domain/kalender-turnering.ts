/**
 * Turneringslaget over uka i AG-05 Kalender (Precision Athletics).
 *
 * Kilde: `WorkbenchTournamentPlan` (turneringsdager og reisedager). Reisedager
 * leses fra `travelStartDate`/`travelEndDate` med `tournamentHasTravelOnDate` —
 * ingen avstandslogikk, bare det coach eller spiller har lagt inn.
 *
 * Reisevarsel: en reisedag i uka får et varsel. Ligger det økter for samme
 * spiller den dagen, står de i varselet, så coach ser hva som krasjer med reisen.
 *
 * Rene funksjoner uten Prisma og uten Date-objekter (bare «YYYY-MM-DD»).
 */

import { dateRangesOverlap, tournamentHasTravelOnDate } from "@/lib/workbench/fys-turnering-kontrakt";

export interface TurneringsPlanInn {
  id: string;
  tittel: string;
  spiller: string;
  spillerId: string;
  startDato: string;
  sluttDato: string;
  reiseFra: string | null;
  reiseTil: string | null;
}

export interface OktInn {
  spillerId: string;
  dato: string;
  tittel: string;
}

export interface TurneringsCelle {
  planId: string;
  type: "TURNERING" | "REISE";
  tittel: string;
  spiller: string;
}

export interface Reisevarsel {
  planId: string;
  dato: string;
  spiller: string;
  spillerId: string;
  turnering: string;
  /** Titlene på spillerens økter samme dag. Tom liste = bare reisedag. */
  okter: string[];
}

export interface Turneringslag {
  /** Én liste per dag i `dager`, samme rekkefølge. */
  dager: TurneringsCelle[][];
  varsler: Reisevarsel[];
}

export function byggTurneringslag(
  dager: readonly string[],
  planer: readonly TurneringsPlanInn[],
  okter: readonly OktInn[],
): Turneringslag {
  const celler: TurneringsCelle[][] = dager.map(() => []);
  const varsler: Reisevarsel[] = [];

  for (const p of planer) {
    dager.forEach((dato, i) => {
      const spilles = dateRangesOverlap(p.startDato, p.sluttDato, dato, dato);
      const reise = tournamentHasTravelOnDate({ travelStartDate: p.reiseFra, travelEndDate: p.reiseTil }, dato);
      if (spilles) {
        celler[i].push({ planId: p.id, type: "TURNERING", tittel: p.tittel, spiller: p.spiller });
      } else if (reise) {
        celler[i].push({ planId: p.id, type: "REISE", tittel: p.tittel, spiller: p.spiller });
      }
      // Reisevarsel gjelder reisedager, også når reisen er samme dag som runden.
      if (reise) {
        varsler.push({
          planId: p.id,
          dato,
          spiller: p.spiller,
          spillerId: p.spillerId,
          turnering: p.tittel,
          okter: okter.filter((o) => o.spillerId === p.spillerId && o.dato === dato).map((o) => o.tittel),
        });
      }
    });
  }

  varsler.sort((a, b) => (a.dato === b.dato ? a.spiller.localeCompare(b.spiller, "nb-NO") : a.dato.localeCompare(b.dato)));
  return { dager: celler, varsler };
}
