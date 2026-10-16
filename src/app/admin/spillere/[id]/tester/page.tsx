import { redirect } from "next/navigation";

/**
 * `/admin/spillere/[id]/tester` → Spiller 360 (`?fane=test`), 29.09.2026.
 *
 * Tester-fanen dekker alt testsiden viste: dekning per disiplin, testdager, tildelinger,
 * resultater med øvelsesforslag og Team Norway-resultater.
 * Tilgangssjekken skjer på Spiller 360 (requirePortalUser + coachScopedPlayerWhere).
 */
export default async function Spiller360TesterRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  const { id } = await params;
  redirect(`/admin/spillere/${id}?fane=test`);
}
