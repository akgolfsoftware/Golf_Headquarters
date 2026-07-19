/**
 * PlayerHQ · Hull-analyse — v2 (rekomponert 2026-07-17, samme URL). V2Shell
 * leverer chrome-en, AnalysereHullV2 rendrer innholds-stacken (to faner:
 * Sone-kart + Hull for hull).
 *
 * Dataloader er uendret fra den gamle skjermen:
 *   - SG: BrukerSgInput (siste 8) → siste verdi + trend per sone.
 *   - Trening: TrainingPlanSession per skillArea (siste 30 d) → økter/minutter.
 *   - Siste runde (nyeste med hull-score) → hull-for-hull (ekte HoleScore-data,
 *     ingen fabrikkering).
 */

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { TilbakeLenke } from "@/components/v2";
import {
  AnalysereHullV2,
  type AnalysereHullV2Data,
  type HullSone,
} from "@/components/portal/v2/AnalysereHullV2";
import { aggregerHullVarme } from "@/lib/domain/hole-heatmap";

export const dynamic = "force-dynamic";

type Area = "TEE_TOTAL" | "TILNAERMING" | "AROUND_GREEN" | "PUTTING";

export default async function HullAnalysePage() {
  const user = await requirePortalUser();

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const [sgInputs, sessions, sisteRunde, alleHullScores] = await Promise.all([
    prisma.brukerSgInput.findMany({
      where: { userId: user.id },
      orderBy: { dato: "desc" },
      take: 8,
      select: { sgOtt: true, sgApp: true, sgArg: true, sgPutt: true },
    }),
    prisma.trainingPlanSession.findMany({
      where: { plan: { userId: user.id }, scheduledAt: { gte: tretti } },
      select: { skillArea: true, durationMin: true },
    }),
    // Siste runde (nyeste) for innlogget spiller, med hull-score.
    prisma.round.findFirst({
      where: { userId: user.id, holeScores: { some: {} } },
      orderBy: { playedAt: "desc" },
      select: {
        score: true,
        course: { select: { name: true } },
        holeScores: {
          orderBy: { holeNumber: "asc" },
          select: { holeNumber: true, par: true, strokes: true },
        },
      },
    }),
    // Varmekart: hull-score på tvers av ALLE spillerens runder (ikke bare
    // siste), for å aggregere snitt avvik fra par per hull server-side.
    prisma.holeScore.findMany({
      where: { round: { userId: user.id } },
      select: { holeNumber: true, par: true, strokes: true, roundId: true },
    }),
  ]);

  // Trening per skillArea (siste 30 d) → økter + minutter.
  const trening: Record<Area, { okter: number; minutter: number }> = {
    TEE_TOTAL: { okter: 0, minutter: 0 },
    TILNAERMING: { okter: 0, minutter: 0 },
    AROUND_GREEN: { okter: 0, minutter: 0 },
    PUTTING: { okter: 0, minutter: 0 },
  };
  for (const s of sessions) {
    if (s.skillArea && s.skillArea in trening) {
      const t = trening[s.skillArea as Area];
      t.okter += 1;
      t.minutter += s.durationMin;
    }
  }

  const latest = sgInputs[0] ?? null;
  // sgInputs er nyeste først → reverser for trend (eldste → nyeste).
  const trendOf = (pick: (i: (typeof sgInputs)[number]) => number | null) =>
    [...sgInputs].reverse().map(pick).filter((v): v is number => v != null);

  const soner: HullSone[] = [
    {
      id: "tee",
      kode: "OTT",
      label: "Tee total",
      sub: "Off the tee",
      sg: latest?.sgOtt ?? null,
      ...trening.TEE_TOTAL,
      trend: trendOf((i) => i.sgOtt),
    },
    {
      id: "app",
      kode: "APP",
      label: "Innspill",
      sub: "Tilnærming",
      sg: latest?.sgApp ?? null,
      ...trening.TILNAERMING,
      trend: trendOf((i) => i.sgApp),
    },
    {
      id: "arg",
      kode: "ARG",
      label: "Nærspill",
      sub: "Chip, pitch, bunker",
      sg: latest?.sgArg ?? null,
      ...trening.AROUND_GREEN,
      trend: trendOf((i) => i.sgArg),
    },
    {
      id: "putt",
      kode: "PUTT",
      label: "Putt",
      sub: "Putting",
      sg: latest?.sgPutt ?? null,
      ...trening.PUTTING,
      trend: trendOf((i) => i.sgPutt),
    },
  ];

  // Siste runde → hull-for-hull (ekte HoleScore-data, ingen fabrikkering).
  const data: AnalysereHullV2Data = {
    soner,
    sgRegistreringer: sgInputs.length,
    runde: sisteRunde
      ? {
          courseName: sisteRunde.course.name,
          totalScore: sisteRunde.score,
          parDiff: sisteRunde.holeScores.reduce(
            (sum, h) => sum + (h.strokes - h.par),
            0,
          ),
          holeCount: sisteRunde.holeScores.length,
          holes: sisteRunde.holeScores.map((h) => ({
            holeNumber: h.holeNumber,
            par: h.par,
            strokes: h.strokes,
          })),
        }
      : null,
    // Varmekart over banen: snitt avvik fra par per hull, aggregert over
    // ALLE registrerte runder (domenelogikk i src/lib/domain/hole-heatmap.ts).
    hullVarme: aggregerHullVarme(alleHullScores),
  };

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <TilbakeLenke href="/portal/analysere">Analyse</TilbakeLenke>
      <AnalysereHullV2 data={data} />
    </V2Shell>
  );
}
