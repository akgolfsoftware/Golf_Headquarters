// PH26Break — Precision Athletics. Data og handlinger er beholdt. Ikke målt i appen.
/**
 * PlayerHQ · Break-tabell (/portal/trening/break-tabell) — v2.
 * v2-port 17. juli 2026 (Team D2): `BreakTabellV2` erstatter legacy
 * break-tabell-client, ruten flyttet ut av (legacy). All break-matte kommer
 * fortsatt uendret fra @/lib/putt-core — kun presentasjonslaget er nytt.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { BreakTabellV2 } from "@/components/portal/v2/BreakTabellV2";

export const dynamic = "force-dynamic";

export default async function BreakTabellPage() {
  await requirePortalUser();

  return (
        <PlayerHQSkall innboksHref="/portal/varsler" uleste={0}>
      <div className="pa-side">
      <BreakTabellV2 />
          </div>
    </PlayerHQSkall>
  );
}
