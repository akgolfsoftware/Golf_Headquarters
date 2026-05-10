import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { ProfilForm } from "./profil-form";

export default async function MegProfil() {
  const user = await requirePortalUser();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-semibold leading-tight tracking-tight">
          Personalia
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Endringer her vises i portalen og hos coach.
        </p>
      </div>

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
