import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlanBuilderClient } from "./plan-builder-client";

export const dynamic = "force-dynamic";

export default async function NyPlanPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, grupper] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, name: true, hcp: true },
      orderBy: { name: "asc" },
    }),
    prisma.group.findMany({
      select: {
        id: true,
        name: true,
        _count: { select: { members: true } },
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PlanBuilderClient
      spillere={spillere}
      grupper={grupper.map((g) => ({ id: g.id, name: g.name, memberCount: g._count.members }))}
    />
  );
}
