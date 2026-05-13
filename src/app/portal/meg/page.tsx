import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { lesPreferences } from "@/lib/preferences";
import { PageHeader } from "@/components/shared/page-header";
import { AvatarUpload } from "@/components/shared/avatar-upload";
import { ProfilForm } from "./profil-form";

export default async function MegProfil() {
  const user = await requirePortalUser();
  const prefs = lesPreferences(user);

  const parents = await prisma.parentRelation.findMany({
    where: { childId: user.id },
    include: {
      parent: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="PlayerHQ · Min profil"
        titleLead="Slik andre"
        titleItalic="ser deg"
        sub="Bilde, navn og kontaktinfo. Endringer her synes for coach og — om du er under 18 — for foresatte."
      />

      <section className="rounded-lg border border-border bg-card p-6">
        <h2 className="mb-4 font-display text-sm font-semibold tracking-tight">
          Profilbilde
        </h2>
        <AvatarUpload name={user.name} avatarUrl={user.avatarUrl} />
      </section>

      <ProfilForm
        initial={{
          name: user.name,
          phone: user.phone,
          hcp: user.hcp,
          playingYears: user.playingYears,
          ambition: user.ambition,
          homeClub: user.homeClub,
          email: user.email,
          tier: user.tier,
          avatarUrl: user.avatarUrl,
        }}
        prefs={prefs}
        parents={parents.map((p) => ({
          id: p.id,
          name: p.parent.name,
          email: p.parent.email,
          phone: p.parent.phone,
          relationship: p.relationship,
          approved: p.approved,
        }))}
      />
    </div>
  );
}
