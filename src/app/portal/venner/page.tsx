/**
 * /portal/venner — B39, Strava-mønsteret.
 *
 * Venneliste + søk/legg-til-venn + inn-/utgående forespørsler. Basert på
 * ui_kits/playerhq/phq-venner.jsx (Claude Design, 16. jul 2026). Personvern:
 * venner ser KUN at en økt skjedde — se hentVennProfil for feed-logikken.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero } from "@/components/portal/player-hero";
import { hentVennerData } from "@/lib/venner/actions";
import { VennerClient } from "./VennerClient";

export const dynamic = "force-dynamic";

export default async function VennerPage() {
  await requirePortalUser();
  const data = await hentVennerData();

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 pb-20 sm:px-6">
      <PlayerHero
        eyebrow="PlayerHQ · Sosialt"
        titleLead="Dine"
        titleItalic="venner"
        sub="Legg til venner og se AT de har trent — aldri plan, tall eller coach-notater."
      />
      <VennerClient initial={data} />
    </div>
  );
}
