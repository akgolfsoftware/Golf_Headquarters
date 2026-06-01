// Foreldre-portal · landing (/forelder). Mobil-først (430px).
// Lese-først innsyn: status på fokus-barnet + kommende + fakturaer + aktivitet.
// Server Component med ekte Prisma-data. Auth-guard: kun PARENT-rollen.

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { hentForelderOversikt } from "@/lib/forelder";
import { ForelderOversiktView } from "@/components/forelder/oversikt";

export default async function ForelderHjem() {
  const user = await requirePortalUser({ allow: ["PARENT"] });
  const data = await hentForelderOversikt(user.id);

  return <ForelderOversiktView data={data} />;
}
