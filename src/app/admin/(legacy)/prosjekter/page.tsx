// AgencyOS · Prosjekter — samle oppgaver og AI-arbeid (merget inn fra
// kommandosenteret). ADMIN-only; gjenbruker ProjectList-komponenten.

import { redirect } from "next/navigation";
import { canAccessMissionControl } from "@/lib/auth/canAccessMissionControl";
import { prisma } from "@/lib/prisma";
import { ProjectList, type KommandoProjectView } from "@/components/kommando/project-list";

export const dynamic = "force-dynamic";

export default async function AdminProsjekterPage() {
  const user = await canAccessMissionControl();
  if (!user) redirect("/admin");

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
