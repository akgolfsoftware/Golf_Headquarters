/**
 * /portal/ai/mal-bygger — AI mål-bygger (3-stegs SMART-wizard) — v2.
 * v2-port 16. juli 2026: `AiMalByggerV2` erstatter mal-bygger-wizard (v10),
 * ruten flyttet ut av (legacy). Auth-guard (PLAYER/COACH/ADMIN), props og
 * server action (lagreMalForslag) uendret. Ingen oppdiktede tall — spilleren
 * fyller inn sine egne verdier.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { AiMalByggerV2 } from "@/components/portal/v2/AiMalByggerV2";

export const dynamic = "force-dynamic";

export default async function MalByggerPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });
  const yearEnd = `${new Date().getFullYear()}-12-31`;

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/mal">Mål</TilbakeLenke>
      <AiMalByggerV2
        playerFirstName={(user.name ?? "deg").split(" ")[0]}
        defaultYearEnd={yearEnd}
      />
    </V2Shell>
  );
}
