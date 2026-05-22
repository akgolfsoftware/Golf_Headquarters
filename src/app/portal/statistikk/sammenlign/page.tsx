/**
 * PlayerHQ · Statistikk · Sammenlign
 *
 * Migrert fra public/design/batch3/sammenlign-statistikk.html.
 * Lar spilleren sammenligne seg med HCP-gruppe, aldersgruppe, topp 10 % U18 eller en spesifikk spiller.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHero as PageHeader } from "@/components/portal/player-hero";
import { SammenlignClient } from "./sammenlign-client";

export default async function SammenlignPage() {
  const user = await requirePortalUser();

  return (
    <div className="space-y-6 pb-20 md:space-y-8 md:pb-16">
      <PageHeader
        eyebrow="PlayerHQ · Statistikk"
        titleLead="Sammenlign deg"
        titleItalic="med"
        titleTrail="…"
        sub={
          user.name
            ? `Mål hvor du står mot referansegrupper, ${user.name.split(" ")[0]}.`
            : "Mål hvor du står mot referansegrupper."
        }
      />
      <SammenlignClient userName={user.name ?? "Spiller"} />
    </div>
  );
}
