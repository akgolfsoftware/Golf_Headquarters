/**
 * v2 — PlayerHQ Min profil (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav), MinProfilV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbruker den ekte /portal/meg-profilkilden: hentProfil
 * for navn/avatar/HCP/klubb/fødselsår, og User-samtykkefeltene (GDPR art. 8)
 * for foreldresamtykke-raden. Ingen fabrikkerte felter.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentProfil } from "@/app/portal/meg/actions";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MinProfilV2, type MinProfilData } from "@/components/portal/v2/MinProfilV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function ProfilPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const profil = await hentProfil();

  // Foreldresamtykke — reelle felter på User (ikke i ProfileData).
  const consent = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      requiresGuardianConsent: true,
      guardianConsentGivenAt: true,
      guardianConsentByUserId: true,
    },
  });
  const guardian = consent?.guardianConsentByUserId
    ? await prisma.user.findUnique({
        where: { id: consent.guardianConsentByUserId },
        select: { name: true },
      })
    : null;

  const fodselsaar = profil.user.dateOfBirth ? new Date(profil.user.dateOfBirth).getFullYear() : null;

  const data: MinProfilData = {
    navn: profil.user.name,
    avatarUrl: profil.user.avatarUrl,
    epost: profil.user.email,
    hcp: profil.user.hcp,
    homeClub: profil.user.homeClub,
    fodselsaar,
    samtykke: {
      kreves: consent?.requiresGuardianConsent ?? false,
      godkjentISO: consent?.guardianConsentGivenAt ? consent.guardianConsentGivenAt.toISOString() : null,
      godkjentAvNavn: guardian?.name ?? null,
    },
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={data.navn} avatarUrl={data.avatarUrl}>
      <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
      <MinProfilV2 data={data} />
    </V2Shell>
  );
}
