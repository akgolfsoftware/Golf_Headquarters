/**
 * /portal/planlegge — PlayerHQ Planlegge = Workbench.
 * Mobil (ph-workbench.jsx · WorkbenchScreen mobil): mode-rail + Treningsplan-tidslinje.
 * Desktop (fasit): den komplette Workbenchen (samme som /portal/planlegge/workbench).
 * All planlegging går gjennom Workbench — ett trykkpunkt.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getViewMode } from "@/lib/view-mode";
import { getPlanleggeData } from "@/lib/portal-planlegge/planlegge-data";
import { getWorkbenchData } from "@/app/portal/planlegge/actions";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { PlanleggeWorkbench } from "@/components/portal/planlegge/planlegge-workbench";
import { WorkbenchShell } from "@/components/portal/workbench/WorkbenchShell";

export const dynamic = "force-dynamic";

export default async function PlanleggePage() {
  const user = await requirePortalUser();

  const viewMode = await getViewMode();
  if (user.role === "COACH" || user.role === "ADMIN") {
    if (viewMode !== "player") redirect("/admin");
  }
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const [data, wbData] = await Promise.all([
    getPlanleggeData(user.id),
    getWorkbenchData().catch(() => null),
  ]);

  return (
    <>
      {/* Mobil: mode-rail-Workbench */}
      <div className="mx-auto w-full max-w-[460px] px-4 pb-8 pt-3 sm:px-5 xl:hidden">
        <div className="mb-4">
          <AthleticEyebrow tone="lime">PLANLEGGE · WORKBENCH</AthleticEyebrow>
          <h1 className="mt-1.5 font-display text-2xl font-bold leading-tight tracking-[-0.015em] text-foreground">
            Workbench
          </h1>
          <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">{data.ukeLabel}</p>
        </div>
        <PlanleggeWorkbench data={data} />
      </div>

      {/* Desktop: ny PlayerHQ Workbench */}
      <div className="hidden h-full xl:block">
        {wbData ? (
          <WorkbenchShell data={wbData} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Kunne ikke laste Workbench-data.</p>
          </div>
        )}
      </div>
    </>
  );
}
