/**
 * PlayerHQ Runde-detalj — v2. Auth-guard + Prisma-loader gjenbrukt 1:1 fra
 * legacy-skjermen; hull-for-hull bygges fra Shot-modellen (score per hull =
 * antall registrerte slag). V2Shell eier chrome-en.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { RundeDetaljV2, type RundeDetaljData } from "@/components/portal/v2/RundeDetaljV2";

export const dynamic = "force-dynamic";

export default async function RundeDetaljPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;

  const runde = await prisma.round.findUnique({
    where: { id },
    include: {
      course: true,
      shots: { orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }] },
    },
  });

  if (!runde) notFound();
  if (runde.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") notFound();

  // Hull-for-hull fra Shot-modellen: score per hull = antall registrerte slag.
  const hullMap = new Map<number, { par: number; score: number }>();
  for (const s of runde.shots) {
    const e = hullMap.get(s.holeNumber);
    if (e) e.score += 1;
    else hullMap.set(s.holeNumber, { par: s.holePar, score: 1 });
  }
  const hull = [...hullMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([nr, h]) => ({ nr, par: h.par, score: h.score, sg: null }));

  const sgKategorier = (
    [
      { akse: "OTT", sg: runde.sgOtt },
      { akse: "APP", sg: runde.sgApp },
      { akse: "ARG", sg: runde.sgArg },
      { akse: "PUTT", sg: runde.sgPutt },
    ] as const
  ).flatMap((k) => (k.sg == null ? [] : [{ akse: k.akse, sg: k.sg }]));

  const data: RundeDetaljData = {
    id: runde.id,
    baneNavn: runde.course.name,
    datoTekst: runde.playedAt.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    score: runde.score,
    par: runde.course.par,
    sgTotal: runde.sgTotal,
    sgKategorier,
    hull,
    erEier: runde.userId === user.id,
  };

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <RundeDetaljV2 data={data} />
    </V2Shell>
  );
}
