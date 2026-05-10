import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlanWizard } from "./wizard";

export default async function NyPlanPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const spillere = await prisma.user.findMany({
    where: { role: "PLAYER" },
    select: { id: true, name: true, hcp: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/plans"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        ← Plans
      </Link>

      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Ny plan
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Bygg</em> ny plan
        </h1>
      </header>

      <PlanWizard spillere={spillere} />
    </div>
  );
}
