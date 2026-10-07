import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getOnboardingState, getResumeStep } from "@/lib/auth/onboarding-state";
import { lesRaaPreferences } from "@/lib/preferences";
import { OnboardingWizard } from "./onboarding-wizard";

export const dynamic = "force-dynamic";

const DATO = /^\d{4}-\d{2}-\d{2}$/;

/** Fødselsdato til gjenopptak: kolonnen først, ellers det som ble skrevet før forelder hadde svart. */
function startFodt(user: Parameters<typeof lesRaaPreferences>[0] & { dateOfBirth: Date | null }): string {
  if (user.dateOfBirth) return user.dateOfBirth.toISOString().slice(0, 10);
  const prefs = lesRaaPreferences(user) as Record<string, unknown>;
  const onboarding = typeof prefs.onboarding === "object" && prefs.onboarding !== null ? (prefs.onboarding as Record<string, unknown>) : {};
  const lagret = onboarding.fodselsdato;
  return typeof lagret === "string" && DATO.test(lagret) ? lagret : "";
}

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

  // Precision Athletics (AU-04): wizarden bygger selv flaten (VeiviserFlate),
  // fordi bredden følger steget. Auth/resume/steg-logikk over er uendret.
  return <OnboardingWizard initialStep={resumeStep} subscribe={subscribe} navn={user.name} startFodt={startFodt(user)} />;
}
