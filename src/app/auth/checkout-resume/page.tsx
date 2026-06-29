import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { CheckoutResumeClient } from "./checkout-resume-client";

export const dynamic = "force-dynamic";

/**
 * /auth/checkout-resume — gjenopptar Stripe Checkout etter signup + onboarding
 * for en besøkende som valgte en coaching-pakke før innlogging.
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
