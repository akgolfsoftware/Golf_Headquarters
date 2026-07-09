/**
 * v2-forhåndsvisning — AgencyOS Spiller-tester (coach-view, retning C). Egen
 * top-level route-group (v2preview) som IKKE arver PortalShell/AdminShell — kun
 * root-layout — så V2Shell leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth + dataloader gjenbrukes 1:1 fra den ekte siden
 * (src/app/admin/spillere/[id]/tester): requirePortalUser (ADMIN/COACH) +
 * loadSpillerTesterData. Til preview plukkes en EKTE eksempel-spiller (helst en
 * med registrerte testresultat). Finnes ingen → ærlig tom-tilstand.
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { loadSpillerTesterData } from "@/lib/admin/spiller-tester-data";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminSpillerTesterV2 } from "@/components/admin/v2/AdminSpillerTesterV2";
import { Kort, TomTilstand } from "@/components/v2";

export const dynamic = "force-dynamic";

/** Ekte eksempel-spiller: prioritér en med testresultat, ellers hvilken som helst. */
async function finnEksempelSpillerId(): Promise<string | null> {
  const medTester = await prisma.user.findFirst({
    where: { role: "PLAYER", deletedAt: null, testResults: { some: {} } },
    orderBy: { name: "asc" },
    select: { id: true },
  });
  if (medTester) return medTester.id;

  const hvemSomHelst = await prisma.user.findFirst({
    where: { role: "PLAYER", deletedAt: null },
    orderBy: { name: "asc" },
    select: { id: true },
  });
  return hvemSomHelst?.id ?? null;
}

export default async function V2SpillerTesterPreviewPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const spillerId = await finnEksempelSpillerId();
  const data = spillerId ? await loadSpillerTesterData(spillerId) : null;

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      {data && spillerId ? (
        <AdminSpillerTesterV2 data={data} playerId={spillerId} />
      ) : (
        <Kort>
          <TomTilstand
            icon="users"
            title="Ingen spiller å forhåndsvise"
            sub="Ingen aktive spillere er registrert ennå — koble en spiller for å se testprofilen."
          />
        </Kort>
      )}
    </V2Shell>
  );
}
