/**
 * /portal/planlegge/workbench — PlayerHQ Workbench (delt planleggings-kjerne).
 */

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { WorkbenchHybrid } from "@/components/workbench-hybrid";
import { loadWorkbenchContext } from "@/lib/workbench/load-context";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";

export const dynamic = "force-dynamic";

function utledInitialer(navn: string): string {
  return (
    navn
      .split(" ")
      .map((d) => d[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "??"
  );
}

export default async function WorkbenchPage({
  searchParams,
}: {
  searchParams: Promise<{ uke?: string }>;
}) {
  const user = await requirePortalUser();

  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const weekOffset = parseWeekOffset((await searchParams).uke);
  const ctx = await loadWorkbenchContext(user.id, weekOffset);
  const data = ctx?.data;

  return (
    <Suspense fallback={null}>
      <WorkbenchHybrid
        role="player"
        data={data}
        insightsLine={ctx?.insights.line ?? null}
        tekniskPlan={ctx?.tekniskPlan ?? null}
        playerName={user.name}
        initials={utledInitialer(user.name)}
        subjectPlayerId={user.id}
        planId={ctx?.planId ?? null}
        planStatus={ctx?.planStatus ?? null}
      />
    </Suspense>
  );
}