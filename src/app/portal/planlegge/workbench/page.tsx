/**
 * PLAYERHQ — WORKBENCH (spiller-variant, retning C, ekte adresse). Egen
 * top-level route-group (v2preview) som IKKE arver PortalShell — kun
 * root-layout. V2Shell leverer chrome-en, WorkbenchV2 rendrer innholds-
 * stacken og eier skrivesiden (ny/flytt/slett økt, publiser, Caddie-forslag)
 * via `actions`-prop bundet til spillerens egne server-actions.
 *
 * Uke-navigasjon: `?uke=N` (0 = inneværende uke), samme mønster som
 * coach-siden (src/app/admin/spillere/[id]/workbench/page.tsx).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadWorkbenchContext } from "@/lib/workbench/load-context";
import { parseWeekOffset } from "@/lib/workbench/session-move-math";
import { publishWorkbenchPlan, hentPubliserDiff } from "@/lib/workbench/publish-actions";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { WorkbenchV2, type WorkbenchV2Actions } from "@/components/portal/v2/WorkbenchV2";
import { applyWorkbenchTemplate } from "@/lib/workbench/apply-template-actions";
import { addWorkbenchSession, moveWorkbenchSession, updateWorkbenchSession, removeWorkbenchSession, duplicateWorkbenchWeek, suggestWeekWithCaddie, applySuggestedWeek, lagreWorkbenchPeriode, slettWorkbenchPeriode, duplicateWorkbenchSession } from "./actions";
import { sokTekniskOppgaver } from "@/lib/workbench/teknisk-oppgave-sok";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ uke?: string }> };

export default async function V2WorkbenchPreviewPage({ searchParams }: Props) {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const weekOffset = parseWeekOffset((await searchParams).uke);
  const ctx = await loadWorkbenchContext(user.id, weekOffset);

  const actions: WorkbenchV2Actions = {
    addSession: addWorkbenchSession,
    moveSession: moveWorkbenchSession,
    updateSession: updateWorkbenchSession,
    applyTemplate: applyWorkbenchTemplate,
    removeSession: removeWorkbenchSession,
    publish: publishWorkbenchPlan,
    publishDiff: hentPubliserDiff,
    duplicateWeek: duplicateWorkbenchWeek,
    // AI-ukeforslag: ekte Anthropic-kall når nøkkel finnes, ellers ærlig
    // standardforslag (usedAi: false-badge i ForslagArk). Aldri auto-lagt inn.
    suggestWeek: suggestWeekWithCaddie,
    applySuggestion: applySuggestedWeek,
    duplicateSession: duplicateWorkbenchSession,
    lagrePeriode: lagreWorkbenchPeriode,
    slettPeriode: slettWorkbenchPeriode,
    searchTeknisk: sokTekniskOppgaver,
  };

  return (
    <V2Shell aktiv="plan" nav={PLAYERHQ_NAV} navn={user.name}>
      <WorkbenchV2
        data={ctx?.data}
        insights={ctx?.insights ?? null}
        role="player"
        playerName={user.name}
        planStatus={ctx?.planStatus ?? null}
        actions={actions}
      />
    </V2Shell>
  );
}
