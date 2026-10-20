/**
 * Gjør turneringene i spillerprofilen (dashboard, migrasjon 0026) om til formen resten av HQ
 * allerede leser: `OffentligResultat`. Da deler Spiller 360, Team Norway og WANG samme
 * brutto- og plasseringsregler (lesTurneringsresultat) som før, bare med én felles kilde.
 *
 * Ren funksjon, ingen database. Netto-klasser tas ut: bare brutto score vises.
 */

import { erNettoklasse, type OffentligResultat } from "@/lib/domain/turneringsresultat";
import type { ProfilTurnering } from "./typer";

export type ProfilTurneringResultat = {
  /** Stabil id på tvers av kilder: «dashboard:<id>». Kolliderer aldri med cuid-ene i public.*. */
  id: string;
  navn: string;
  start: Date;
  kilde: string | null;
  klasse: string | null;
  resultat: OffentligResultat;
};

/** Turneringsdatoen. Uten dato brukes 1. januar i turneringsåret; uten begge hoppes raden over. */
export function turneringsDato(t: Pick<ProfilTurnering, "start_date" | "year">): Date | null {
  if (t.start_date) {
    const d = new Date(`${t.start_date.slice(0, 10)}T12:00:00Z`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return t.year != null ? new Date(Date.UTC(t.year, 0, 1, 12)) : null;
}

export function tilTurneringer(turneringer: ProfilTurnering[]): ProfilTurneringResultat[] {
  const ut: ProfilTurneringResultat[] = [];
  for (const t of turneringer) {
    if (erNettoklasse(t.klasse)) continue;
    const start = turneringsDato(t);
    if (!start) continue;
    const runder = (t.runder ?? []).filter((r) => r.score != null);
    const spilt = t.total_score != null || t.plassering != null || runder.length > 0;
    ut.push({
      id: `dashboard:${t.tournament_id}`,
      navn: t.turnering,
      start,
      kilde: t.kilde ? t.kilde.toUpperCase() : null,
      klasse: t.klasse,
      resultat: {
        status: spilt ? "FINISHED" : "REGISTERED",
        position: t.plassering,
        scoreToPar: t.to_par,
        totalScore: t.total_score,
        rounds: null,
        klasseNavn: t.klasse,
        roundDetails: runder.map((r) => ({ roundNumber: r.runde, score: r.score, toPar: r.til_par, source: "GOLFBOX" })),
      },
    });
  }
  return ut;
}
