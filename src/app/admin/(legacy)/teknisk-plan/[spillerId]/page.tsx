import { redirect } from "next/navigation";

/**
 * /admin/teknisk-plan/[spillerId] (legacy) → spiller-plan (v2).
 * Beholder spiller-id så dyplenker lander på riktig person.
 */
export default async function LegacyTekniskPlanRedirect({
  params,
}: {
  params: Promise<{ spillerId: string }>;
}): Promise<never> {
  const { spillerId } = await params;
  redirect(`/admin/spillere/${spillerId}/plan`);
}
