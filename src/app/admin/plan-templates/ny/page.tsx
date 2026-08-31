/**
 * AgencyOS — Ny plan-mal (/admin/plan-templates/ny). Produksjonsside.
 * `AdminPlanMalNyV2` (auth-guard + createTemplate-action uendret) — kun
 * token/skall-lag byttet til Train-lock via `TL_SCOPE`, se
 * `src/app/admin/plan-templates/page.tsx` for begrunnelse (Klasse A-porting,
 * ingen egen fasit for CRUD-flatene).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminPlanMalNyV2 } from "@/components/admin/v2/AdminPlanMalNyV2";
import { TL_SCOPE } from "@/components/workbench/wb-tl-scope";

export const dynamic = "force-dynamic";

export default async function NyPlanTemplate() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <div style={TL_SCOPE}>
      <V2Shell bredde="kolonne" aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
        <TilbakeLenke href="/admin/plan/maler">Plan-maler</TilbakeLenke>
        <AdminPlanMalNyV2 />
      </V2Shell>
    </div>
  );
}
