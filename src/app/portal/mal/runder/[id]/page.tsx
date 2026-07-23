/**
 * PlayerHQ Runde-detalj — v2. Auth-guard + Prisma-loader utvidet fra
 * legacy-skjermen (holeScores er nå sannheten for hull-for-hull, fra
 * SG slag-for-slag-pakken 10. juli — se main). V2Shell eier chrome-en.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { V2Shell, PLAYERHQ_NAV } from "@/components/v2/shell";
import { RundeDetaljV2, type RundeDetaljData } from "@/components/portal/v2/RundeDetaljV2";

export const dynamic = "force-dynamic";

export default async function RundeDetaljPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lagret?: string }>;
}) {
  const user = await requirePortalUser();
  const { id } = await params;
  const sp = await searchParams;
  const nettoppLagret = sp.lagret === "1";

  const runde = await prisma.round.findUnique({
    where: { id },
    include: {
      course: true,
      shots: { orderBy: [{ holeNumber: "asc" }, { shotNumber: "asc" }] },
      holeScores: { orderBy: { holeNumber: "asc" } },
    },
  });

  if (!runde) notFound();
  if (runde.userId !== user.id && user.role !== "ADMIN" && user.role !== "COACH") notFound();

  const erEier = runde.userId === user.id;

  // Hull-for-hull: HoleScore er sannheten (skrives av slag-føring OG import);
  // fall tilbake til slag-avledet score for eldre runder uten HoleScore-rader.
  const hullMap = new Map<number, { par: number; score: number }>();
  for (const h of runde.holeScores) {
    hullMap.set(h.holeNumber, { par: h.par, score: h.strokes });
  }
  if (hullMap.size === 0) {
    for (const s of runde.shots) {
      const e = hullMap.get(s.holeNumber);
      if (e) e.score += 1;
      else hullMap.set(s.holeNumber, { par: s.holePar, score: 1 });
    }
  }
  const hull = [...hullMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([nr, h]) => ({ nr, par: h.par, score: h.score, sg: null }));

  // Delvis runde (færre hull på scorekortet): mål mot par for de SPILTE
  // hullene — «8 slag mot par 72» ville vært løgn for en 2-hulls runde.
  const antallSpilteHull = runde.holeScores.length > 0 ? runde.holeScores.length : 18;
  const par =
    runde.holeScores.length > 0
      ? runde.holeScores.reduce((sum, h) => sum + h.par, 0)
      : runde.course.par;

  // Kjede-status for SG: per scoret hull — er slag-kjeden komplett?
  // (samme regel som shots-til-sg: slag + straffer == strokes, alle avstander satt)
  const kjedeStatus = runde.holeScores.map((h) => {
    const slag = runde.shots.filter((s) => s.holeNumber === h.holeNumber);
    const straffer = slag.filter((s) => s.isPenalty).length;
    const komplett =
      slag.length > 0 &&
      slag.length + straffer === h.strokes &&
      slag.every((s) => s.distanceToPin != null && s.distanceToPin > 0);
    return { holeNumber: h.holeNumber, komplett };
  });
  const antallKomplette = kjedeStatus.filter((k) => k.komplett).length;
  const visKjedeStatus =
    erEier &&
    runde.holeScores.length > 0 &&
    runde.sgSource !== "beregnet" &&
    runde.sgSource !== "manual";

  // Scorekort-statistikk (D6a): UT/INN/TOTALT + putter/fairway/GIR-aggregater
  // — kun fra ekte HoleScore-rader (aldri fra shot-fallback), og kun for
  // felter som faktisk er logget (null = ikke logget, vises ikke).
  const hs = runde.holeScores;
  const delsum = (xs: typeof hs) => ({
    score: xs.reduce((sum, h) => sum + h.strokes, 0),
    par: xs.reduce((sum, h) => sum + h.par, 0),
    antall: xs.length,
  });
  const medPutter = hs.filter((h) => h.putts != null);
  const medFairway = hs.filter((h) => h.fairway != null);
  const medGir = hs.filter((h) => h.gir != null);
  const hullStat =
    hs.length > 0
      ? {
          ut: delsum(hs.filter((h) => h.holeNumber <= 9)),
          inn: delsum(hs.filter((h) => h.holeNumber > 9)),
          putter:
            medPutter.length > 0
              ? {
                  totalt: medPutter.reduce((sum, h) => sum + (h.putts ?? 0), 0),
                  hull: medPutter.length,
                }
              : null,
          fairway:
            medFairway.length > 0
              ? {
                  treff: medFairway.filter((h) => h.fairway).length,
                  av: medFairway.length,
                }
              : null,
          gir:
            medGir.length > 0
              ? { treff: medGir.filter((h) => h.gir).length, av: medGir.length }
              : null,
        }
      : null;

  const sgKategorier = (
    [
      { akse: "OTT", sg: runde.sgOtt },
      { akse: "APP", sg: runde.sgApp },
      { akse: "ARG", sg: runde.sgArg },
      { akse: "PUTT", sg: runde.sgPutt },
    ] as const
  ).flatMap((k) => (k.sg == null ? [] : [{ akse: k.akse, sg: k.sg }]));

  const data: RundeDetaljData = {
    id: runde.id,
    nettoppLagret,
    baneNavn: runde.course.name,
    datoTekst: runde.playedAt.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    score: runde.score,
    par,
    antallSpilteHull,
    sgTotal: runde.sgTotal,
    sgKategorier,
    sgSource: runde.sgSource as "beregnet" | "manual" | null,
    hull,
    erEier,
    visKjedeStatus,
    antallKomplette,
    antallHullMedScore: runde.holeScores.length,
    hullStat,
    granulaerSg: {
      tee: runde.sgTee,
      app200: runde.sgApp200,
      app150: runde.sgApp150,
      app100: runde.sgApp100,
      app50: runde.sgApp50,
      chip: runde.sgChip,
      pitch: runde.sgPitch,
      bunker: runde.sgBunker,
      putt0_3: runde.sgPutt0_3,
      putt3_5: runde.sgPutt3_5,
      putt5_10: runde.sgPutt5_10,
      putt10_15: runde.sgPutt10_15,
      putt15_25: runde.sgPutt15_25,
      putt25_40: runde.sgPutt25_40,
      putt40plus: runde.sgPutt40plus,
    },
  };

  return (
    <V2Shell aktiv="analyse" nav={PLAYERHQ_NAV} navn={user.name} avatarUrl={user.avatarUrl}>
      <RundeDetaljV2 data={data} />
    </V2Shell>
  );
}
