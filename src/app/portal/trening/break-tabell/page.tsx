/**
 * PlayerHQ · Break-tabell (/portal/trening/break-tabell) — v2.
 * v2-port 17. juli 2026 (Team D2): `BreakTabellV2` erstatter legacy
 * break-tabell-client, ruten flyttet ut av (legacy). All break-matte kommer
 * fortsatt uendret fra @/lib/putt-core — kun presentasjonslaget er nytt.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { BreakTabellV2 } from "@/components/portal/v2/BreakTabellV2";

export const dynamic = "force-dynamic";

export default async function BreakTabellPage() {
  const user = await requirePortalUser();

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <BreakTabellV2 />
    </V2Shell>
  );
}
