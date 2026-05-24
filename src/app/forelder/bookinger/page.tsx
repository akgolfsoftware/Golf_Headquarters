// Foreldreportal · Bookinger
//
// Kobling mot barnets bookinger er ikke ferdig for beta. Vi viser tydelig
// "kommer"-melding inntil ParentRelation + Booking-modellene kobles sammen.

import { CalendarDays } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ForelderHero } from "@/components/forelder/forelder-hero";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function ForelderBookinger() {
  await requirePortalUser({ allow: ["PARENT"] });

  return (
    <div className="space-y-8">
      <ForelderHero
        eyebrow="Foreldreportal · Bookinger"
        titleLead="Kommende"
        titleItalic="og historikk"
        sub="Alle bookte timer for barna dine — kommende og tidligere."
      />

      <EmptyState
        icon={CalendarDays}
        titleItalic="Booking-oversikt"
        titleTrail="kommer Q3 2026"
        sub="Du vil snart kunne se kommende og tidligere bookinger for barna dine. Tilkoblingen krever at coachen registrerer foreldre-relasjon."
      />
    </div>
  );
}
