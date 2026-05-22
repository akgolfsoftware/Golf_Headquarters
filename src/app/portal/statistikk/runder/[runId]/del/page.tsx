/**
 * Del runde — /portal/statistikk/runder/[runId]/del
 *
 * Viser en shareable runde-kort med score, SG-fordeling og
 * dele-knapper for sosiale medier + kopier-lenke.
 *
 * Design-kilde: PlayerHQ 03 Del runde.html
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DelRundeClient } from "./del-runde-client";

type Props = {
  params: Promise<{ runId: string }>;
};

export default async function DelRundePage({ params }: Props) {
  const { runId } = await params;
  const user = await requirePortalUser();

  const runde = await prisma.round.findFirst({
    where: { id: runId, userId: user.id },
    select: {
      id: true,
      score: true,
      playedAt: true,
      sgTotal: true,
      sgOtt: true,
      sgApp: true,
      sgArg: true,
      sgPutt: true,
      notes: true,
      course: {
        select: { id: true, name: true, par: true },
      },
    },
  });

  if (!runde) notFound();

  const par = runde.course.par ?? 72;
  const relativ = runde.score - par;

  return (
    <DelRundeClient
      runde={{
        id: runde.id,
        score: runde.score,
        relativ,
        kursNavn: runde.course.name,
        playedAt: runde.playedAt.toISOString(),
        sgPutt: runde.sgPutt ?? null,
        sgOtt: runde.sgOtt ?? null,
        sgArg: runde.sgArg ?? null,
        sgApp: runde.sgApp ?? null,
      }}
      spiller={{
        navn: user.name,
        initial: (user.name.trim().charAt(0) ?? "?").toUpperCase(),
        hcp: user.hcp ?? null,
        homeClub: user.homeClub ?? null,
      }}
    />
  );
}
