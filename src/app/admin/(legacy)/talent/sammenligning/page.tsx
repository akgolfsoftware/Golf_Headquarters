/**
 * AgencyOS — Talent · Sammenligning (/admin/talent/sammenligning)
 *
 * Datakilde: loadMultiCompare (Prisma) → mapCompareData → TalentSammenligning (v10).
 * Valgte spillere styres av ?ids=id1,id2,... (inntil 4). Uten ?ids= vises de tre
 * øverste fra kohort-rangeringen (siste SG-total) som standardutvalg.
 *
 * Roller: COACH, ADMIN.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadMultiCompare } from "@/lib/admin-compare/multi-compare-data";
import { AgPage } from "@/components/admin/agencyos/ui";
import { TalentSammenligning } from "@/components/admin/talent/sammenligning";
import { mapCompareData } from "./map-compare-data";

export const dynamic = "force-dynamic";

type Search = Promise<{ ids?: string }>;

export default async function TalentSammenligningPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const viewer = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const sp = await searchParams;
  const ids = (sp.ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let data = await loadMultiCompare(ids, viewer);
  if (data.players.length === 0) {
    const standard = data.cohort.slice(0, 3).map((c) => c.userId);
    if (standard.length > 0) data = await loadMultiCompare(standard, viewer);
  }

  return (
    <AgPage>
      <TalentSammenligning data={mapCompareData(data)} />
    </AgPage>
  );
}
