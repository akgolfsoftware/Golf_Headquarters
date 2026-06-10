/**
 * /portal/meg — PlayerHQ "Meg" (profil), v10-design.
 *
 * Rendrer <MegProfil> (v10-fasit fra ProfileScreen) med EKTE data fra
 * hentProfilOversikt (Prisma). Hero (avatar + eyebrow + navn + e-post),
 * KPI 3-col (Runder/Best/Snitt), fakturaer og "Logg ut".
 *
 * Server component. Auth-guard via requirePortalUser. mapMegData oversetter
 * den eksisterende ProfilOversikt-shapen til MegProfilData. Tom-tilstander
 * bevares — fakturaer er [] fordi loaderen kun gir aggregat (antall/sum),
 * ikke per-rad-data. Aldri liksom-tall.
 *
 * Bolk (3. juni): byttet fra ProfilOversiktView (eldre design) til MegProfil (v10).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentProfilOversikt, type ProfilOversikt } from "@/lib/portal-meg/profil-data";
import { MegProfil, MegProfilDesktop, type MegProfilData } from "@/components/portal/meg/meg-profil";

export const dynamic = "force-dynamic";

/** Oversetter ekte ProfilOversikt → MegProfilData (fasit-struktur). */
function mapMegData(data: ProfilOversikt, epost: string): MegProfilData {
  return {
    navn: data.navn,
    initialer: data.initialer,
    avatarUrl: data.avatarUrl,
    // Eyebrow over navnet: "HCP 4,2 · OSLO GK · ..." (uppercase).
    eyebrow: data.metaDeler.join(" · ").toUpperCase(),
    epost,
    kpi: {
      runder: data.kpi.runder,
      beste: data.kpi.beste,
      snitt: data.kpi.snitt,
    },
    abonnement: data.abonnement,
  };
}

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

  const mapped = mapMegData(data, user.email);
  return (
    <>
      <MegProfil data={mapped} />
      <MegProfilDesktop data={mapped} />
    </>
  );
}
