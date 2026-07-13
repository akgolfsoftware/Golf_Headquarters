/**
 * v2 — PlayerHQ Meg · Sikkerhet (retning C). V2Shell leverer chrome-en
 * (IkonRail/BunnNav, aktiv «meg»), MegSikkerhetV2 rendrer innholds-stacken.
 *
 * Auth + dataloader gjenbruker den tidligere /portal/meg/sikkerhet-siden:
 * requirePortalUser gir bruker, og eneste ekte signal bak score-heuristikken
 * er om kontoen har verifisert e-post (identisk med originalens `user.email`).
 * Ingen fabrikerte verdier.
 */

import { redirect } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { MegSikkerhetV2, type MegSikkerhetData } from "@/components/portal/v2/MegSikkerhetV2";
import { TilbakeLenke } from "@/components/v2";

export const dynamic = "force-dynamic";

export default async function SikkerhetPage() {
  const user = await requirePortalUser();
  if (user.role === "PARENT") redirect("/forelder");
  if (user.role === "GUEST") redirect("/admin/kalender");

  const data: MegSikkerhetData = {
    harEpost: Boolean(user.email),
  };

  return (
    <V2Shell aktiv="meg" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/meg">Meg</TilbakeLenke>
      <MegSikkerhetV2 data={data} />
    </V2Shell>
  );
}
