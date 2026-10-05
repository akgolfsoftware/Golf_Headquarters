/**
 * PlayerHQ Runde ferdig (PH-RD-08) — Precision Athletics. Auth-guard og Prisma-loader
 * beholdt (holeScores er sannheten for hull-for-hull); visningen er PHRD08RundeFerdig.
 */

import { notFound } from "next/navigation";
import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { harCoachTilgangTilSpiller } from "@/lib/auth/coached";
import { SG_ALLE_FELT, type ManuellSgVerdier } from "@/lib/portal-runder/manuell-sg";
import {
  RUNDE_SG_KILDE,
  avledRundeRegistrering,
  lesRundeDataQuality,
  lesRundeKilde,
  lesRundeStatus,
} from "@/lib/runde-logg/kontrakt";
import { PHRD08RundeFerdig, type PHRD08Data } from "@/components/portal/precision/PHRD08RundeFerdig";

export const dynamic = "force-dynamic";

const DATO_KORT = new Intl.DateTimeFormat("nb-NO", { timeZone: "Europe/Oslo", day: "2-digit", month: "2-digit", year: "numeric" });

export default async function RundeDetaljPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lagret?: string }>;
}) {
  const user = await requirePortalUser({ kreverTilgang: "TALENT" });
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
  if (runde.userId !== user.id &&
    (!(user.role === "ADMIN" || user.role === "COACH") || !(await harCoachTilgangTilSpiller(user, runde.userId)))) notFound();

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
    runde.sgSource !== RUNDE_SG_KILDE.BEREGNET &&
    runde.sgSource !== RUNDE_SG_KILDE.MANUAL;
  const avledetRegistrering = avledRundeRegistrering({
    sgSource: runde.sgSource,
    holeScores: runde.holeScores,
    shots: runde.shots,
    kilde: lesRundeKilde(runde.source),
  });
  const registrering = {
    ...avledetRegistrering,
    status: lesRundeStatus(runde.status) ?? avledetRegistrering.status,
    dataQuality: lesRundeDataQuality(runde.dataQuality) ?? avledetRegistrering.dataQuality,
    kilde: lesRundeKilde(runde.source) ?? avledetRegistrering.kilde,
  };

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

  const manuellSg = Object.fromEntries(SG_ALLE_FELT.map(({ key }) => [key, runde[key]])) as ManuellSgVerdier;
  const uleste = await prisma.notification.count({ where: { userId: user.id, readAt: null } });
  // Straff finnes bare når slag er ført; uten slag er det ingen kilde (vises som «—»).
  const straff = runde.shots.length > 0 ? runde.shots.filter((s) => s.isPenalty).length : null;

  const data: PHRD08Data = {
    id: runde.id,
    nettoppLagret,
    baneNavn: runde.course.name,
    datoKort: DATO_KORT.format(runde.playedAt),
    score: runde.score,
    par,
    sgTotal: runde.sgTotal,
    sgKategorier,
    sgSource: runde.sgSource,
    registrering,
    manuellSg,
    granulaerSg: manuellSg,
    hull,
    erEier,
    visKjedeStatus,
    antallKomplette,
    antallHullMedScore: runde.holeScores.length,
    putter: hullStat?.putter ?? null,
    fairway: hullStat?.fairway ?? null,
    gir: hullStat?.gir ?? null,
    straff,
    ut: hullStat ? { score: hullStat.ut.score, par: hullStat.ut.par } : null,
    inn: hullStat && hullStat.inn.antall > 0 ? { score: hullStat.inn.score, par: hullStat.inn.par } : null,
  };

  return <PHRD08RundeFerdig data={data} uleste={uleste} />;
}
