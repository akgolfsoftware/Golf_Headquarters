// Agent-team-modul (/kommando/team). Gate i layoutet. Laster prosjekter (for
// kobling) + de siste kjøringene med stegene sine.

import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import {
  AgentTeam,
  type AgentTeamRunView,
  type AgentTeamStepView,
} from "@/components/kommando/agent-team";

export const dynamic = "force-dynamic";

export default async function KommandoTeamPage() {
  const user = await canAccessMissionControl();
  if (!user) return null;

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

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Agent-team</h1>
      <p className="mb-5 text-sm text-muted-foreground">
        Flere AI-er jobber sekvensielt på én oppgave. Output fra ett steg mates inn i neste.
      </p>
      <AgentTeam projects={projects} pastRuns={pastRuns} />
    </div>
  );
}
