/**
 * /admin/spillere/[id]/workbench — Coach-Workbench.
 *
 * Mobil (<md): WorkbenchMobile (år/måned/uke/dag planvisning).
 * Desktop (md+): delt WorkbenchHybrid i coach-modus (spiller-velger + Coach-Skill).
 */

import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { WorkbenchHybrid, type RosterPlayer } from "@/components/workbench-hybrid";
import { WorkbenchMobile, type MobileSession } from "@/components/admin/workbench-mobile";
import { loadWorkbenchData } from "@/lib/workbench/load-workbench";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

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
  const fulltNavn = spiller?.name ?? fornavn;
  const initialer = initialsOf(fulltNavn);

  // Coachens spiller-roster for topbar-velgeren (samme spørring som /admin/stall).
  const rosterRows = await prisma.user
    .findMany({
      where: { role: "PLAYER", deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
      take: 400,
    })
    .catch(() => []);
  const roster: RosterPlayer[] = rosterRows.map((p) => {
    const navn = p.name ?? "Uten navn";
    return { id: p.id, name: navn, initials: initialsOf(navn) };
  });

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

      {/* Desktop (md+) — delt WorkbenchHybrid i coach-modus */}
      <div className="hidden md:block">
        <WorkbenchHybrid
          role="coach"
          data={data}
          currentPlayerId={id}
          playerName={fulltNavn}
          initials={initialer}
          coachName={me.name ?? "Anders Kristiansen"}
          players={roster}
        />
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
