"use server";

/**
 * Server actions for PlayerHQ · Tren · Turnering — detalj.
 *
 * `startTurneringsrunde` (D6c «live turneringsrunde», godkjent 2026-07-17):
 * spilleren fører sin egen runde hull-for-hull mens turneringen pågår. Dette
 * er IKKE en sanntids-leaderboard — kun koblingen turnering → runde + inngangen
 * til den eksisterende hull-for-hull-flaten (/portal/mal/runder/[id]/hull, D6a).
 *
 * Round/HoleScore-stacken og Strokes Gained røres ikke — vi legger kun til
 * `roundType:"turnering"` + `tournamentEntryId`. Brutto score; scorekortet føres
 * og totalen auto-summeres i hull-flaten (score:0 til den er ført).
 */

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { sisteSpilteBaneId } from "@/lib/portal/siste-spilte-bane";

export async function startTurneringsrunde(turneringId: string): Promise<void> {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  const entry = await prisma.tournamentEntry.findFirst({
    where: { userId: user.id, tournamentId: turneringId },
    select: { id: true },
  });
  if (!entry) throw new Error("Du er ikke påmeldt denne turneringen");

  // Har spilleren alt en turneringsrunde? Da fortsetter vi den — aldri dublett.
  // Defensiv: kolonnen rounds."tournamentEntryId" finnes kanskje ikke i
  // preview-DB → tolkes som «ingen runde ennå» (scriptet legger den til før
  // deploy).
  let eksisterende: { id: string } | null = null;
  try {
    eksisterende = await prisma.round.findFirst({
      where: { tournamentEntryId: entry.id },
      orderBy: { createdAt: "desc" },
      select: { id: true },
    });
  } catch {
    eksisterende = null;
  }
  if (eksisterende) redirect(`/portal/mal/runder/${eksisterende.id}/hull`);

  // Bane: turneringens egen bane → spillerens sist spilte bane. Round.courseId
  // er påkrevd, så uten en ærlig bane kan runden ikke opprettes (CTA-en vises
  // heller ikke i det tilfellet — se rundeBaneId i loaderen).
  const tournament = await prisma.tournament.findUnique({
    where: { id: turneringId },
    select: { courseId: true },
  });
  const courseId = tournament?.courseId ?? (await sisteSpilteBaneId(user.id));
  if (!courseId) {
    throw new Error(
      "Ingen bane er koblet til turneringen ennå — loggfør en runde manuelt og velg bane der.",
    );
  }

  const runde = await prisma.round.create({
    data: {
      userId: user.id,
      courseId,
      playedAt: new Date(),
      // Brutto totalscore føres i hull-flaten; auto-summeres fra scorekortet.
      score: 0,
      roundType: "turnering",
      tournamentEntryId: entry.id,
    },
    select: { id: true },
  });

  revalidatePath(`/portal/tren/turneringer/${turneringId}`);
  redirect(`/portal/mal/runder/${runde.id}/hull`);
}
