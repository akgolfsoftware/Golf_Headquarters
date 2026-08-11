/**
 * AgencyOS — Spillerprofil fullskjerm (/admin/spillere/[id]).
 *
 * Fasitens `body.full`-modus (designsystem/paper/fase1/spillerprofil.html:
 * 312-317): samme profil som artefaktpanelet på /admin/spillere (?profil=),
 * men i full bredde — kpirad i 4 kolonner og seksjonene i CSS-spalter.
 * Samme loader som panelet (loadSpillerProfilPanel) — én datakontrakt,
 * to visninger. notFound() når spilleren ikke finnes/ikke er PLAYER
 * (loaderen bruker coachScopedPlayerWhere — samme tilgangsport som før).
 *
 * Det gamle dashbordet (SpillerDashboardV2) er tatt av ruten 2026-08-11 som
 * del av fasit-avvikslukkingen — komponenten står igjen i repoet til Anders
 * har signert skjermen (gjenbrukes eller arkiveres da).
 *
 * Server component.
 */

import { notFound } from "next/navigation";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { SpillerProfilFull } from "@/components/admin/v2/SpillerProfilPanel";
import { loadSpillerProfilPanel } from "@/lib/admin-spiller/spiller-profil-panel-data";

export const dynamic = "force-dynamic";

export default async function SpillerProfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { id } = await params;

  const data = await loadSpillerProfilPanel({ id: user.id, role: user.role }, id);
  if (!data) notFound();

  return (
    <V2Shell bredde="full" aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <SpillerProfilFull data={data} />
    </V2Shell>
  );
}
