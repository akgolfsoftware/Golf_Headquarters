/**
 * PlayerHQ · Ny økt — wizard
 *
 * Migrert fra public/design/batch3/ny-okt-wizard.html.
 * 4-stegs wizard: type → drills → tid/sted → bekreft.
 */
import Link from "next/link";
import { Lock } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { EmptyState } from "@/components/shared/empty-state";
import { NyOktWizard } from "./wizard";

export default async function NyOktPage() {
  const user = await requirePortalUser();

  if (user.tier === "GRATIS") {
    return (
      <div className="space-y-6">
        <PageHeader
          eyebrow="PlayerHQ · Ny økt"
          titleLead="Lag din"
          titleItalic="egen"
          titleTrail="økt"
          sub="Bygg dine egne treningsøkter med valgfrie drills — en av Pro-fordelene."
        />
        <EmptyState
          icon={Lock}
          titleItalic="Krever Pro"
          sub="Egendefinerte økter er en del av Pro-abonnementet (300 kr/mnd). Oppgrader for å designe dine egne treningsøkter med valgfrie drills."
          cta={
            <Link
              href="/portal/meg/abonnement"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
            >
              Se Pro-fordeler
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <PageHeader
        eyebrow="PlayerHQ · Ny økt"
        titleLead="Lag din"
        titleItalic="egen"
        titleTrail="økt"
        sub="Sett sammen en økt utenfor coach-planen din — på 4 raske steg."
      />
      <NyOktWizard />
    </div>
  );
}
