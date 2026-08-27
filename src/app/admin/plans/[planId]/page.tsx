import { permanentRedirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * Gammel plan-detalj (TrainingPlan, pensjonert modell) → Workbench.
 * Finner spilleren planen tilhørte og sender dit; ukjent plan-id faller
 * tilbake til Plan-hub (ikke notFound — gamle lenker skal fortsatt gi et
 * meningsfullt sted å lande, jf. AG-06).
 */
export default async function AdminPlanDetailRedirect({
  params,
}: {
  params: Promise<{ planId: string }>;
}) {
  const { planId } = await params;

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: planId },
    select: { userId: true },
  });

  permanentRedirect(plan ? `/admin/workbench/${plan.userId}` : "/admin/planlegge");
}
