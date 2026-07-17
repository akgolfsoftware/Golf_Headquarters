/**
 * PlayerHQ · Del runde (/portal/statistikk/runder/[runId]/del) — v2.
 * v2-port 17. juli 2026 (Team D3): `DelRundeV2` erstatter del-runde-client,
 * ruten flyttet ut av (legacy). Auth (runden må tilhøre innlogget bruker),
 * Prisma-query og par/relativ-utregningen er uendret — kun presentasjonslaget
 * er nytt.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { DelRundeV2 } from "@/components/portal/v2/DelRundeV2";

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
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <DelRundeV2
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
    </V2Shell>
  );
}
