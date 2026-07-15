/**
 * AgencyOS — AI drill-forslag v2 (retning C). Rekomponert fra
 * src/app/admin/(legacy)/drills/forslag (`ForslagListe`) — samme loader
 * (CaddieDraft PENDING) og samme godkjenn/avvis-actions (uendret i
 * (legacy)/drills/forslag/actions.ts). `videoUrl` saniteres nå via
 * `safeUrl()` (S-21) før den når klienten (legacy manglet dette).
 *
 * Server component.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { safeUrl } from "@/lib/security/safe-url";
import { DRILL_DRAFT_TOOL } from "@/lib/agents/drill-forslag-agent";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AdminDrillForslagV2, type ForslagRad } from "@/components/admin/v2/AdminDrillForslagV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI drill-forslag · AgencyOS" };

const OMRAADE_LABEL: Record<string, string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

export default async function AdminDrillForslagPage() {
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
      videoUrl: safeUrl(typeof inp.videoUrl === "string" ? inp.videoUrl : null),
    };
  });

  return (
    <V2Shell aktiv="cockpit" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <TilbakeLenke href="/admin/drills">Drill-bibliotek</TilbakeLenke>
      <AdminDrillForslagV2 forslag={forslag} />
    </V2Shell>
  );
}
