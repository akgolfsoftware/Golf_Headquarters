import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ProfilForm } from "@/app/portal/meg/profil-form";

export default async function CoachProfil() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div className="space-y-6">
      <header>
        <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Profil
        </span>
        <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight">
          <em className="font-normal text-primary md:italic">Min</em> coach-profil
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Vises til spillere når de ser tilknyttet coach.
        </p>
      </header>

      <ProfilForm
        initial={{
          name: user.name,
          phone: user.phone,
          hcp: user.hcp,
          playingYears: user.playingYears,
          ambition: user.ambition,
          homeClub: user.homeClub,
          email: user.email,
        }}
      />
    </div>
  );
}
