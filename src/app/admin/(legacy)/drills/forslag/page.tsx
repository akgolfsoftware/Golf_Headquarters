/**
 * AgencyOS — AI drill-forslag (/admin/drills/forslag).
 *
 * Viser PENDING drill-forslag fra drill-forslag-agenten (CaddieDraft med
 * toolName "createDrillSuggestion"). Coach godkjenner (→ ExerciseDefinition i
 * biblioteket) eller avviser. COACH/ADMIN.
 *
 * V2 chrome via (legacy)/layout V2Shell. Header: Caps/Tittel/TilbakeLenke.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { Caps, Tittel, TilbakeLenke } from "@/components/v2";
import { T } from "@/lib/v2/tokens";
import { DRILL_DRAFT_TOOL } from "@/lib/agents/drill-forslag-agent";
import { ForslagListe, type ForslagRad } from "./forslag-liste";

export const dynamic = "force-dynamic";

const OMRAADE_LABEL: Record<string, string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

export default async function DrillForslagPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const drafts = await prisma.caddieDraft.findMany({
    where: { userId: user.id, toolName: DRILL_DRAFT_TOOL, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const forslag: ForslagRad[] = drafts.map((d) => {
    const inp = (d.toolInput ?? {}) as {
      name?: string;
      description?: string;
      svakesteKategori?: string;
      durationMin?: number;
      videoUrl?: string | null;
    };
    return {
      id: d.id,
      navn: inp.name ?? "Drill",
      beskrivelse: inp.description ?? "",
      omraade: OMRAADE_LABEL[inp.svakesteKategori ?? ""] ?? "Slag",
      varighetMin: typeof inp.durationMin === "number" ? inp.durationMin : null,
      videoUrl: typeof inp.videoUrl === "string" ? inp.videoUrl : null,
    };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: T.gap }}>
      <TilbakeLenke href="/admin/drills">Til biblioteket</TilbakeLenke>
      <div>
        <Caps>Planlegge · Drill-bibliotek</Caps>
        <div style={{ marginTop: 10 }}>
          <Tittel em="forslag">AI drill-</Tittel>
        </div>
        <p style={{ marginTop: 8, maxWidth: 520, fontFamily: T.ui, fontSize: 13, color: T.fg2, lineHeight: 1.5 }}>
          {forslag.length} forslag venter på godkjenning. Godkjente driller legges i biblioteket.
        </p>
      </div>
      <ForslagListe forslag={forslag} />
    </div>
  );
}
