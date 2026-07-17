/**
 * PlayerHQ · Logg treningsøkt (/portal/trening/logg) — v2.
 * v2-port 17. juli 2026 (Team D2): `TreningLoggV2` erstatter legacy-skjemaet,
 * ruten flyttet ut av (legacy). Lagringen går fortsatt via POST
 * /api/portal/trening/logg (uendret API-kontrakt) med redirect til
 * /portal/gjennomfore — kun presentasjonslaget er nytt.
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import { TreningLoggV2 } from "@/components/portal/v2/TreningLoggV2";

export default async function TreningLoggPage() {
  const user = await requirePortalUser();

  return (
    <V2Shell aktiv="gjor" nav={PLAYERHQ_NAV} navn={user.name ?? undefined} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/gjennomfore">Gjør</TilbakeLenke>
      <TreningLoggV2 />
    </V2Shell>
  );
}
