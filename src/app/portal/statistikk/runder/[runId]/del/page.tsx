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
import { harVisbarSg } from "@/lib/ak-sg/visibility";
import { getActiveAkSgVersionId } from "@/lib/ak-sg/active-model";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { DelRundeV2 } from "@/components/portal/v2/DelRundeV2";

type Props = {
  params: Promise<{ runId: string }>;
};

export default async function DelRundePage({ params }: Props) {
  const { runId } = await params;
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });

  const runde = await prisma.round.findFirst({
    where: { id: runId, userId: user.id },
    select: {
      id: true,
      score: true,
      playedAt: true,
      sgTotal: true,
      sgSource: true,
      sgModelVersionId: true,
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
  const activeModelVersionId = await getActiveAkSgVersionId();
  const visSg = harVisbarSg(runde, activeModelVersionId);

  return (
    <V2Shell bredde="kolonne" aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <DelRundeV2
        runde={{
          id: runde.id,
          score: runde.score,
          relativ,
          kursNavn: runde.course.name,
          playedAt: runde.playedAt.toISOString(),
          sgPutt: visSg ? runde.sgPutt : null,
          sgOtt: visSg ? runde.sgOtt : null,
          sgArg: visSg ? runde.sgArg : null,
          sgApp: visSg ? runde.sgApp : null,
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
