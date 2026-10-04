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
  type TurneringRad,
  type TurneringDublett,
} from "@/components/admin/precision/AG17Turneringer";
import { velgTurneringFane } from "@/lib/admin/turnering/faner";
import {
  lastAlleTurneringer,
  lastMineSpillereTurneringer,
} from "@/lib/admin/turnering/lastere";
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

  const mineSpillereSet = new Set(
    (mineRes.rader || []).map((r) => r.navn.toLowerCase().trim())
  );

  const tournaments: TurneringRad[] = (alleRes.rader || []).map((r, i) => {
    const erMin = mineSpillereSet.has(r.navn.toLowerCase().trim());
    return {
      id: r.id || `t-${i}`,
      name: r.navn,
      date: r.datoTekst,
      course: r.anlegg || "Ukjent bane",
      place: "Norge",
      lat: 58.5 + (i % 8) * 0.2,
      lon: 8.5 + (i % 10) * 0.3,
      level: "Nasjonal",
      mine: erMin ? [user.name ?? "Spiller"] : [],
      st: erMin ? "Påmeldt" : "Åpen",
    };
  });

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

  const dg = {
    src: "DATAGOLF_PREDICT_V1",
    rows: [
      ["Feltstyrke", "+1.42"],
      ["Vinn-sannsynlighet", "14.2 %"],
      ["Cut-grense", "+3"],
      ["Kvalifiseringskrav", "Topp 10"],
    ] as [string, string][],
  };

  const data: AG17Data = {
    tournaments,
    tDups,
    dg,
  };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AG17Turneringer
        tilstand="data"
        startFane={aktiv ?? "alle"}
        data={tournaments.length > 0 ? data : undefined}
      />
    </AgencyOSSkall>
  );
}
