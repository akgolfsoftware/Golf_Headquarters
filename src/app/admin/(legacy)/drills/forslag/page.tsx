/**
 * AgencyOS — AI drill-forslag (/admin/drills/forslag).
 *
 * Viser PENDING drill-forslag fra drill-forslag-agenten (CaddieDraft med
 * toolName "createDrillSuggestion"). Coach godkjenner (→ ExerciseDefinition i
 * biblioteket) eller avviser. COACH/ADMIN.
 */

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgPage, AgPageHead } from "@/components/admin/agencyos/ui";
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
    <AgPage>
      <AgPageHead
        eyebrow="Planlegge · Drill-bibliotek"
        title="AI drill-"
        italic="forslag"
        lead={`${forslag.length} forslag venter på godkjenning. Godkjente driller legges i biblioteket.`}
        actions={
          <Link
            href="/admin/drills"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            Til biblioteket
          </Link>
        }
      />
      <ForslagListe forslag={forslag} />
    </AgPage>
  );
}
