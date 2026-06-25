// Oppgaver-modul (/kommando/oppgaver). Gate i layoutet; her hentes brukerens
// oppgaver + prosjekter (for kobling) og rendres i TaskList (client).

import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import {
  TaskList,
  type KommandoTaskView,
  type ProjectOption,
} from "@/components/kommando/task-list";

export default async function KommandoOppgaverPage() {
  const user = await canAccessMissionControl();
  if (!user) return null;

  const [tasks, projects] = await Promise.all([
    prisma.kommandoTask.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.kommandoProject.findMany({
      where: { userId: user.id, status: "active" },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true },
    }),
  ]);

  const projectName = new Map(projects.map((p) => [p.id, p.name]));

  const view: KommandoTaskView[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
    projectName: t.projectId ? projectName.get(t.projectId) ?? null : null,
    dueAt: t.dueAt ? t.dueAt.toISOString() : null,
  }));

  const projectOptions: ProjectOption[] = projects.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Oppgaver</h1>
      <TaskList initialTasks={view} projects={projectOptions} />
    </div>
  );
}
