/**
 * AgencyOS · Live-økt (coach) — T9 Train-lock, 27.08.2026.
 * «UNDER-flata mens økta pågår» — søsterflate til FangstSheet, men for
 * coachen. Skilt fra /admin/agencyos/live (AG-09 Tavle), som er en annen
 * flate (board over alle økter i gang, ikke per-økt).
 *
 * Erstatter tre pensjonerte legacy-ruter — (legacy)/live/[sessionId]/
 * active, brief og summary redirect'er alle hit nå (§5T, D-LYS-OG-5T-
 * BESLUTNING.md rad 11–12). Se docs/natt/T9-DONE.md for hvilke funksjoner
 * fra de tre (fokuspunkt-notat, post-økt-vurdering til spillerprofil,
 * coach-melding-i-sanntid) IKKE er videreført ennå.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { V2Shell, AGENCYOS_NAV } from "@/components/v2/shell";
import { TlTilbake } from "@/components/admin/v2/oppsett/tl-kit";
import { LiveOktCoachV2 } from "@/components/admin/v2/LiveOktCoachV2";
import { lastLiveOktData } from "@/lib/agencyos/live-okt-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Live-økt · AgencyOS" };

export default async function LiveOktPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { sessionId } = await params;
  const data = await lastLiveOktData(sessionId);
  if (!data) notFound();

  return (
    <V2Shell bredde="full" nav={AGENCYOS_NAV} navn={user.name ?? "Coach"} avatarUrl={user.avatarUrl}>
      <div style={{ marginBottom: 16 }}>
        <TlTilbake href="/admin/agencyos/live">Tavle</TlTilbake>
      </div>
      <LiveOktCoachV2 data={data} />
    </V2Shell>
  );
}
