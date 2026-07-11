import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesRaaPreferences } from "@/lib/preferences";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { CoachWizard } from "./coach-wizard";

export const dynamic = "force-dynamic";

// Coach-onboarding krever 4 steg. State lagres i User.preferences.coachOnboarding.
const COACH_TOTAL_STEPS = 4;

type CoachOnboardingPrefs = {
  stepCompleted?: number;
  completedAt?: string;
};

export default async function CoachOnboardingPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  // Hvis allerede ferdig — send rett til Coach HQ
  const prefs = lesRaaPreferences(user);
  const coachOnboarding =
    typeof (prefs as Record<string, unknown>).coachOnboarding === "object" &&
    (prefs as Record<string, unknown>).coachOnboarding !== null
      ? ((prefs as Record<string, unknown>).coachOnboarding as CoachOnboardingPrefs)
      : ({ stepCompleted: 0 } as CoachOnboardingPrefs);

  const stepCompleted =
    typeof coachOnboarding.stepCompleted === "number"
      ? coachOnboarding.stepCompleted
      : 0;

  if (stepCompleted >= COACH_TOTAL_STEPS || coachOnboarding.completedAt) {
    redirect("/admin");
  }

  const resumeStep = Math.max(1, Math.min(stepCompleted + 1, COACH_TOTAL_STEPS));

  return (
    <OnboardingShell>
      <CoachWizard
        initialStep={resumeStep}
        initialName={user.name}
        initialEmail={user.email}
        initialPhone={user.phone}
      />
    </OnboardingShell>
  );
}
