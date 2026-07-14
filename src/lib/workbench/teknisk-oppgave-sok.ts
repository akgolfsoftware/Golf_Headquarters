"use server";

/**
 * Søk i en spillers tekniske oppgaver — for "koble til teknisk oppgave"-
 * velgeren på drill-rader i Workbench (runde 2 · 2026-07-14). Read-only.
 * Samme spiller/coach-todeling som resten av workbench-actions.
 */

import { prisma } from "@/lib/prisma";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";

export type TekniskOppgaveHit = { id: string; tittel: string; pNummer: string };

async function sok(userId: string, query: string): Promise<TekniskOppgaveHit[]> {
  const q = query.trim().slice(0, 80);
  const rows = await prisma.positionTask.findMany({
    where: {
      AND: [
        q ? { tittel: { contains: q, mode: "insensitive" } } : {},
        { position: { plan: { userId } } },
      ],
    },
    orderBy: { updatedAt: "desc" },
    take: 12,
    select: { id: true, tittel: true, position: { select: { pNummer: true } } },
  });
  return rows.map((r) => ({ id: r.id, tittel: r.tittel, pNummer: r.position.pNummer }));
}

/** Spiller-siden — søk i egne oppgaver. */
export async function sokTekniskOppgaver(query: string): Promise<TekniskOppgaveHit[]> {
  const user = await requirePortalUser();
  return sok(user.id, query);
}

/** Coach-siden — søk i en gitt spillers oppgaver. */
export async function coachSokTekniskOppgaver(
  playerId: string,
  query: string,
): Promise<TekniskOppgaveHit[]> {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  if (!(await harCoachTilgangTilSpiller(coach, playerId))) return [];
  return sok(playerId, query);
}
