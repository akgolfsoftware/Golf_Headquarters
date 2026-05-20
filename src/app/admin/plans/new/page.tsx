import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlanWizard } from "./wizard";
import { AiPlanPanel } from "./ai-panel";

export default async function NyPlanPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const [spillere, maler] = await Promise.all([
    prisma.user.findMany({
      where: { role: "PLAYER" },
      select: { id: true, name: true, hcp: true },
      orderBy: { name: "asc" },
    }),
    prisma.planTemplate.findMany({
      where: { active: true },
      select: { id: true, name: true, description: true, weeks: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <Link
        href="/admin/plans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.8} />
        Plans
      </Link>

      <AiPlanPanel spillere={spillere} />

      <PlanWizard spillere={spillere} maler={maler} />
    </div>
  );
}
