/**
 * Datainnhenting for runde-føringen (PH-RD-02 til PH-RD-06): banene spilleren kan velge.
 *
 * Bare ekte baner fra basen. Tidligere fylte en fast liste med baner og hull inn når basen var tom
 * eller utilgjengelig; de banene fantes ikke i basen, så en runde mot dem kunne aldri lagres.
 * Tom liste gir tom tilstand, feil gir feil tilstand.
 */

import { prisma } from "@/lib/prisma";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";
import { medForst } from "@/lib/portal/baneliste-med-prefill";

export interface PhBaneValg {
  id: string;
  navn: string;
  par: number;
}

export interface PhSisteRunde {
  id: string;
  dato: string;
  bane: string;
  score: number;
}

export interface Ph0809Data {
  baner: PhBaneValg[];
  sisteBaneId: string | null;
  sisteRunder: PhSisteRunde[];
  ulesteVarsler: number;
  /** true når banene ikke kunne hentes. */
  feil: boolean;
}

export async function loadPh0809Data(userId: string): Promise<Ph0809Data> {
  try {
    const [dbCourses, sisteBaneIdRaw, dbRounds, uleste] = await Promise.all([
      prisma.courseDefinition.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, par: true },
      }),
      sisteSpilteBaneId(userId).catch(() => null),
      prisma.round.findMany({
        where: { userId },
        orderBy: { playedAt: "desc" },
        take: 3,
        select: { id: true, playedAt: true, score: true, course: { select: { name: true } } },
      }).catch(() => []),
      prisma.notification.count({ where: { userId, readAt: null } }).catch(() => 0),
    ]);

    // Prefill: sist spilte bane først i listen.
    const baner = medForst(dbCourses.map((c) => ({ id: c.id, navn: c.name, par: c.par })), sisteBaneIdRaw);

    return {
      baner,
      sisteBaneId: sisteBaneIdRaw,
      sisteRunder: dbRounds.map((r) => ({
        id: r.id,
        dato: r.playedAt.toLocaleDateString("nb-NO", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Oslo" }),
        bane: r.course?.name || "—",
        score: r.score,
      })),
      ulesteVarsler: uleste,
      feil: false,
    };
  } catch (feil) {
    console.error("loadPh0809Data feilet:", feil);
    return { baner: [], sisteBaneId: null, sisteRunder: [], ulesteVarsler: 0, feil: true };
  }
}
