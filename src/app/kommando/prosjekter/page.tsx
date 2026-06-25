// Prosjekter-modul (/kommando/prosjekter). Gate i layoutet.

import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { ProjectList, type KommandoProjectView } from "@/components/kommando/project-list";

export default async function KommandoProsjekterPage() {
  const user = await canAccessMissionControl();
  if (!user) return null;

  const [projects, counts] = await Promise.all([
    prisma.kommandoProject.findMany({
      where: { userId: user.id },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    }),
    prisma.kommandoTask.groupBy({
      by: ["projectId"],
      where: { userId: user.id, projectId: { not: null } },
      _count: { _all: true },
    }),
  ]);

  const countByProject = new Map(counts.map((c) => [c.projectId, c._count._all]));

  const view: KommandoProjectView[] = projects.map((p) => ({
    id: p.id,
    name: p.name,
    status: p.status,
    taskCount: countByProject.get(p.id) ?? 0,
  }));

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 font-display text-2xl font-bold tracking-[-0.02em] text-foreground">Prosjekter</h1>
      <ProjectList initialProjects={view} />
    </div>
  );
}
