import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { CheckoutResumeClient } from "./checkout-resume-client";

export const dynamic = "force-dynamic";

/**
 * /auth/checkout-resume — AU02Betaling.
 * Gjenopptar Stripe Checkout etter signup + onboarding.
 */
export default async function CheckoutResumePage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  await requirePortalUser();
  const { plan } = await searchParams;
  return <CheckoutResumeClient plan={plan} />;
}
