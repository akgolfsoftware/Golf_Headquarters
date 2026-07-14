/**
 * AgencyOS — AI Workspace (`/admin/ai`), v2.
 * Port av `(legacy)/ai/page.tsx` (2026-07-14, AgencyOS Bølge 3.13) — samme
 * `AgentRun`/`PlanAction`-datamodell, `applyAiAction` er en ekte server
 * action (erstatter legacy sin inline per-rad-closure).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminAiV2, type AiFane, type AiHandlingV2, type AiKjoringV2 } from "@/components/admin/v2/AdminAiV2";

export const dynamic = "force-dynamic";

async function applyAiAction(formData: FormData) {
  "use server";
  const actionId = formData.get("actionId");
  if (typeof actionId !== "string" || !actionId) return;
  const action = await prisma.planAction.findUnique({ where: { id: actionId } });
  if (!action) return;
  await prisma.planAction.update({
    where: { id: actionId },
    data: {
      status: "ACCEPTED",
      suggestion: { appliedAt: new Date().toISOString(), note: "Applied via AI workspace", previous: action.suggestion },
    },
  });
}

export default async function AIWorkspacePage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { tab } = await searchParams;
  const fane: AiFane = tab === "chat" || tab === "agenter" ? tab : "kode";

  const [recentRuns, recentActions] = await Promise.all([
    prisma.agentRun.findMany({
      where: { agentName: { startsWith: "ai-code-session" } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.planAction.findMany({
      where: { actionType: "AI_CODE_SESSION" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const siste: AiKjoringV2[] = recentRuns.map((r) => ({
    id: r.id,
    agentName: r.agentName,
    status: r.status,
    datoTekst: r.createdAt.toISOString().slice(0, 16),
  }));

  const handlinger: AiHandlingV2[] = recentActions.map((a) => ({
    id: a.id,
    actionType: a.actionType,
    status: a.status,
    forslagTekst: `${JSON.stringify(a.suggestion).slice(0, 100)}...`,
  }));

  return (
    <V2Shell nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminAiV2 fane={fane} siste={siste} handlinger={handlinger} applyAction={applyAiAction} />
    </V2Shell>
  );
}
