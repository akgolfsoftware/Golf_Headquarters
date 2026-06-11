/**
 * /admin/spillere/[id]/workbench — Coach-Workbench.
 *
 * Mobil (<md): WorkbenchMobile (år/måned/uke/dag planvisning).
 * Desktop (md+): full-screen Workbench med WeekView, DayView, Kanban osv.
 */

import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { Workbench } from "@/components/workbench/workbench";
import { WorkbenchMobile, type MobileSession } from "@/components/admin/workbench-mobile";
import { loadWorkbenchData } from "@/lib/workbench/load-workbench";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CoachWorkbenchPage({ params }: Props) {
  const me = await getCurrentUser();
  if (!me || (me.role !== "ADMIN" && me.role !== "COACH")) {
    redirect("/auth/login");
  }

  const { id } = await params;

  const data = await loadWorkbenchData(id);
  if (data === null) notFound();

  const spiller = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });
  const fornavn = spiller?.name?.split(/\s+/)[0] ?? "spilleren";

  // Mobil: last alle planlagte økter (alle aktive planer, hele planperioden)
  const mobileSessions = await loadMobileSessions(id);

  return (
    <>
      {/* Mobil (<md) — lett-versjon med kalendervisninger */}
      <div className="md:hidden">
        <WorkbenchMobile
          sessions={mobileSessions}
          playerName={spiller?.name ?? fornavn}
          playerId={id}
        />
      </div>

      {/* Desktop (md+) — full Workbench */}
      <div className="hidden md:block">
        <Workbench role="coach" data={data} playerId={id} playerName={fornavn} />
      </div>
    </>
  );
}

async function loadMobileSessions(playerId: string): Promise<MobileSession[]> {
  const plans = await prisma.trainingPlan
    .findMany({
      where: { userId: playerId, isActive: true },
      select: { id: true },
    })
    .catch(() => []);

  if (plans.length === 0) return [];

  const sessions = await prisma.trainingPlanSession
    .findMany({
      where: { planId: { in: plans.map((p) => p.id) } },
      select: {
        id: true,
        scheduledAt: true,
        title: true,
        pyramidArea: true,
        status: true,
        durationMin: true,
      },
      orderBy: { scheduledAt: "asc" },
    })
    .catch(() => []);

  return sessions.map((s) => ({
    id: s.id,
    scheduledAt: s.scheduledAt.toISOString(),
    title: s.title,
    pyramidArea: s.pyramidArea as string,
    status: s.status as string,
    durationMin: s.durationMin,
  }));
}
