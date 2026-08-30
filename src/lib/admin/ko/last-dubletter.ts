/**
 * Kø · fane «Dubletter» — datalasting (MASTERPLAN 15.1).
 *
 * Flyttet ORDRETT ut av src/app/admin/tournaments/dubletter/page.tsx.
 * Match-algoritmen er uendret: for hver MANUAL-turnering uten mergedIntoId,
 * søk turneringer fra en ekte kilde med overlappende dato (±3 dager) og
 * lignende navn (token-overlap). Kun rolle-guarden er løftet ut.
 *
 * MERK (MASTERPLAN 15.6): selve merge-VERKTØYET hører hjemme under Turnering.
 * Her er dubletter en sak-type i køen — noe som venter på Anders' avgjørelse.
 */

import { prisma } from "@/lib/prisma";
import type { MergeKandidat } from "@/app/admin/tournaments/dubletter/merge-liste";

function tokenize(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9 ]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length >= 3),
  );
}

function tokenOverlap(a: Set<string>, b: Set<string>): number {
  let count = 0;
  for (const t of a) if (b.has(t)) count++;
  return count;
}

export async function lastDubletter(): Promise<MergeKandidat[]> {

  const manuals = await prisma.tournament.findMany({
    where: { sourceOrigin: "MANUAL", mergedIntoId: null },
    include: {
      createdBy: { select: { name: true, email: true } },
      _count: { select: { entries: true, results: true, publicEntries: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const kandidater = await prisma.tournament.findMany({
    where: { sourceOrigin: { not: "MANUAL" }, mergedIntoId: null },
    select: {
      id: true,
      name: true,
      startDate: true,
      endDate: true,
      location: true,
      sourceOrigin: true,
      tour: true,
      _count: { select: { entries: true, results: true, publicEntries: true } },
    },
  });

  const liste: MergeKandidat[] = manuals.map((m) => {
    const manualTokens = tokenize(m.name);
    const manualStart = m.startDate.getTime();
    const treDager = 3 * 24 * 60 * 60 * 1000;

    const forslag = kandidater
      .map((k) => {
        const datoDiff = Math.abs(k.startDate.getTime() - manualStart);
        if (datoDiff > treDager) return null;
        const overlap = tokenOverlap(manualTokens, tokenize(k.name));
        if (overlap === 0) return null;
        return {
          id: k.id,
          name: k.name,
          startDate: k.startDate,
          endDate: k.endDate,
          location: k.location,
          sourceOrigin: k.sourceOrigin,
          tour: k.tour,
          antallEntries: k._count.entries,
          antallResults: k._count.results,
          antallPublicEntries: k._count.publicEntries,
          score: overlap * 100 - Math.floor(datoDiff / (24 * 60 * 60 * 1000)),
        };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    return {
      manual: {
        id: m.id,
        name: m.name,
        startDate: m.startDate.toISOString(),
        endDate: m.endDate?.toISOString() ?? null,
        location: m.location,
        tour: m.tour,
        createdByName: m.createdBy?.name ?? null,
        createdByEmail: m.createdBy?.email ?? null,
        antallEntries: m._count.entries,
        antallResults: m._count.results,
        antallPublicEntries: m._count.publicEntries,
      },
      forslag: forslag.map((f) => ({
        id: f.id,
        name: f.name,
        startDate: f.startDate.toISOString(),
        endDate: f.endDate?.toISOString() ?? null,
        location: f.location,
        sourceOrigin: f.sourceOrigin,
        tour: f.tour,
        antallEntries: f.antallEntries,
        antallResults: f.antallResults,
        antallPublicEntries: f.antallPublicEntries,
        score: f.score,
      })),
    };
  });

  return liste;
}
