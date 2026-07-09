/**
 * v2-forhåndsvisning — WORKBENCH (spiller-variant, retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell
 * leverer chrome-en, WorkbenchV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbrukt 1:1 fra den ekte siden
 * (src/app/portal/planlegge/workbench/page.tsx). Coach-varianten kommer i bølge 4.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadWorkbenchContext } from "@/lib/workbench/load-context";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { WorkbenchV2 } from "@/components/portal/v2/WorkbenchV2";

export const dynamic = "force-dynamic";

export default async function V2WorkbenchPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const ctx = await loadWorkbenchContext(user.id, 0);

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name}>
      <WorkbenchV2
        data={ctx?.data}
        insights={ctx?.insights ?? null}
        role="player"
        playerName={user.name}
        planStatus={ctx?.planStatus ?? null}
      />
    </V2Shell>
  );
}
