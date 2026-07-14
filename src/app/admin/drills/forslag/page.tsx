/**
 * AgencyOS — AI drill-forslag (`/admin/drills/forslag`), v2.
 *
 * Port av `(legacy)/drills/forslag/page.tsx` (2026-07-14, AgencyOS Bølge 1.2) —
 * samme `CaddieDraft`-datamodell, ny presentasjon i `AdminDrillForslagV2`.
 * `forslag/actions.ts` bor fortsatt under `(legacy)/drills/forslag/` — delt
 * server actions, ikke gammel UI.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { DRILL_DRAFT_TOOL } from "@/lib/agents/drill-forslag-agent";
import { AdminDrillForslagV2, type ForslagRad } from "@/components/admin/v2/AdminDrillForslagV2";

export const dynamic = "force-dynamic";
export const metadata = { title: "AI drill-forslag · AgencyOS (v2)" };

const OMRAADE_LABEL: Record<string, string> = {
  OTT: "Tee-slag", APP: "Innspill", ARG: "Nærspill", PUTT: "Putting",
};

export default async function DrillForslagPage() {
  const user = await requirePortalUser({ allow: ["COACH", "ADMIN"] });

  const drafts = await prisma.caddieDraft.findMany({
    where: { userId: user.id, toolName: DRILL_DRAFT_TOOL, status: "PENDING" },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const forslag: ForslagRad[] = drafts.map((d) => {
    const inp = (d.toolInput ?? {}) as { name?: string; description?: string; svakesteKategori?: string; durationMin?: number; videoUrl?: string | null };
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
    <V2Shell aktiv="drills" nav={AGENCYOS_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <AdminDrillForslagV2 forslag={forslag} tilbakeHref="/admin/drills" />
    </V2Shell>
  );
}
