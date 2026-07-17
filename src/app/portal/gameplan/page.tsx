/**
 * PlayerHQ Gameplan (B30, omdøpt fra "Baneguide" 16. jul 2026) — banebibliotek.
 * V2Shell leverer chrome-en (IkonRail/BunnNav), GameplanV2 rendrer innholds-stacken.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { getBaneLibrary } from "@/lib/gameplan/queries";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { GameplanV2 } from "@/components/portal/v2/GameplanV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function V2GameplanPreviewPage() {
  const user = await requirePortalUser();
  if (user.role === "GUEST") redirect("/admin/kalender");
  if (user.role === "PARENT") redirect("/forelder");

  const data = await getBaneLibrary(user.id);

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/analysere">Analyse</TilbakeLenke>
      <GameplanV2 data={data} />
    </V2Shell>
  );
}
