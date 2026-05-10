import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { OnboardingWizard } from "./onboarding-wizard";

export default async function OnboardingPage() {
  await requirePortalUser();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-secondary/40 p-8">
      <div className="w-full max-w-xl rounded-2xl border border-border bg-card p-10 shadow-sm">
        <div className="mb-4 font-display text-xl font-bold tracking-tight">
          AK <em className="font-normal text-primary not-italic md:italic">Golf</em>
        </div>
        <OnboardingWizard />
      </div>
    </main>
  );
}
