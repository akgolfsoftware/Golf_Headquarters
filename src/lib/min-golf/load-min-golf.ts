// «Min golf»-loaderen — komponerer EKSISTERENDE datakilder til golfdata-
// komponentenes props (masterplan bølge 1). Kun visning og aggregering av
// felter som allerede finnes (Round.sg*, Shot, TrackManSession, SgInsight) —
// ALDRI ny golfberegning. Brukes av både PlayerHQ /portal/analysere (spillerens
// eget nivå) og AgencyOS spilleranalyse (coach → alltid «elite»).

import { prisma } from "@/lib/prisma";
import { aggregateSg } from "@/lib/sg";
import {
  AK_BANDS,
  kategoriFraSnittscore,
  nesteKategori,
  prosentTilNesteNiva,
  type AkBand,
} from "@/lib/domain/ak-kategori";
import { SG_TO_PYRAMID } from "@/lib/training/skills/types";
import { buildYardageRows } from "@/lib/sg-hub/yardage-calc";
import { avgScoreFromHcp } from "@/lib/stats/sg-estimator";
import { nivaaFraKategori, type Nivaa } from "./dybde";
import {
  fmtKortDato,
  fmtSg,
  meterTilFot,
  PUTT_BASELINE_NAVN,
  SG_BASELINE_NAVN,
  SG_KLARSPRAK,
} from "./format";

type SgAkse = "OTT" | "APP" | "ARG" | "PUTT";

export type MinGolfData = {
  nivaa: Nivaa;
  kategori: AkBand | null;
  sgStatus: {
    verdi: string | null;
    trend: string | null;
    runder: number;
    baseline: string;
    begrunnelse: string | null;
    kategorier: { akse: SgAkse; sg: number }[];
    trendPunkter: { label: string; sg: number }[];
  };
  nesteFokus: {
    akse: SgAkse;
    omrade: string;
    sgTap: string;
    baseline: string;
    begrunnelse: string | null;
    formelAkse: string;
    handlingHref: string;
    lekkasjeBaand: { id: string; label: string; sg: number; slag?: number }[];
    grunnlag: string;
    diagnose: {
      symptom: string;
      grunnlag: string;
      resept: { akse: "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN"; tekst: string };
    } | null;
  } | null;
  runder: {
    hull: { nr: number; par: number; score: number }[];
    sammendrag: { score: number; par: number; sg: number } | null;
    tigerFive: {
      navn: string;
      verdi: string | number;
      status: "god" | "varsel" | "risiko" | "noytral";
      invertert?: boolean;
    }[];
  };
  baggen: {
    koller: { navn: string; carry: number; spredning?: number }[];
    varsler: string[];
    // LaunchWindow/StrikeSmash: TrackMan-importen lagrer i dag ikke launch/
    // spinn/treffpunkt (se ShotData i sg-hub/extract-shots) — ærlig tomt til
    // datakilden finnes. Data-grense, ikke design-avvik.
    launchTomt: true;
    strikeTomt: true;
  };
  putting: {
    band: { band: string; pct: number; baseline?: number }[];
    baseline: string;
  };
  progresjon: {
    nivaa: string;
    nesteNivaa: string | null;
    krav: { navn: string; bestatt: boolean; verdi?: string; mal?: string }[];
    nesteKrav: string | null;
  } | null;
};

// Putting-bånd i FOT (kanon 3. jul 2026) — grensene speiler Round.sgPutt-bucketene.
const PUTT_BAND: { label: string; minFt: number; maxFt: number }[] = [
  { label: "0–3 ft", minFt: 0, maxFt: 3 },
  { label: "3–5 ft", minFt: 3, maxFt: 5 },
  { label: "5–10 ft", minFt: 5, maxFt: 10 },
  { label: "10–15 ft", minFt: 10, maxFt: 15 },
  { label: "15–25 ft", minFt: 15, maxFt: 25 },
  { label: "25+ ft", minFt: 25, maxFt: Infinity },
];

// Lekkasje-bånd: snitt av Round sine granulære SG-felter. Putting i fot.
const LEKKASJE_FELT = [
  { id: "tee", label: "Tee-slag", felt: "sgTee" },
  { id: "app200", label: "Innspill 200–150 m", felt: "sgApp200" },
  { id: "app150", label: "Innspill 150–100 m", felt: "sgApp150" },
  { id: "app100", label: "Innspill 100–50 m", felt: "sgApp100" },
  { id: "app50", label: "Innspill < 50 m", felt: "sgApp50" },
  { id: "chip", label: "Nærspill chip", felt: "sgChip" },
  { id: "pitch", label: "Nærspill pitch", felt: "sgPitch" },
  { id: "bunker", label: "Bunker", felt: "sgBunker" },
  { id: "putt0", label: "Putting 0–3 ft", felt: "sgPutt0_3" },
  { id: "putt3", label: "Putting 3–5 ft", felt: "sgPutt3_5" },
  { id: "putt5", label: "Putting 5–10 ft", felt: "sgPutt5_10" },
  { id: "putt10", label: "Putting 10+ ft", felt: "sgPutt10_15" },
] as const;

const snittAv = (verdier: (number | null)[]): number | null => {
  const tall = verdier.filter((v): v is number => v !== null);
  if (tall.length === 0) return null;
  return tall.reduce((a, b) => a + b, 0) / tall.length;
};

export async function loadMinGolf(
  userId: string,
  overstyrNivaa?: Nivaa,
): Promise<MinGolfData> {
  const [runder, innsikter, trackmanOkter, puttSlag, bruker] = await Promise.all([
    prisma.round.findMany({
      where: { userId },
      orderBy: { playedAt: "desc" },
      take: 20,
      include: {
        course: { select: { par: true } },
        holeScores: { orderBy: { holeNumber: "asc" } },
      },
    }),
    prisma.sgInsight.findMany({
      where: { userId, resolvedAt: null },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      take: 10,
    }),
    prisma.trackManSession.findMany({
      where: {
        userId,
        recordedAt: { gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      },
      select: { rawJson: true },
    }),
    prisma.shot.findMany({
      where: {
        round: { userId },
        shotType: "PUTT",
        distanceToPin: { not: null },
      },
      orderBy: [{ roundId: "asc" }, { holeNumber: "asc" }, { shotNumber: "asc" }],
      select: {
        roundId: true,
        holeNumber: true,
        shotNumber: true,
        distanceToPin: true,
      },
      take: 2000,
    }),
    prisma.user.findUnique({ where: { id: userId }, select: { hcp: true } }),
  ]);

  // SG-status skal vise SAMME vindu som Hjem (getKpiStats: siste 10 runder) — «runder»
  // hentes med take:20 for Tiger Five/hull-historikk, men SG-snittet aggregeres kun
  // over de 10 nyeste så tallet og «X runder»-etiketten stemmer overens på tvers av skjermer.
  const SG_VINDU = 10;
  const agg = aggregateSg(runder.slice(0, SG_VINDU));

  // ---- Nivå (A–K fra snittscore inneværende sesong; fallback: alle runder) ----
  const iAar = runder.filter(
    (r) => r.playedAt.getFullYear() === new Date().getFullYear(),
  );
  const scoreGrunnlag = iAar.length > 0 ? iAar : runder;
  const snittScore =
    scoreGrunnlag.length > 0
      ? scoreGrunnlag.reduce((a, r) => a + r.score, 0) / scoreGrunnlag.length
      : null;
  // Ny spiller uten runder: plasser fra HCP (samlet ved onboarding) så progressiv
  // dybde virker fra dag én. Ekte snittscore vinner så snart runder finnes.
  const fraHcp = snittScore === null && bruker?.hcp != null;
  const effektivSnitt = snittScore ?? (bruker?.hcp != null ? avgScoreFromHcp(bruker.hcp) : null);
  const kategori = effektivSnitt !== null ? kategoriFraSnittscore(effektivSnitt) : null;
  const nivaa: Nivaa =
    overstyrNivaa ?? (kategori ? nivaaFraKategori(kategori.kategori) : "nybegynner");

  // ---- SG-status ----
  const kategorier = (
    [
      ["OTT", agg.ott],
      ["APP", agg.app],
      ["ARG", agg.arg],
      ["PUTT", agg.putt],
    ] as const
  )
    .filter((k): k is [SgAkse, number] => k[1] !== null)
    .map(([akse, sg]) => ({ akse, sg }));

  // Trend = differansen mellom snitt av siste 5 og de 5 før (ren aggregering).
  const medTotal = runder.filter((r) => r.sgTotal !== null);
  const siste5 = snittAv(medTotal.slice(0, 5).map((r) => r.sgTotal));
  const forrige5 = snittAv(medTotal.slice(5, 10).map((r) => r.sgTotal));
  const trend =
    siste5 !== null && forrige5 !== null ? fmtSg(siste5 - forrige5) : null;

  const trendPunkter = medTotal
    .slice(0, 12)
    .reverse()
    .map((r) => ({ label: fmtKortDato(r.playedAt), sg: r.sgTotal as number }));

  const ferskesteInnsikt = innsikter[0] ?? null;

  // ---- Neste fokus: svakeste SG-kategori (utvelgelse, ikke beregning) ----
  let nesteFokus: MinGolfData["nesteFokus"] = null;
  if (kategorier.length > 0) {
    const svakest = kategorier.reduce((a, b) => (b.sg < a.sg ? b : a));

    const lekkasjeBaand: { id: string; label: string; sg: number }[] = [];
    for (const b of LEKKASJE_FELT) {
      const sg = snittAv(runder.map((r) => r[b.felt]));
      if (sg !== null) lekkasjeBaand.push({ id: b.id, label: b.label, sg });
    }

    const verste = lekkasjeBaand.length
      ? lekkasjeBaand.reduce((a, b) => (b.sg < a.sg ? b : a))
      : null;

    nesteFokus = {
      akse: svakest.akse,
      omrade: `${SG_KLARSPRAK[svakest.akse]} er største lekkasje`,
      sgTap: fmtSg(svakest.sg),
      baseline: svakest.akse === "PUTT" ? PUTT_BASELINE_NAVN : SG_BASELINE_NAVN,
      begrunnelse: ferskesteInnsikt?.body ?? null,
      formelAkse: `${SG_TO_PYRAMID[svakest.akse]}_${svakest.akse}`,
      handlingHref: "/portal/planlegge/workbench?zoom=uke",
      lekkasjeBaand,
      grunnlag: `${agg.rundeAntall} runder`,
      diagnose: verste
        ? {
            symptom: `Mister ${fmtSg(Math.abs(verste.sg)).replace("+", "")} slag på ${verste.label.toLowerCase()} per runde`,
            grunnlag: `${agg.rundeAntall} runder`,
            resept: {
              akse: SG_TO_PYRAMID[svakest.akse],
              tekst:
                ferskesteInnsikt?.title ??
                `Kravtrening på ${verste.label.toLowerCase()} — legg inn i ukeplanen.`,
            },
          }
        : null,
    };
  }

  // ---- Runder: siste runde med hull-data + Tiger Five over alle runder ----
  const sisteMedHull = runder.find((r) => r.holeScores.length > 0) ?? null;
  const hull =
    sisteMedHull?.holeScores.map((h) => ({
      nr: h.holeNumber,
      par: h.par,
      score: h.strokes,
    })) ?? [];
  const sammendrag = sisteMedHull
    ? {
        score: sisteMedHull.score,
        par:
          sisteMedHull.course.par ??
          sisteMedHull.holeScores.reduce((a, h) => a + h.par, 0),
        sg: sisteMedHull.sgTotal ?? 0,
      }
    : null;

  // Tiger Five — telling over holeScores (ren telling, ikke golfmatte).
  const alleHull = runder.flatMap((r) => r.holeScores);
  const rundetall = runder.filter((r) => r.holeScores.length > 0).length;
  const tigerFive: MinGolfData["runder"]["tigerFive"] = [];
  if (alleHull.length > 0 && rundetall > 0) {
    const dobbel = alleHull.filter((h) => h.strokes - h.par >= 2).length;
    const trePutt = alleHull.filter((h) => (h.putts ?? 0) >= 3).length;
    const par5Bogey = alleHull.filter(
      (h) => h.par === 5 && h.strokes > h.par,
    ).length;
    const perRunde = (n: number) => Math.round((n / rundetall) * 10) / 10;
    const status = (verdi: number, ok: number, varsel: number) =>
      verdi <= ok ? "god" : verdi <= varsel ? "varsel" : ("risiko" as const);
    tigerFive.push(
      {
        navn: "Dobbeltbogey+",
        verdi: perRunde(dobbel),
        status: status(perRunde(dobbel), 0.5, 1.5),
        invertert: true,
      },
      {
        navn: "Tre-putt",
        verdi: perRunde(trePutt),
        status: status(perRunde(trePutt), 0.5, 1.5),
        invertert: true,
      },
      {
        navn: "Bogey på par 5",
        verdi: perRunde(par5Bogey),
        status: status(perRunde(par5Bogey), 0.3, 1),
        invertert: true,
      },
    );
  }

  // ---- Baggen: gapping fra eksisterende yardage-motor ----
  const yardage = trackmanOkter.length ? buildYardageRows(trackmanOkter) : [];
  const koller = yardage
    .filter((r) => r.shotCount >= 3)
    .sort((a, b) => b.carryAvg - a.carryAvg)
    .map((r) => ({
      navn: r.club,
      carry: Math.round(r.carryAvg),
      spredning: Math.round(r.totalSigma),
    }));
  const gapVarsler = innsikter
    .filter((i) => i.category === "DISTANCE_GAPPING")
    .map((i) => i.title);

  // ---- Putting: innslag-% per fot-bånd fra slag-for-slag-data ----
  // Et putt er «i hull» når det er hullets siste registrerte slag.
  const sisteSlagPerHull = new Map<string, number>();
  for (const s of puttSlag) {
    const key = `${s.roundId}:${s.holeNumber}`;
    const maks = sisteSlagPerHull.get(key);
    if (maks === undefined || s.shotNumber > maks)
      sisteSlagPerHull.set(key, s.shotNumber);
  }
  const band = PUTT_BAND.map(({ label, minFt, maxFt }) => {
    const iBand = puttSlag.filter((s) => {
      const ft = meterTilFot(s.distanceToPin as number);
      return ft >= minFt && ft < maxFt;
    });
    if (iBand.length === 0) return null;
    const made = iBand.filter(
      (s) => sisteSlagPerHull.get(`${s.roundId}:${s.holeNumber}`) === s.shotNumber,
    ).length;
    return { band: label, pct: Math.round((made / iBand.length) * 100) };
  }).filter((b): b is { band: string; pct: number } => b !== null);

  // ---- Progresjon: A–K-krav fra kanonisk tabell ----
  let progresjon: MinGolfData["progresjon"] = null;
  if (kategori && effektivSnitt !== null) {
    const neste = nesteKategori(kategori.kategori);
    const prosent = prosentTilNesteNiva(effektivSnitt);
    const verdiTekst = effektivSnitt.toFixed(1).replace(".", ",");
    // Ærlig kilde-merking: HCP-estimat før første runde, ekte snitt etterpå.
    const kildeSuffix = fraHcp ? " (estimert fra HCP)" : "";
    progresjon = {
      nivaa: kategori.kategori,
      nesteNivaa: neste?.kategori ?? null,
      krav: [
        {
          navn: `Snittscore i ${kategori.kategori}-spennet (${kategori.snittLabel})${kildeSuffix}`,
          bestatt: true,
          verdi: verdiTekst,
          mal: kategori.snittLabel,
        },
        ...(neste
          ? [
              {
                navn: `Snittscore for ${neste.kategori} (${neste.snittLabel})`,
                bestatt: false,
                verdi: verdiTekst,
                mal: neste.snittLabel,
              },
            ]
          : []),
      ],
      nesteKrav: fraHcp
        ? `Plassert fra HCP ${bruker!.hcp!.toFixed(1).replace(".", ",")}. Spill din første runde for en ekte plassering.`
        : neste
          ? `Snittscore ${neste.snittLabel} løfter deg til kategori ${neste.kategori}${prosent !== null ? ` — du er ${prosent} % på vei` : ""}.`
          : "Du er i beste kategori (A).",
    };
  }

  return {
    nivaa,
    kategori,
    sgStatus: {
      verdi: agg.total !== null ? fmtSg(agg.total) : null,
      trend,
      runder: agg.rundeAntall,
      baseline: SG_BASELINE_NAVN,
      begrunnelse: ferskesteInnsikt?.body ?? null,
      kategorier,
      trendPunkter,
    },
    nesteFokus,
    runder: { hull, sammendrag, tigerFive },
    baggen: {
      koller,
      varsler: gapVarsler,
      launchTomt: true,
      strikeTomt: true,
    },
    putting: { band, baseline: PUTT_BASELINE_NAVN },
    progresjon,
  };
}

export { AK_BANDS };
