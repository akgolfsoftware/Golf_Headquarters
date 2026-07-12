/**
 * v2-preview: AgencyOS Ny spiller (retning C). Egen top-level route-group
 * (v2preview) som IKKE arver AdminShell — kun root-layout — så V2Shell
 * leverer all chrome (IkonRail/BunnNav) i mørk v2-scope.
 *
 * Auth følger den ekte /admin/spillere/ny-flaten: samme requirePortalUser-
 * guard (ADMIN/COACH). Skjermen er et opprett-skjema uten data-loader (den
 * ekte siden har heller ingen loader), så ingen eksempel-spiller hentes —
 * ærlig tom-tilstand er selve skjemaet. Submit bruker den EKTE server
 * action `createSpiller` og router til den nye spillerens profil.
 *
 * Server component.
 */

import { TilbakeLenke } from "@/components/v2";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { AdminNySpillerV2 } from "@/components/admin/v2/AdminNySpillerV2";

export const dynamic = "force-dynamic";

export default async function V2SpillerNyPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  return (
    <V2Shell aktiv="spillere" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/spillere">Stall</TilbakeLenke>
      <AdminNySpillerV2 />
    </V2Shell>
  );
}
