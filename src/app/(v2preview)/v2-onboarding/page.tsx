/**
 * v2-forhåndsvisning — PlayerHQ Onboarding (retning C). Egen top-level route-
 * group (v2preview) som IKKE arver PortalShell. Onboarding er en egen flyt uten
 * V2Shell/nav-rail — OnboardingV2 rendrer sin egen device-ramme.
 *
 * Auth: requirePortalUser({ allowAwaitingConsent: true }) — onboarding er den
 * flyten som skjer FØR foreldresamtykke er gitt, så mindreårige som venter på
 * samtykke skal IKKE redirectes vekk (jf. onboarding-actions som bevisst bruker
 * getCurrentUserRaw). Steg-state leses via getResumeStep (låst 7-stegs maskin).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getResumeStep } from "@/lib/auth/onboarding-state";
import { isAwaitingGuardianConsent } from "@/lib/auth/minor";
import { T } from "@/lib/v2/tokens";
import { OnboardingV2, type OnboardingV2Data } from "@/components/portal/v2/OnboardingV2";

export const dynamic = "force-dynamic";

export default async function V2OnboardingPreviewPage() {
  const user = await requirePortalUser({ allowAwaitingConsent: true });
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "COACH" || user.role === "ADMIN" || user.role === "GUEST") {
    redirect("/admin");
  }

  const data: OnboardingV2Data = {
    navn: user.name,
    avatarUrl: user.avatarUrl,
    fodselsaar: user.dateOfBirth ? user.dateOfBirth.getFullYear() : null,
    ambisjon: user.ambition,
    venterSamtykke: isAwaitingGuardianConsent(user),
    resumeStep: getResumeStep(user),
  };

  return (
    <main
      style={{
        minHeight: "100svh",
        background: T.bg,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "24px 16px 48px",
        overflowX: "auto",
      }}
    >
      <OnboardingV2 data={data} />
    </main>
  );
}
