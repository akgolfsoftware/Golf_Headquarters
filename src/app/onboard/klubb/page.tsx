import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesRaaPreferences } from "@/lib/preferences";
import { OnboardingShell } from "@/components/onboarding/onboarding-shell";
import { KlubbWizard } from "./klubb-wizard";

export const dynamic = "force-dynamic";

// Klubb-onboarding har 5 steg. State lagres i User.preferences.klubbOnboarding.
const KLUBB_TOTAL_STEPS = 5;

type KlubbOnboardingPrefs = {
  stepCompleted?: number;
  completedAt?: string;
};

export default async function KlubbOnboardingPage() {
  // Kun ADMIN kan onboarde klubb (en klubb signerer opp via en hovedkontakt).
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const prefs = lesRaaPreferences(user);
  const klubbOnboarding =
    typeof (prefs as Record<string, unknown>).klubbOnboarding === "object" &&
    (prefs as Record<string, unknown>).klubbOnboarding !== null
      ? ((prefs as Record<string, unknown>).klubbOnboarding as KlubbOnboardingPrefs)
      : ({ stepCompleted: 0 } as KlubbOnboardingPrefs);

  const stepCompleted =
    typeof klubbOnboarding.stepCompleted === "number"
      ? klubbOnboarding.stepCompleted
      : 0;

  if (stepCompleted >= KLUBB_TOTAL_STEPS || klubbOnboarding.completedAt) {
    redirect("/admin");
  }

  const resumeStep = Math.max(1, Math.min(stepCompleted + 1, KLUBB_TOTAL_STEPS));

  return (
    <OnboardingShell>
      <KlubbWizard
        initialStep={resumeStep}
        initialContactName={user.name}
        initialContactEmail={user.email}
      />
    </OnboardingShell>
  );
}
