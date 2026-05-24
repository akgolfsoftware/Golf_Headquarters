// Foreldreportal · Coach
//
// Foreldretilkobling med coach-dialog er ikke ferdig for beta. Sidens
// hovedformål er å sette forventning og gi tydelig CTA tilbake til
// hovedportalen.

import { MessageSquare, Users } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ForelderHero } from "@/components/forelder/forelder-hero";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function ForelderCoach() {
  await requirePortalUser({ allow: ["PARENT"] });

  return (
    <div className="space-y-8">
      <ForelderHero
        eyebrow="Foreldreportal · Coach"
        titleLead="Dialog med"
        titleItalic="coach"
        sub="Se meldinger fra coachen og svar direkte. Private notater er ikke synlige her."
      />

      <EmptyState
        icon={MessageSquare}
        titleItalic="Coach-dialog"
        titleTrail="kommer Q3 2026"
        sub="Du vil snart kunne lese delte meldinger fra coachen og svare direkte. Private coach-notater forblir kun synlige for coach og spiller."
        cta={
          <a
            href="mailto:support@akgolf.no?subject=Spørsmål%20fra%20foreldre"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-[13px] font-semibold text-primary-foreground hover:opacity-90"
          >
            <Users size={14} strokeWidth={1.5} />
            Kontakt support i mellomtiden
          </a>
        }
      />
    </div>
  );
}
