// Forelder-onboarding — v2-port 16. juli 2026: OnboardingShell (mørk
// gradient-ramme) byttet mot VeiviserFlate (v2-flaten, lys — B28), samme
// som spiller-onboardingen. Auth-guard og ForelderWizard-logikk uendret.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { VeiviserFlate } from "@/components/auth/onboarding/wizard-chrome";
import { ForelderWizard } from "./forelder-wizard";

export default async function ForelderOnboardingPage() {
  await requirePortalUser();

  return (
    <VeiviserFlate>
      <ForelderWizard />
    </VeiviserFlate>
  );
}
