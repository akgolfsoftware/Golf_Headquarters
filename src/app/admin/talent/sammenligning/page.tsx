/**
 * /admin/talent/sammenligning — AgencyOS «Sammenlign flere spillere» (B10).
 *
 * Rendrer v10-komponenten <TalentSammenligning> (design-godkjent fasit fra
 * ag-compare.png) med EKTE data fra loadMultiCompare (Prisma). mapCompareData
 * oversetter loaderens MultiCompareData → komponentens CompareData og bevarer
 * tom-tilstander (tomme arrays / «—»-meta) — aldri oppdiktede tall.
 *
 * Valgte spillere styres av ?ids=id1,id2,... (0-4). Server Component.
 * Roller: COACH, ADMIN.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { TalentSammenligning } from "@/components/admin/talent/sammenligning";
import { loadMultiCompare } from "@/lib/admin-compare/multi-compare-data";
import { mapCompareData } from "./map-compare-data";

export const dynamic = "force-dynamic";

type Search = Promise<{ ids?: string }>;

export default async function TalentSammenligningPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sp = await searchParams;
  const ids = (sp.ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const data = await loadMultiCompare(ids);

  return <TalentSammenligning data={mapCompareData(data)} />;
}
