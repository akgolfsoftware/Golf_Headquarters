import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { ForelderWizard } from "./forelder-wizard";

export default async function ForelderOnboardingPage() {
  await requirePortalUser();

  return (
    <OnboardingShell>
      <ForelderWizard />
    </OnboardingShell>
  );
}
