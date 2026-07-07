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
 * treningstider + sesongperioder. Ingen spillernavn eller personlig data.
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

  const perioderRader = await prisma.trainingPeriod.findMany({
    where: { groupId: gruppe.id },
    orderBy: { startDate: "asc" },
  });

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
    })),
  };
}
