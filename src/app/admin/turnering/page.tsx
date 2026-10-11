/**
 * Turnering — AG-17 i Precision Athletics (/admin/turnering).
 *
 * Én samlet adresse for turneringer:
 * Alle, Mine spillere, Skjematisk kart over Sør-Norge, Dubletter og Ny turnering.
 *
 * Erstatter Train-lock-skallet (V2Shell/TL) med Precision Athletics (AgencyOSSkall og AG17Turneringer).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import {
  AG17Turneringer,
  type AG17Data,
  type TurneringDublett,
} from "@/components/admin/precision/AG17Turneringer";
import { velgTurneringFane } from "@/lib/admin/turnering/faner";
import {
  lastAlleTurneringer,
  lastMineSpillereTurneringer,
} from "@/lib/admin/turnering/lastere";
import { byggTurneringRader } from "@/lib/admin/turnering/rader";
import { lastDubletter } from "@/lib/admin/ko/last-dubletter";

export const dynamic = "force-dynamic";
export const metadata = { title: "Turneringer · AgencyOS" };

export default async function TurneringPage({
  searchParams,
}: {
  searchParams: Promise<{ fane?: string; sok?: string; side?: string }>;
}) {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });
  const { fane: onsket, sok } = await searchParams;
  const aktiv = velgTurneringFane(onsket);

  const [alleRes, mineRes, dubletterRes] = await Promise.all([
    lastAlleTurneringer({ sok, side: 0 }).catch(() => ({
      rader: [],
      totalt: 0,
      side: 0,
      sideStorrelse: 50,
      sok: "",
    })),
    lastMineSpillereTurneringer().catch(() => ({
      sesong: 2026,
      rader: [],
      dublettAntall: 0,
      kpi: { paameldteSpillere: 0, stallStorrelse: 0, utenKobling: 0 },
    })),
    lastDubletter().catch(() => []),
  ]);

  const tournaments = byggTurneringRader(alleRes.rader || [], mineRes.rader || []);

  const tDups: TurneringDublett[] = (dubletterRes || []).map((d) => ({
    id: d.manual.id,
    match: `Overlapp: ${d.forslag[0]?.name ?? "Mulig dublett"}`,
    a: {
      src: d.manual.createdByEmail ? "Manuell" : "GolfBox",
      name: d.manual.name,
      date: d.manual.startDate
        ? new Date(d.manual.startDate).toLocaleDateString("nb-NO")
        : "—",
      course: d.manual.location ?? "—",
    },
    b: {
      src: d.forslag[0]?.sourceOrigin ?? "Kanonisk kilde",
      name: d.forslag[0]?.name ?? "—",
      date: d.forslag[0]?.startDate
        ? new Date(d.forslag[0]?.startDate).toLocaleDateString("nb-NO")
        : "—",
      course: d.forslag[0]?.location ?? "—",
    },
  }));

  const data: AG17Data = { tournaments, tDups };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG17Turneringer
        tilstand={tournaments.length === 0 && tDups.length === 0 ? "tom" : "data"}
        startFane={aktiv ?? "alle"}
        data={data}
      />
    </AgencyOSSkall>
  );
}
