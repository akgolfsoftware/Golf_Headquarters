// Forelder-onboarding i Precision Athletics (AU-04, fire steg). Auth-guard og
// ForelderWizard-logikk uendret; wizarden bygger selv flaten (VeiviserFlate).

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ForelderWizard } from "./forelder-wizard";

export default async function ForelderOnboardingPage() {
  await requirePortalUser();

  return <ForelderWizard />;
}
