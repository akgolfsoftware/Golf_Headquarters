/**
 * AgencyOS · Ny turnering — v2. Server-komponent henter kursliste og
 * delegerer til klient-veiviseren. Logikk bevart 1:1 fra legacy-siden.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { TurneringWizardV2 } from "@/components/admin/v2/TurneringWizardV2";

export const dynamic = "force-dynamic";

export default async function NyTurneringPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const courses = await prisma.courseDefinition.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/tournaments">Turneringer</TilbakeLenke>
      <TurneringWizardV2 courses={courses} />
    </V2Shell>
  );
}
