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
import { ProjectList, type KommandoProjectView } from "@/components/kommando/project-list";
import { TaskList, type KommandoTaskView } from "@/components/kommando/task-list";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";
export const metadata = { title: "Agent-team · AgencyOS (v2)" };

export default async function V2AdminAgentTeamPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  // Alle prosjekter (også arkiverte) + task-teller: prosjektstyringen bor nå
  // HER — /admin/prosjekter er redirect hit (B4, 2026-07-12).
  // Oppgavelisten (KommandoTask CRUD) er montert her fra og med B8
  // (2026-07-16) — /kommando/oppgaver er fjernet, dette er den nye,
  // eneste flaten for å opprette/fullføre/slette en oppgave. Frister vises
  // også som overlegg i /admin/kalender.
  const [projects, alleProsjekter, taskCounts, runs, alleOppgaver] = await Promise.all([
    prisma.kommandoProject.findMany({
      where: { userId: user.id, status: "active" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
    prisma.kommandoProject.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.kommandoTask.groupBy({
      by: ["projectId"],
      where: { userId: user.id, projectId: { not: null } },
      _count: { _all: true },
    }),
    prisma.kommandoAgentRun.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.kommandoTask.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const countByProject = new Map(taskCounts.map((c) => [c.projectId, c._count._all]));
  const prosjektVisning: KommandoProjectView[] = alleProsjekter.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    taskCount: countByProject.get(p.id) ?? 0,
  }));

  const projectName = new Map(projects.map((p) => [p.id, p.name]));
  const allProjectNameById = new Map(alleProsjekter.map((p) => [p.id, p.name]));

  const oppgaveVisning: KommandoTaskView[] = alleOppgaver.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    projectName: t.projectId ? allProjectNameById.get(t.projectId) ?? null : null,
    dueAt: t.dueAt ? t.dueAt.toISOString() : null,
  }));
  const prosjektAlternativer = projects.map((p) => ({ id: p.id, name: p.name }));

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
      <TilbakeLenke href="/admin/agents">AI-agenter</TilbakeLenke>
      <AdminAgentTeamV2 data={data} />
      <h2 className="mt-2 mb-3 font-display text-[13px] font-semibold text-foreground">Prosjekter</h2>
      <ProjectList initialProjects={prosjektVisning} />
      <h2 className="mt-8 mb-3 font-display text-[13px] font-semibold text-foreground">Oppgaver</h2>
      <TaskList initialTasks={oppgaveVisning} projects={prosjektAlternativer} />
    </V2Shell>
  );
}
