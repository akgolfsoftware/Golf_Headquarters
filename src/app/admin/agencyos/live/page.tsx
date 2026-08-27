/**
 * AgencyOS · Live-tavle (T9, 27.08.2026) — AG-09 / AG-09b Train-lock.
 *
 * Artefakt, aldri fane (fasit AG-09b3: «Tavla er artefakt, aldri fane»).
 * Åpnes fra Cockpit; «Lukk» går tilbake dit. Erstatter den gamle «Mission
 * Control»-innboks-visningen som lå på denne ruten (statisk seed av
 * e-post/meldinger/Notion) — den var Cockpit-innhold, ikke en live-tavle
 * over økter i gang, og hadde ingen egen Train-lock-fasit. Se
 * docs/natt/T9-DONE.md.
 *
 * Data: WorkbenchSession-erstatningen `TrainingSessionV2` (status
 * IN_PROGRESS) — se src/lib/agencyos/live-tavle-data.ts.
 */

import type { Metadata } from "next";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { lastLiveTavleData } from "@/lib/agencyos/live-tavle-data";
import { AgencyLiveTavleFull } from "@/components/admin/v2/live/AgencyLiveTavleTrainLock";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Live-tavle · AgencyOS" };

export default async function AgencyLivePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await lastLiveTavleData();

  return (
    <V2Shell bredde="full" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <AgencyLiveTavleFull data={data} />
    </V2Shell>
  );
}
