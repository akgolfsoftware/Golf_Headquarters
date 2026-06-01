/**
 * /portal/meg — PlayerHQ Profil-oversikt (mobil-først landing).
 *
 * Header (avatar + navn + meta + abonnement-badge), KPI 3-col (Runder/Beste/
 * Snitt), klikkbare profil-rader og "Logg ut". Ekte data via hentProfilOversikt.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentProfilOversikt } from "@/lib/portal-meg/profil-data";
import { ProfilOversiktView } from "@/components/portal/meg/profil-oversikt";

export const dynamic = "force-dynamic";

export default async function MegPage() {
  const user = await requirePortalUser();

  const data = await hentProfilOversikt({
    userId: user.id,
    navn: user.name,
    avatarUrl: user.avatarUrl,
    hcp: user.hcp,
    homeClub: user.homeClub,
    tier: user.tier,
  });

  return <ProfilOversiktView data={data} />;
}
