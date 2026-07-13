/**
 * v2-forhåndsvisning — PlayerHQ Øvelsesbank (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout.
 * V2Shell leverer chrome-en (IkonRail/BunnNav), OvelsesbankV2 rendrer
 * galleri + detaljpanel.
 *
 * Auth + dataloader gjenbrukt fra portalen: requirePortalUser +
 * getDrillLibraryRich (samme tilgangs-filter som /portal/drills).
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getDrillLibraryRich } from "@/lib/portal-drills/drills-data";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { OvelsesbankV2 } from "@/components/portal/v2/OvelsesbankV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function V2OvelsesbankPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data = await getDrillLibraryRich(user.id);

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/gjennomfore">Gjør</TilbakeLenke>
      <OvelsesbankV2 data={data} />
    </V2Shell>
  );
}
