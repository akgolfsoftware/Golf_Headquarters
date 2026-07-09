/**
 * v2-preview: AgencyOS Agent-team (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell leverer
 * all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + data følger den ekte /admin/agent-team-flaten: samme Prisma-loader
 * (KommandoProject aktive + KommandoAgentRun siste 10 + KommandoAgentStep),
 * scopet til innlogget bruker. Auth-guarden er hevet til requirePortalUser
 * (ADMIN/COACH) for v2-preview-linja (den ekte skjermen er ADMIN-only via
 * canAccessMissionControl — se «gaps» i leveransen).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import {
  AdminAgentTeamV2,
  type AdminAgentTeamV2Data,
  type AgentTeamStepView,
  type AgentTeamRunView,
} from "@/components/admin/v2/AdminAgentTeamV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agent-team · AgencyOS (v2)" };

export default async function V2AdminAgentTeamPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const [projects, runs] = await Promise.all([
    prisma.kommandoProject.findMany({
      where: { userId: user.id, status: "active" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.kommandoAgentRun.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const projectName = new Map(projects.map((p) => [p.id, p.name]));

  const steps = runs.length
    ? await prisma.kommandoAgentStep.findMany({
        where: { runId: { in: runs.map((r) => r.id) } },
        orderBy: { orderIndex: "asc" },
      })
    : [];

  const stepsByRun = new Map<string, AgentTeamStepView[]>();
  for (const s of steps) {
    const list = stepsByRun.get(s.runId) ?? [];
    list.push({ index: s.orderIndex, model: s.model, role: s.role, status: s.status, output: s.output });
    stepsByRun.set(s.runId, list);
  }

  const pastRuns: AgentTeamRunView[] = runs.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    projectName: r.projectId ? projectName.get(r.projectId) ?? null : null,
    steps: stepsByRun.get(r.id) ?? [],
  }));

  const data: AdminAgentTeamV2Data = { projects, pastRuns };

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <AdminAgentTeamV2 data={data} />
    </V2Shell>
  );
}
