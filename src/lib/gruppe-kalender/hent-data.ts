import { prisma } from "@/lib/prisma";
import type { GruppeKalenderData } from "./types";

const NB_WEEKDAY_NUM: Record<string, number> = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

function tidFraDato(d: Date): string {
  // Oslo-lokal klokkeslett, uavhengig av server-runtime sin tidssone.
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Oslo",
  });
}

function ukedagFraDato(d: Date): number {
  const engelskDag = d
    .toLocaleDateString("en-US", { weekday: "long", timeZone: "Europe/Oslo" })
    .toLowerCase();
  return NB_WEEKDAY_NUM[engelskDag] ?? d.getUTCDay();
}

/**
 * Henter offentlig-trygg kalenderdata for én gruppe: faste ukentlige
 * treningstider, sesongperioder (+ kompetansemål), samlinger og
 * skole-hendelser for periodenes skoleår. Ingen spillernavn eller personlig data.
 */
export async function hentGruppeKalenderData(
  gruppeNavn: string,
): Promise<GruppeKalenderData | null> {
  const gruppe = await prisma.group.findFirst({
    where: { name: gruppeNavn },
    select: {
      id: true,
      name: true,
      schedules: {
        where: { recurring: "WEEKLY" },
        orderBy: { startAt: "asc" },
      },
    },
  });
  if (!gruppe) return null;

  const [perioderRader, samlingerRader] = await Promise.all([
    prisma.trainingPeriod.findMany({
      where: { groupId: gruppe.id },
      orderBy: { startDate: "asc" },
    }),
    prisma.groupSchedule.findMany({
      where: { groupId: gruppe.id, kind: { in: ["SAMLING", "HELDAGSSAMLING"] } },
      orderBy: { startAt: "asc" },
    }),
  ]);

  const alleMalIder = [...new Set(perioderRader.flatMap((p) => p.competenceGoalIds))];
  const skoleAr = [...new Set(perioderRader.map((p) => p.schoolYear))];

  const [malRader, skoleHendelserRader] = await Promise.all([
    alleMalIder.length
      ? prisma.competenceGoal.findMany({ where: { id: { in: alleMalIder } } })
      : Promise.resolve([]),
    skoleAr.length
      ? prisma.schoolScheduleEntry.findMany({
          where: { schoolYear: { in: skoleAr } },
          orderBy: { date: "asc" },
        })
      : Promise.resolve([]),
  ]);
  const malPerId = new Map(malRader.map((m) => [m.id, m]));

  return {
    gruppeId: gruppe.id,
    gruppeNavn: gruppe.name,
    faste: gruppe.schedules.map((s) => ({
      id: s.id,
      weekday: ukedagFraDato(s.startAt),
      startTime: tidFraDato(s.startAt),
      endTime: tidFraDato(s.endAt),
      title: s.title,
    })),
    perioder: perioderRader.map((p) => ({
      id: p.id,
      name: p.name,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
      tone: p.tone,
      note: p.note,
      kompetansemal: p.competenceGoalIds
        .map((id) => malPerId.get(id))
        .filter((m): m is NonNullable<typeof m> => m != null),
    })),
    samlinger: samlingerRader.map((s) => ({
      id: s.id,
      title: s.title,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      kind: s.kind as "SAMLING" | "HELDAGSSAMLING",
      location: s.location,
    })),
    skoleHendelser: skoleHendelserRader.map((h) => ({
      id: h.id,
      classYear: h.classYear,
      date: h.date.toISOString(),
      category: h.category as GruppeKalenderData["skoleHendelser"][number]["category"],
      title: h.title,
      note: h.note,
    })),
  };
}
