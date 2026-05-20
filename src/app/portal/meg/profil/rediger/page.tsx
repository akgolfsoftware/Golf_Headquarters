import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { ProfilRedigerForm } from "./profil-rediger-form";

export const dynamic = "force-dynamic";

export default async function ProfilRedigerPage() {
  const user = await requirePortalUser();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      hcp: true,
      playingYears: true,
      ambition: true,
      homeClub: true,
      avatarUrl: true,
      tier: true,
    },
  });

  const initial = {
    name: dbUser?.name ?? user.name ?? "Markus Røinås Pedersen",
    email: dbUser?.email ?? user.email ?? "markus.rp@example.com",
    phone: dbUser?.phone ?? "+47 412 33 555",
    hcp: dbUser?.hcp ?? -3.5,
    homeClub: dbUser?.homeClub ?? "Søgne & Mandal Golfklubb",
    ambition: dbUser?.ambition ?? "",
    playingYears: dbUser?.playingYears ?? null,
    avatarUrl: dbUser?.avatarUrl ?? null,
    tier: dbUser?.tier ?? "GRATIS",
    fodselsdato: "13.08.2007",
    adresse: "Lundeveien 14, 4621 Kristiansand",
    kjonn: "Mann",
    aListe: "A1 — Toppidrett",
    dominantHand: "Høyrehendt" as const,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Meg · Profil"
        titleLead="Rediger"
        titleItalic="profil"
        sub="HCP synkes automatisk fra GolfBox. Andre felter lagres når du trykker «Lagre endringer»."
      />
      <ProfilRedigerForm initial={initial} />
    </div>
  );
}
