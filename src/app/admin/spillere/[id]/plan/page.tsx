import { redirect } from "next/navigation";

/**
 * `/admin/spillere/[id]/plan` → Spiller 360 (`?fane=tp`), 29.09.2026.
 *
 * Teknisk plan-fanen lister alle tekniske planer med lenke til hver plan (AG-10), og
 * Workbench-lenken når spilleren ikke har en plan.
 * Tilgangssjekken skjer på Spiller 360 (requirePortalUser + coachScopedPlayerWhere).
 */
export default async function Spiller360PlanRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  const { id } = await params;
  redirect(`/admin/spillere/${id}?fane=tp`);
}
