/**
 * PlayerHQ · Kalender · Opptatt tid (/portal/kalender/opptatt).
 *
 * Spillerens egne avtaler. De tre andre kildene til opptatt tid —
 * gruppetimeplan, skolerute og fravær — hentes automatisk fra sine egne
 * tabeller og administreres andre steder; de vises ikke her.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { OpptattTidV2 } from "@/components/portal/v2/OpptattTidV2";
import { hentEgenOpptattTid } from "../opptatt-actions";

export const dynamic = "force-dynamic";

export default async function OpptattTidPage() {
  const user = await requirePortalUser({ allow: ["PLAYER", "COACH", "ADMIN"] });

  // Vindu: fire uker bakover for kontekst, ett år fram for gjentakende.
  const naa = new Date();
  const fra = new Date(naa.getTime() - 28 * 24 * 60 * 60 * 1000);
  const til = new Date(naa.getFullYear() + 1, naa.getMonth(), naa.getDate());
  const rader = await hentEgenOpptattTid(fra, til);

  return (
    <V2Shell
      bredde="kolonne"
      aktiv="plan"
      nav={PLAYERHQ_NAV}
      navn={user.name}
      avatarUrl={user.avatarUrl}
    >
      <TilbakeLenke href="/portal/kalender">Kalender</TilbakeLenke>
      <OpptattTidV2 rader={rader} />
    </V2Shell>
  );
}
