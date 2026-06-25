// Oppgaver-modul (/kommando/oppgaver). Gate i layoutet; her hentes brukerens
// oppgaver fra kommando_tasks og rendres i TaskList (client).

import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { TaskList, type KommandoTaskView } from "@/components/kommando/task-list";

export default async function KommandoOppgaverPage() {
  const user = await canAccessMissionControl();
  if (!user) return null;

  const tasks = await prisma.kommandoTask.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const view: KommandoTaskView[] = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    status: t.status,
    priority: t.priority,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Oppgaver</h1>
      <TaskList initialTasks={view} />
    </div>
  );
}
