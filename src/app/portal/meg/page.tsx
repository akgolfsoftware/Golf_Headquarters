/**
 * /portal/meg — PlayerHQ "Meg" (profil).
 *
 * Server component som henter profildata via hentProfil og rendrer
 * <ProfileShell> med ekte Prisma-data: profilfelter, preferanser,
 * tilkoblet konto (Supabase-auth) og achievements. Lagring går via
 * server actions i actions.ts.
 */

import { ProfileShell } from "@/components/portal/profile/ProfileShell";
import { hentProfil, oppdaterProfil, oppdaterPreferences, logout } from "./actions";

export const dynamic = "force-dynamic";

export default async function MegPage() {
  const data = await hentProfil();

  return (
    <ProfileShell
      data={data}
      onUpdateProfile={oppdaterProfil}
      onUpdatePreferences={oppdaterPreferences}
      onLogout={logout}
    />
  );
}
