import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { AddSessionWizard } from "@/components/admin/add-session-wizard";

export default async function NyOktPage({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const { planId } = await params;

  const [plan, exercises] = await Promise.all([
    prisma.trainingPlan.findUnique({
      where: { id: planId },
      select: { id: true, name: true },
    }),
    prisma.exerciseDefinition.findMany({
      orderBy: [{ pyramidArea: "asc" }, { name: "asc" }],
    }),
  ]);

  if (!plan) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 sm:px-6">
      <Link
        href={`/portal/coach/plans/${planId}`}
        className="inline-flex min-h-11 items-center gap-1 font-mono text-[12px] font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronRight size={14} strokeWidth={1.5} className="rotate-180" />
        {plan.name}
      </Link>

      <PageHeader
        eyebrow="AgencyOS · Ny økt"
        titleLead="Legg til"
        titleItalic="økt"
      />

      <AddSessionWizard planId={planId} exercises={exercises} />
    </div>
  );
}
