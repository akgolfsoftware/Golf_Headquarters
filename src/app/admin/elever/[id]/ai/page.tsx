import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { CoachAiChat } from "./chat";

export default async function CoachAiPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { id } = await params;

  const player = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      hcp: true,
      ambition: true,
      homeClub: true,
      tier: true,
      playingYears: true,
    },
  });
  if (!player) notFound();

  // Hent kontekst-data: siste runder, aktiv plan, siste tester
  const [siste5Runder, aktivPlan, siste3Tester] = await Promise.all([
    prisma.round.findMany({
      where: { userId: id },
      orderBy: { playedAt: "desc" },
      take: 5,
      include: { course: { select: { name: true } } },
    }),
    prisma.trainingPlan.findFirst({
      where: { userId: id, isActive: true },
      include: {
        sessions: {
          select: { status: true, pyramidArea: true, durationMin: true },
        },
      },
    }),
    prisma.testResult.findMany({
      where: { userId: id },
      orderBy: { takenAt: "desc" },
      take: 3,
      include: { test: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href={`/admin/elever/${id}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← {player.name} · 360-profil
      </Link>

      <PageHeader
        eyebrow={`AI-coach for ${player.name}`}
        titleItalic="Analyser"
        titleTrail="spilleren"
        sub="AI har full tilgang til spillerens HCP, ambisjon, runder og aktive plan."
      />

      <CoachAiChat
        playerName={player.name}
        playerContext={{
          hcp: player.hcp,
          ambition: player.ambition,
          homeClub: player.homeClub,
          tier: player.tier,
          playingYears: player.playingYears,
          sisteRunder: siste5Runder.map((r) => ({
            dato: r.playedAt.toISOString().split("T")[0],
            bane: r.course.name,
            score: r.score,
            sgTotal: r.sgTotal,
          })),
          aktivPlan: aktivPlan
            ? {
                navn: aktivPlan.name,
                antallSesjoner: aktivPlan.sessions.length,
                fullført: aktivPlan.sessions.filter(
                  (s) => s.status === "COMPLETED"
                ).length,
              }
            : null,
          sisteTester: siste3Tester.map((t) => ({
            navn: t.test.name,
            score: t.score,
            dato: t.takenAt.toISOString().split("T")[0],
          })),
        }}
      />
    </div>
  );
}
