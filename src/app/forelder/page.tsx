// Foreldre-portal · landing (/forelder). Mobil-først (390px), terminal-lys-fasit.
// Read-only, forklarende: samtykke-status + narrativ ukerapport + 8-ukers SG-trend
// + coach-notat. Server Component med ekte Prisma-data. Auth-guard: kun PARENT.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentForelderUkerapport } from "@/lib/forelder";
import { ForelderHjemTerminal } from "@/components/forelder/hjem-terminal";

export default async function ForelderHjem() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const data = await hentForelderUkerapport(user.id);

  if (!data) {
    return (
      <div className="mx-auto w-full max-w-[440px] px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Ingen barn er koblet til kontoen din ennå. Be coachen din om en
          forelder-invitasjon.
        </p>
      </div>
    );
  }

  return <ForelderHjemTerminal data={data} />;
}
