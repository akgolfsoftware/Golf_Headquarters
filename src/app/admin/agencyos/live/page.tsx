/**
 * AgencyOS · Live-tavle — Train-lock (T9, 27.08.2026).
 *
 * Erstatter «Mission Control» (personlig innboks-mockup, se
 * `live-data.ts`/`AgencyLiveV2.tsx` — urørt, men ikke lenger brukt her; ny
 * hjemplass avgjøres av Anders, se docs/natt/T9-DONE.md) med en ekte
 * Live-tavle: pågående treningsøkter (status IN_PROGRESS), Train-lock
 * AG-09b. Server component — klientlogikken bor i LiveTavleTrainLock.
 */

import Link from "next/link";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TL } from "@/lib/v2/train-lock";
import { Icon } from "@/components/v2/icon";
import { LiveTavleTrainLock } from "@/components/admin/v2/LiveTavleTrainLock";
import { hentLiveTavle } from "@/lib/agencyos/live-tavle-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live-tavle · AgencyOS" };

export default async function V2LivePage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const data = await hentLiveTavle(user.id, user.role === "ADMIN");

  return (
    <V2Shell bredde="full" aktiv="live" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"}>
      <Link
        href="/admin/agencyos"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: TL.font.sans, fontSize: 13, color: TL.mute, textDecoration: "none", marginBottom: 12 }}
      >
        <Icon name="arrow-left" size={15} />
        Cockpit
      </Link>
      <LiveTavleTrainLock data={data} />
    </V2Shell>
  );
}
