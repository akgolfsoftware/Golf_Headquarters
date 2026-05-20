/**
 * CoachHQ — Spiller-onboarding (multi-stegs wizard).
 *
 * Server-component som mounter klient-wizard. Wizarden gjør all UX,
 * server action createSpiller utfører persisten i ../ny/actions.ts.
 */

import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { SpillerOnboardingWizard } from "./wizard";

export default async function NySpillerWizardPage() {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-6">
      <Link
        href="/admin/spillere"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
        Stallen
      </Link>

      <SpillerOnboardingWizard />
    </div>
  );
}
