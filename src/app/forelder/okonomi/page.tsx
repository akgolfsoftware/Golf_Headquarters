// Foreldreportal · Økonomi
//
// Abonnement og fakturaer for barnet kobles sammen i Q3 2026.

import { CreditCard } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ForelderHero } from "@/components/forelder/forelder-hero";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function ForelderOkonomi() {
  await requirePortalUser({ allow: ["PARENT"] });

  return (
    <div className="space-y-8">
      <ForelderHero
        eyebrow="Foreldreportal · Økonomi"
        titleLead="Abonnement"
        titleItalic="og betaling"
        sub="Status for abonnement, fakturaer og kommende trekk."
      />

      <EmptyState
        icon={CreditCard}
        titleItalic="Økonomi-oversikt"
        titleTrail="kommer Q3 2026"
        sub="Du vil snart kunne se abonnement-status, fakturaer og kommende betalinger for barnet ditt på ett sted."
      />
    </div>
  );
}
