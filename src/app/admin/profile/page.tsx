import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { lesPreferences } from "@/lib/preferences";
import { ProfilForm } from "@/app/portal/meg/profil-form";
import { PageHeader } from "@/components/shared/page-header";

export default async function CoachProfil() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const prefs = lesPreferences(user);

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="CoachHQ · Konto · Profil"
        titleLead="Profilen"
        titleItalic="din"
        titleTrail="— slik spillerne ser deg"
        sub="Endringer du gjør her vises i PlayerHQ og på offentlig coach-profil innen 5 minutter."
      />

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
        parents={[]}
      />
    </div>
  );
}
