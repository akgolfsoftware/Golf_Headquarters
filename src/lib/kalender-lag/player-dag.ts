/**
 * KA-04 — Player «I dag i tiden» (Loop 7/C3, natt-plan bølge 2).
 *
 * Spilleren har ingen kalender-fane (OVERNIGHT-CODING-LOOP-BOLGE2.md Loop 7).
 * «I dag i tiden» er et ark åpnet fra «I dag» — en LESEVISNING av hele dagen
 * på tvers av lagene (økt, skole, turnering, tester, booking), kronologisk.
 * Økter redigeres i Plan/Workbench, aldri her.
 *
 * Samme harde regel som `loadPlayerDay` (wb-actions.ts): ALDRI DRAFT — kun
 * PUBLISHED | IN_PROGRESS | COMPLETED (invariant 3, CLAUDE.md). Google er
 * ikke et lag her (anti-scope Loop 7: ingen Google-API).
 *
 * Server-only. Kalles direkte fra en Server Component (samme mønster som
 * `loadPlayerDay`s bruk i `app/portal/page.tsx`) — ingen "use server" her,
 * denne kalles aldri fra en Client Component.
 */

import "server-only";
import { OSLO_YMD_FMT, osloInstant, osloDagGrenser } from "@/lib/jarvis/dagen";
import { osloMinuttAvDogen } from "@/lib/portal/idag-visning";
import { prisma } from "@/lib/prisma";
import { tilDatoKolonne } from "@/lib/workbench/wb-map";
import type { KalenderHendelse } from "@/lib/domain/kalender-lag";
import { sorterDag } from "@/lib/domain/kalender-lag";

const SPILLER_SYNLIGE_STATUSER = ["PUBLISHED", "IN_PROGRESS", "COMPLETED"] as const;

function minSidenMidnatt(d: Date): number {
  return osloMinuttAvDogen(d);
}

function klemtSluttMin(start: Date, slutt: Date): number {
  const sammeDag = OSLO_YMD_FMT.format(start) === OSLO_YMD_FMT.format(slutt);
  return sammeDag ? minSidenMidnatt(slutt) : 24 * 60;
}

/** Dagens vindu i Oslo for real-timestamp-kolonner, fra en YYYY-MM-DD-streng. */
function dagensVindu(dato: string): { fra: Date; til: Date } {
  const [y, m, d] = dato.split("-").map(Number);
  const { start: fra, slutt: til } = osloDagGrenser(osloInstant(y, m, d, 12, 0));
  return { fra, til };
}

export async function hentSpillerDagITiden(playerId: string, dato: string): Promise<KalenderHendelse[]> {
  return hentSpillerTidsrom(playerId, dato, dato, true);
}

/** Kalenderlag for Plans sju dager i én lesing. Økter leveres av getWeekOverview. */
export async function hentSpillerUkeITiden(playerId: string, mandag: string): Promise<KalenderHendelse[]> {
  const sondag = tilDatoKolonne(mandag);
  sondag.setUTCDate(sondag.getUTCDate() + 6);
  return hentSpillerTidsrom(playerId, mandag, sondag.toISOString().slice(0, 10), false);
}

async function hentSpillerTidsrom(playerId: string, dato: string, sisteDato: string, medOkter: boolean): Promise<KalenderHendelse[]> {
  const { fra } = dagensVindu(dato);
  const { til } = dagensVindu(sisteDato);
  const dagKolonne = tilDatoKolonne(dato);

  const spiller = await prisma.user.findUnique({
    where: { id: playerId },
    select: { schoolYear: true },
  });

  const [okter, bookinger, turneringer, tester, skole] = await Promise.all([
    medOkter ? prisma.workbenchSession.findMany({
      where: { playerId, date: dagKolonne, status: { in: [...SPILLER_SYNLIGE_STATUSER] }, hiddenByPlayer: false },
      select: { id: true, startMinute: true, durationMinutes: true, title: true, location: true },
      orderBy: { startMinute: "asc" },
    }) : Promise.resolve([]),
    prisma.booking.findMany({
      where: { userId: playerId, startAt: { gte: fra, lt: til }, status: { in: ["CONFIRMED", "PENDING", "COMPLETED"] } },
      include: { serviceType: { select: { name: true } }, facility: { select: { name: true } } },
      orderBy: { startAt: "asc" },
    }),
    prisma.tournamentEntry.findMany({
      where: {
        userId: playerId,
        entryStatus: { notIn: ["WITHDRAWN"] },
        OR: [{ manualDate: { gte: fra, lt: til } }, { tournament: { startDate: { gte: fra, lt: til } } }],
      },
      include: { tournament: { select: { name: true, startDate: true } } },
    }),
    prisma.testAssignment.findMany({
      where: { playerId, status: "OPEN", dueDate: { gte: fra, lt: til } },
      include: { test: { select: { name: true } } },
    }),
    spiller?.schoolYear
      ? prisma.schoolScheduleEntry.findMany({
          where: {
            date: { gte: fra, lt: til },
            OR: [{ classYear: spiller.schoolYear }, { classYear: null }],
          },
        })
      : Promise.resolve([]),
  ]);

  const hendelser: KalenderHendelse[] = [];

  for (const o of okter) {
    hendelser.push({
      id: `okt-${o.id}`,
      lag: "OEKTER",
      dato,
      tittel: o.title,
      undertekst: o.location ?? undefined,
      startMin: o.startMinute,
      sluttMin: Math.min(1440, o.startMinute + o.durationMinutes),
      heldag: false,
    });
  }

  for (const b of bookinger) {
    hendelser.push({
      id: `booking-${b.id}`,
      lag: "BOOKING",
      dato: OSLO_YMD_FMT.format(b.startAt),
      tittel: b.serviceType.name,
      undertekst: b.facility?.name ?? undefined,
      startMin: minSidenMidnatt(b.startAt),
      sluttMin: klemtSluttMin(b.startAt, b.endAt),
      heldag: false,
    });
  }

  for (const t of turneringer) {
    const tidspunkt = t.manualDate ?? t.tournament?.startDate;
    if (!tidspunkt || tidspunkt < fra || tidspunkt >= til) continue;
    hendelser.push({
      id: `turn-${t.id}`,
      lag: "TURNERING",
      dato: OSLO_YMD_FMT.format(tidspunkt),
      tittel: t.tournament?.name ?? t.manualName ?? "Turnering",
      startMin: null,
      sluttMin: null,
      heldag: true,
    });
  }

  for (const t of tester) {
    if (!t.dueDate) continue;
    hendelser.push({
      id: `test-${t.id}`,
      lag: "TESTER",
      dato: OSLO_YMD_FMT.format(t.dueDate),
      tittel: t.test.name,
      undertekst: "Testfrist",
      startMin: null,
      sluttMin: null,
      heldag: true,
    });
  }

  for (const s of skole) {
    hendelser.push({
      id: `skole-${s.id}`,
      lag: "SKOLE",
      dato: OSLO_YMD_FMT.format(s.date),
      tittel: s.title,
      startMin: null,
      sluttMin: null,
      heldag: true,
      lesevisning: true,
    });
  }

  return sorterDag(hendelser).sort((a, b) => a.dato.localeCompare(b.dato));
}
