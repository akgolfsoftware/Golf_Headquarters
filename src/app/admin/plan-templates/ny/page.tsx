/**
 * AgencyOS — Ny plan-mal (/admin/plan-templates/ny) — v2.
 * v2-port 17. juli 2026 (Team F1): `AdminPlanMalNyV2` erstatter
 * new-template-form, ruten flyttet ut av (legacy). Auth-guard (COACH + ADMIN)
 * og server action (createTemplate) er uendret — kun presentasjonslaget er nytt.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminPlanMalNyV2 } from "@/components/admin/v2/AdminPlanMalNyV2";

export const dynamic = "force-dynamic";

export default async function NyPlanTemplate() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  return (
    <V2Shell aktiv="planlegge" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/admin/plan-templates">Plan-maler</TilbakeLenke>
      <AdminPlanMalNyV2 />
    </V2Shell>
  );
}
