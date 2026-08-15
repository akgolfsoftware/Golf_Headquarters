/**
 * Ukesrapport for stallen — coachens leseelement i godkjenningskøen (D3).
 * Fasit: designsystem/paper/fase2/agencyos/agencyos-godkjenninger.html
 *
 * Rapportagenten LESER. Denne modulen skriver ingenting, oppretter ingen
 * PlanAction og endrer ingen plan — den teller det som allerede ligger der.
 *
 * Etterlevelsen regnes med samme funksjon som spillerens digest
 * (src/lib/domain/etterlevelse.ts), så coachens «14/16» og spillerens «4/5»
 * aldri kan bygge på ulike definisjoner av gjennomført.
 */

import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "@/lib/uke-helpers";
import {
  etterlevelse,
  NEVNER_TEKST,
  type Etterlevelse,
} from "@/lib/domain/etterlevelse";
import type { AdminUkesrapportKort } from "@/components/admin/v2/AdminGodkjenningerV2";

const TID_FMT = new Intl.DateTimeFormat("nb-NO", {
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Oslo",
});

const DATO_FMT = new Intl.DateTimeFormat("nb-NO", {
  day: "numeric",
  month: "short",
  timeZone: "Europe/Oslo",
});

function ukenummer(d: Date): number {
  const dato = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dag = dato.getUTCDay() || 7;
  dato.setUTCDate(dato.getUTCDate() + 4 - dag);
  const arsstart = new Date(Date.UTC(dato.getUTCFullYear(), 0, 1));
  return Math.ceil(((dato.getTime() - arsstart.getTime()) / 86_400_000 + 1) / 7);
}

/**
 * Bygger rapport-kortet, eller null når det ikke finnes noe å rapportere —
 * en tom stall skal ikke gi et kort med nuller i.
 */
export async function hentUkesrapport(
  spillerWhere: Prisma.UserWhereInput,
  now = new Date(),
): Promise<AdminUkesrapportKort | null> {
  const ukeStart = startOfWeek(now);
  /* endOfWeek gir mandag neste uke kl. 00:00 — eksklusiv grense, brukes med
     `lt`. Med `lte` ville mandagens økter blitt talt i to uker. */
  const ukeSlutt = endOfWeek(now);
  const om14dager = new Date(now.getTime() + 14 * 86_400_000);

  const spillere = await prisma.user.findMany({
    where: spillerWhere,
    select: { id: true },
  });
  if (spillere.length === 0) return null;

  const ider = spillere.map((s) => s.id);

  const [okter, forfall] = await Promise.all([
    prisma.trainingSessionV2.findMany({
      where: { studentId: { in: ider }, startTime: { gte: ukeStart, lt: ukeSlutt } },
      select: { startTime: true, endTime: true, status: true },
    }),
    prisma.testAssignment.findMany({
      where: {
        playerId: { in: ider },
        status: "OPEN",
        dueDate: { not: null, lte: om14dager },
      },
      select: { dueDate: true },
      orderBy: { dueDate: "asc" },
    }),
  ]);

  const e = etterlevelse(
    okter.map((o) => ({
      scheduledAt: o.startTime,
      durationMin: Math.max(
        0,
        Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000),
      ),
      status: o.status,
    })),
    now,
  );

  return byggUkesrapport({
    etterlevelse: e,
    testforfall: forfall.flatMap((f) => (f.dueDate ? [f.dueDate] : [])),
    antallSpillere: spillere.length,
    ukeStart,
    now,
  });
}

/**
 * Ren forming av rapport-kortet — skilt fra databasehentingen så terskelen
 * («ingenting å rapportere» → null) kan testes uten Prisma.
 */
export function byggUkesrapport(input: {
  etterlevelse: Etterlevelse;
  /** Forfallsdatoer for åpne testtildelinger, tidligst først. */
  testforfall: Date[];
  antallSpillere: number;
  ukeStart: Date;
  now: Date;
}): AdminUkesrapportKort | null {
  const { etterlevelse: e, testforfall, antallSpillere, ukeStart, now } = input;

  // Ingen forfalte økter og ingen testforfall = ingenting å rapportere ennå.
  // En tom stall skal ikke gi et kort fullt av nuller.
  if (e.nevner === 0 && testforfall.length === 0) return null;

  const tall: AdminUkesrapportKort["tall"] = [];

  if (e.nevner > 0) {
    tall.push({
      key: "etterlevelse",
      verdi: `${e.teller}/${e.nevner}`,
      nevner: NEVNER_TEKST,
    });
  }
  if (e.hoppet > 0) {
    tall.push({
      key: "hoppet",
      verdi: String(e.hoppet),
      nevner: "aktivt nei fra spilleren",
    });
  }
  if (e.ulogget > 0) {
    tall.push({
      key: "ikke logget",
      verdi: String(e.ulogget),
      nevner: "forfalt uten svar",
    });
  }
  if (testforfall.length > 0) {
    tall.push({
      key: "testforfall",
      verdi: String(testforfall.length),
      nevner: `neste ${DATO_FMT.format(testforfall[0])}`,
    });
  }

  return {
    ukenummer: ukenummer(ukeStart),
    when: TID_FMT.format(now),
    tall,
    hvorfor: [
      `Agent: Rapportagent · lest ${TID_FMT.format(now)} · leser, skriver aldri`,
      `Data: publiserte økter i uke ${ukenummer(ukeStart)} for ${antallSpillere} spillere · åpne testtildelinger med frist`,
      `Nevner: etterlevelse = gjennomførte av ${NEVNER_TEKST}`,
    ],
  };
}
