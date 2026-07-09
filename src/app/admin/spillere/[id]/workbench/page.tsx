/**
 * /admin/spillere/[id]/workbench — Coach-Workbench.
 *
 * Full paritet mobil + desktop: delt WorkbenchHybrid i coach-modus.
 */

import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { prisma } from "@/lib/prisma";
import { canCoachAccessPlayer } from "@/lib/sg-hub/coach-access";
import { WorkbenchHybrid, type RosterPlayer } from "@/components/workbench-hybrid";
import { loadWorkbenchContext } from "@/lib/workbench/load-context";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ uke?: string }>;
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default async function CoachWorkbenchPage({ params, searchParams }: Props) {
  const me = await getCurrentUser();
  if (!me || (me.role !== "ADMIN" && me.role !== "COACH")) {
    redirect("/auth/login");
  }

  const { id } = await params;
  const weekOffset = parseWeekOffset((await searchParams).uke);

  const hasAccess = await canCoachAccessPlayer(me.id, id, me.role);
  if (!hasAccess) notFound();

  const ctx = await loadWorkbenchContext(id, weekOffset);
  if (ctx === null) notFound();
  const data = ctx.data;

  const spiller = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });
  const fornavn = spiller?.name?.split(/\s+/)[0] ?? "spilleren";
  const fulltNavn = spiller?.name ?? fornavn;
  const initialer = initialsOf(fulltNavn);

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

  return (
    <Suspense fallback={null}>
      <WorkbenchHybrid
        role="coach"
        data={data}
        insightsLine={ctx.insights.line}
        tekniskPlan={ctx.tekniskPlan}
        currentPlayerId={id}
        playerName={fulltNavn}
        initials={initialer}
        coachName={me.name ?? "Anders Kristiansen"}
        players={roster}
        subjectPlayerId={id}
        planId={ctx.planId}
        planStatus={ctx.planStatus}
      />
    </Suspense>
  );
}