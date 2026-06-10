import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getOnboardingState, getResumeStep } from "@/lib/auth/onboarding-state";
import { OnboardingWizard } from "./onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await requirePortalUser();

  // P7 state-machine: auto-resume eller redirect hvis ferdig
  const state = getOnboardingState(user);

  if (state.isComplete) {
    // Bruker har fullført onboarding tidligere — send rett til portal
    if (user.role === "PARENT") redirect("/forelder");
    if (user.role === "COACH" || user.role === "ADMIN") redirect("/admin");
    redirect("/portal");
  }

  // Forelder-onboarding har egen rute
  if (user.role === "PARENT") {
    redirect("/auth/onboarding/forelder");
  }

  const resumeStep = getResumeStep(user);

  // Fersk fasit (ph-auth.jsx → AOnboarding): wizard direkte på cream-flate,
  // uten mørk gradient-ramme. Forelder-flyten beholder OnboardingShell.
  return (
    <main className="min-h-svh bg-background pb-6">
      <OnboardingWizard initialStep={resumeStep} />
    </main>
  );
}
