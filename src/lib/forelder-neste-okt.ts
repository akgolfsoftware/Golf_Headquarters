/**
 * Data-loader for FO-01 neste økt. Workbench-domenet, aldri DRAFT.
 * Server-only.
 */

import { prisma } from "@/lib/prisma";
import { fraDatoKolonne, tilDatoKolonne } from "@/lib/workbench/wb-map";
import { klokkeslett } from "@/lib/domain/kalender-lag";
import { erSynligForForelder, fornavnAv } from "@/lib/domain/forelder-neste-okt";

export type ForelderNesteOktKortData = {
  fornavn: string;
  tittel: string;
  tid: string;
} | null;

function osloIsoIdag(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Oslo" }).format(new Date());
}

export async function hentForelderNesteOkt(childId: string, childName: string): Promise<ForelderNesteOktKortData> {
  const idag = osloIsoIdag();
  const rad = await prisma.workbenchSession.findFirst({
    where: {
      playerId: childId,
      status: { in: ["PUBLISHED", "IN_PROGRESS"] },
      date: { gte: tilDatoKolonne(idag) },
      isTemplate: false,
    },
    orderBy: [{ date: "asc" }, { startMinute: "asc" }],
    select: { title: true, date: true, startMinute: true, status: true },
  });
  if (!rad || !erSynligForForelder(rad.status)) return null;
  const dato = fraDatoKolonne(rad.date);
  return {
    fornavn: fornavnAv(childName),
    tittel: rad.title,
    tid: `${dato} · ${klokkeslett(rad.startMinute)}`,
  };
}
