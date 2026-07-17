import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getOnboardingState, getResumeStep } from "@/lib/auth/onboarding-state";
import { VeiviserFlate } from "@/components/auth/onboarding/wizard-chrome";
import { OnboardingWizard } from "./onboarding-wizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ subscribe?: string }>;
}) {
  const { subscribe } = await searchParams;
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

  // v2-port 16. juli 2026: wizard på v2-flaten (VeiviserFlate, lys — B28).
  // Auth/resume/steg-logikk over er uendret.
  return (
    <VeiviserFlate>
      <OnboardingWizard initialStep={resumeStep} subscribe={subscribe} />
    </VeiviserFlate>
  );
}
