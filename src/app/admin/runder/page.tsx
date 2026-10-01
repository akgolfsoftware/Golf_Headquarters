/**
 * AG-RD-01 Rundeanalyse i Precision Athletics (`/admin/runder`).
 * Tegning: Claude Design 7d7c2994, ui_kits/agencyos/screens/AG-RD.jsx.
 *
 * Tilgang og spørring som før: requirePortalUser (ADMIN/COACH), nyeste 50
 * runder + totaltelling. I tillegg leses hullkortets par (så ni hull ikke
 * får banens par), antall registrerte slag (datagrunnlag) og om runden hører
 * til en turnering. Snittet regnes bare på tellende runder (18 hull eller
 * ukjent hullantall), brutto. Bare visningen er byttet fra V2Shell/AdminRunderV2.
 *
 * Server component.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { AgencyOSSkall } from "@/components/precision/AgencyOSSkall";
import { AGRD01Runder, type RundeRad, type RunderData } from "@/components/admin/precision/AGRD01Runder";
import { dato, hcp } from "@/lib/admin-spiller/spiller360-visning";

export const dynamic = "force-dynamic";
export const metadata = { title: "Rundeanalyse · AgencyOS" };

export default async function RunderPage() {
  const user = await requirePortalUser({ allow: ["ADMIN", "COACH"] });

  const [rounds, total] = await Promise.all([
    prisma.round.findMany({
      orderBy: { playedAt: "desc" },
      take: 50,
      select: {
        id: true, playedAt: true, score: true, sgTotal: true, tournamentEntryId: true, userId: true,
        user: { select: { id: true, name: true, hcp: true } },
        course: { select: { name: true, par: true } },
        holeScores: { select: { par: true } },
        _count: { select: { shots: true } },
      },
    }),
    prisma.round.count(),
  ]);

  const runder: RundeRad[] = rounds.map((r) => {
    const par = r.holeScores.length ? r.holeScores.reduce((s, h) => s + h.par, 0) : r.course.par;
    return {
      id: r.id,
      spiller: r.user.name ?? "Spiller",
      spillerId: r.user.id,
      hcp: r.user.hcp != null ? hcp(r.user.hcp) : null,
      bane: r.course.name,
      dato: dato(r.playedAt),
      brutto: r.score,
      tilPar: r.score - par,
      hull: r.holeScores.length || null,
      sg: r.sgTotal,
      type: r.tournamentEntryId ? "Turnering" : "Trening",
      grunnlag: r._count.shots > 0 ? "Slag for slag" : r.holeScores.length ? "Hullkort" : "Scorekort",
    };
  });

  const tellende = runder.filter((r) => r.hull == null || r.hull >= 18);
  const snitt = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : null);
  const beste = tellende.reduce<RundeRad | null>((b, r) => (b == null || r.tilPar < b.tilPar ? r : b), null);
  const medSg = runder.filter((r) => r.sg != null);

  const data: RunderData = {
    vist: runder.length,
    total,
    spillere: new Set(runder.map((r) => r.spillerId)).size,
    snittBrutto: snitt(tellende.map((r) => r.brutto)),
    snittTilPar: snitt(tellende.map((r) => r.tilPar)),
    tellende: tellende.length,
    beste: beste ? { brutto: beste.brutto, tilPar: beste.tilPar, spiller: beste.spiller, bane: beste.bane } : null,
    sgSnitt: snitt(medSg.map((r) => r.sg as number)),
    sgRunder: medSg.length,
    kilde: `RUNDER · BRUTTO · ${runder[0]?.dato ?? "—"}`,
    runder,
  };

  return (
    <AgencyOSSkall navn={user.name ?? "Coach"}>
      <AGRD01Runder tilstand={total === 0 ? "tom" : "data"} data={data} />
    </AgencyOSSkall>
  );
}
