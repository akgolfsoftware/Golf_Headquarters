import "server-only";

import { hentTnSpillerTester, type TnBruker, type TnSpillerTestRad } from "@/lib/domain/tn-arbeidsflate";
import { prisma } from "@/lib/prisma";
import { mandagFor, naivOsloNaa, ukeEtterlevelse, type EtterlevelseOkt, type UkeTid } from "./etterlevelse";

/**
 * Datalastere for Team Norway «Daglig» og «Spillere» (TN-01, TN-02, TN-03 og
 * Kartlegging). Leser bare modeller som finnes. Tilgangen er allerede sjekket
 * av skjermen (krevTnTrenerflate + gruppens spillerliste).
 */

const DAG_MS = 864e5;

async function hentOkter(spillerIder: string[], fraNaiv: number, tilNaiv: number) {
  if (spillerIder.length === 0) return [];
  return prisma.workbenchSession.findMany({
    where: {
      playerId: { in: spillerIder },
      date: { gte: new Date(fraNaiv), lt: new Date(tilNaiv) },
      isTemplate: false,
      isAgentProposal: false,
    },
    select: { id: true, playerId: true, date: true, startMinute: true, durationMinutes: true, status: true, title: true, location: true, pyramid: true },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
  });
}

function tilOkt(r: { date: Date; startMinute: number; durationMinutes: number; status: string }): EtterlevelseOkt {
  return { dato: r.date, startMinutt: r.startMinute, varighet: r.durationMinutes, status: r.status };
}

/** Planlagt mot gjennomført tid for de siste `antallUker` ukene, per spiller. */
export async function hentUkeTid(spillerIder: string[], naa: Date, antallUker: number): Promise<Map<string, UkeTid[]>> {
  const denneMandag = mandagFor(naivOsloNaa(naa));
  const fra = denneMandag - (antallUker - 1) * 7 * DAG_MS;
  const rader = await hentOkter(spillerIder, fra, denneMandag + 7 * DAG_MS);
  const perSpiller = new Map<string, EtterlevelseOkt[]>();
  for (const r of rader) perSpiller.set(r.playerId, [...(perSpiller.get(r.playerId) ?? []), tilOkt(r)]);
  return new Map(spillerIder.map((id) => [id, ukeEtterlevelse(perSpiller.get(id) ?? [], naa, antallUker)]));
}

export type UkensOkt = {
  id: string;
  dato: Date;
  startMinutt: number;
  tittel: string;
  sted: string | null;
  varighet: number;
  status: string;
  /** Gjennomførte minutter, eller null når økten ikke er forfalt. */
  fort: number | null;
};

/** Spillerens økter denne uka (Oslo), med ført tid for de forfalte. */
export async function hentUkensOkter(spillerId: string, naa: Date): Promise<UkensOkt[]> {
  const naaNaiv = naivOsloNaa(naa);
  const mandag = mandagFor(naaNaiv);
  const rader = await hentOkter([spillerId], mandag, mandag + 7 * DAG_MS);
  return rader
    .filter((r) => r.status !== "DRAFT" && r.status !== "CANCELLED")
    .map((r) => {
      const slutt = r.date.getTime() + (r.startMinute + r.durationMinutes) * 60_000;
      return {
        id: r.id,
        dato: r.date,
        startMinutt: r.startMinute,
        tittel: r.title,
        sted: r.location,
        varighet: r.durationMinutes,
        status: r.status,
        fort: slutt > naaNaiv ? null : r.status === "COMPLETED" ? r.durationMinutes : 0,
      };
    });
}

/**
 * Siste Team Norway-protokoller per spiller. Gjenbruker spillerens egen
 * validerte oversikt (hentTnSpillerTester), så tallene er de samme som på
 * spillerprofilen.
 */
export async function hentTestmatrise(bruker: TnBruker, spillerIder: string[]): Promise<Map<string, TnSpillerTestRad[]>> {
  const svar = await Promise.all(spillerIder.map(async (id) => [id, (await hentTnSpillerTester(bruker, id))?.rader ?? []] as const));
  return new Map(svar);
}
