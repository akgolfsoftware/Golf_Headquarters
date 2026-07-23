/**
 * AgencyOS — Talent · Sammenligning (/admin/talent/sammenligning)
 *
 * Datakilde: loadMultiCompare (Prisma) → mapCompareData → TalentSammenligning.
 * Valgte spillere styres av ?ids=id1,id2,... (inntil 4). Uten ?ids= vises de tre
 * øverste fra kohort-rangeringen (siste SG-total) som standardutvalg.
 *
 * V2 chrome via (legacy)/layout V2Shell. Header: Caps/Tittel/TilbakeLenke.
 * Roller: COACH, ADMIN.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { loadMultiCompare } from "@/lib/admin-compare/multi-compare-data";
import { Caps, Tittel, TilbakeLenke } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
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
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <TilbakeLenke href="/admin/talent/radar">Talent-radar</TilbakeLenke>
      <div>
        <Caps>Stall · Talent</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="sammenligning.">Talent-</Tittel>
        </div>
        <p style={{ marginTop: 8, maxWidth: 520, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
          Sammenlign inntil fire spillere side om side. Uten valg vises de tre øverste i kohorten.
        </p>
      </div>
      <TalentSammenligning data={mapCompareData(data)} />
    </div>
  );
}
