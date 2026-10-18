/**
 * PlayerHQ · Hull (/portal/analysere/hull) i nytt design (pakke 13, Stats resten).
 * Fasit: docs/design-system/utkast-playerhq/stats-resten.html, malen «hull».
 * Avvik:
 *   - står øverst i PH16dHull.tsx.
 *
 * Data:
 *   - SG per sone som i Stats (loadPH16Stats, siste 10 runder mot PGA Tour) og antall runder fra hentSgRunder.
 *   - Trening per sone: gjennomførte Workbench-økter med treningsområde, siste 30 dager.
 *   - Varmekart: hullscore på banen med flest runder (minst 3). Siste runde: nyeste runde med hullscore.
 */
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { PlayerHQSkall } from "@/components/precision/PlayerHQSkall";
import { PH16dHull } from "@/components/portal/precision/PH16dHull";
import { getUnreadNotifications } from "@/app/portal/actions";
import { hentSpillerAkKategori } from "@/lib/domain/spiller-kategori";
import { hentEffektivNaa } from "@/lib/testing/dato-override";
import { loadPH16Stats } from "@/lib/portal-analyse/load-ph16-stats";
import { hentHullRader, hentSgRunder, hentTreningPerSone } from "@/lib/portal-analyse/load-omrade";
import { byggHullSoner, byggHullVarme, type HullData } from "@/lib/portal-analyse/omrade-data";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hull · Stats · PlayerHQ" };

export default async function HullAnalysePage() {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
  const naa = await hentEffektivNaa(user.email);
  const fra = new Date(naa.getTime() - 30 * 86_400_000);
  const kort = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "numeric", month: "short" });

  const [stats, runder, trening, hullRader, sisteRunde, kategori, uleste] = await Promise.all([
    loadPH16Stats(user.id, user.name),
    hentSgRunder(user.id),
    hentTreningPerSone(user.id, fra, naa),
    hentHullRader(user.id),
    prisma.round.findFirst({
      where: { userId: user.id, holeScores: { some: {} } },
      orderBy: { playedAt: "desc" },
      select: {
        score: true,
        playedAt: true,
        course: { select: { name: true } },
        holeScores: { orderBy: { holeNumber: "asc" }, select: { holeNumber: true, par: true, strokes: true } },
      },
    }),
    hentSpillerAkKategori(user.id, { hcp: user.hcp }),
    getUnreadNotifications(user.id, 1),
  ]);

  const data: HullData = {
    kategori,
    ...byggHullSoner(stats, runder),
    trening,
    treningPeriode: `${kort.format(fra)}–${kort.format(naa)}`,
    varme: byggHullVarme(hullRader),
    runderMedHull: new Set(hullRader.map((r) => r.roundId)).size,
    siste: sisteRunde
      ? {
          bane: sisteRunde.course.name,
          dato: kort.format(sisteRunde.playedAt),
          brutto: sisteRunde.score,
          motPar: sisteRunde.holeScores.reduce((sum, h) => sum + (h.strokes - h.par), 0),
          hull: sisteRunde.holeScores.map((h) => ({ nr: h.holeNumber, par: h.par, slag: h.strokes })),
        }
      : null,
  };

  return (
    <PlayerHQSkall innboksHref="/portal/varsler" uleste={uleste.count}>
      <PH16dHull data={data} />
    </PlayerHQSkall>
  );
}
