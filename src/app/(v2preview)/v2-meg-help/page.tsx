/**
 * v2-forhåndsvisning — PlayerHQ Meg · Hjelpesenter (retning C). Egen top-level
 * route-group (v2preview) som IKKE arver PortalShell — kun root-layout. V2Shell
 * leverer chrome-en (IkonRail/BunnNav), MegHelpV2 rendrer innholds-stacken.
 *
 * Auth-guarden speiler den ekte /portal/meg/help-siden (requirePortalUser).
 * Hjelpe-innholdet er statisk redaksjonelt (data.ts) — samme datakontrakt som
 * de eksisterende hjelp-rutene bærer.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegHelpV2, type MegHelpData } from "@/components/portal/v2/MegHelpV2";
import { HJELP_FAQ, HJELP_KATEGORIER, HJELP_ARTIKLER } from "./data";

export const dynamic = "force-dynamic";

export default async function V2MegHelpPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data: MegHelpData = {
    faq: HJELP_FAQ,
    kategorier: HJELP_KATEGORIER,
    artikler: HJELP_ARTIKLER,
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <MegHelpV2 data={data} />
    </V2Shell>
  );
}
