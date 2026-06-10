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
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { PlanleggeWorkbench } from "@/components/portal/planlegge/planlegge-workbench";
import { Workbench } from "@/components/workbench/workbench";
import { loadWorkbenchData } from "@/lib/workbench/load-workbench";

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
    loadWorkbenchData(user.id).then((d) => d ?? undefined),
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

      {/* Desktop: den komplette Workbenchen (fasit) */}
      <div className="hidden xl:block">
        <Workbench role="player" data={wbData} />
      </div>
    </>
  );
}
