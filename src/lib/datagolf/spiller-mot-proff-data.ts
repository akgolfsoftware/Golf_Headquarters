/**
 * DG-05–07 for trenerflatene i WANG og Team Norway — lesing. Proffens tall er åpne Data Golf-tall;
 * spillerens tall leses bare gjennom organisasjonens delingslås (`medSpiller`), og bare når
 * `kanSeDataGolf` slipper treneren inn. En spiller, forelder eller uinnlogget får null.
 */
import "server-only";

import type { Prisma, UserRole } from "@/generated/prisma/client";
import { kanSeDataGolf } from "@/lib/auth/datagolf-regel";
import { hentKatalog, visNavn, type DgProffRad } from "@/lib/admin/datagolf/coach-data";
import { prisma } from "@/lib/prisma";
import { egneRundeTall, gjennomsnitt } from "./player-tool";
import { innspillTak, sgGap, type InnspillRad, type ProffBand, type SgGap, type SgTall } from "./spiller-mot-proff";

type Tx = Prisma.TransactionClient;

export type DgMaaling = { label: string; spiller: number | null; spillerAntall: number; proff: number | null; proffAntall: number | null; enhet: "slag" | "%" | "putt" };

export type DgSpillerVisning = {
  spillere: { id: string; navn: string }[];
  spiller: { id: string; navn: string } | null;
  proffer: DgProffRad[];
  proff: null | { dgId: number; navn: string; tour: string | null; dgRang: number | null; asOf: Date; sg: SgTall; bands: ProffBand[]; sesong: { tour: string; aar: number } | null };
  gap: SgGap | null;
  maalinger: DgMaaling[];
  innspill: InnspillRad[];
  forslag: { id: string; status: string; opprettet: Date; okter: number | null }[];
};

const RUNDER = 24;

async function lesSpiller(tx: Tx, spillerId: string, trenerId: string) {
  const [runder, forslag] = await Promise.all([
    tx.round.findMany({
      where: { userId: spillerId, playStatus: "COMPLETED" },
      orderBy: [{ playedAt: "desc" }, { id: "desc" }], take: RUNDER,
      select: {
        playedAt: true, score: true, sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true,
        holeScores: { select: { holeNumber: true, par: true, strokes: true, fairway: true, gir: true, putts: true } },
        shots: { where: { lie: { in: ["FAIRWAY", "ROUGH", "SEMI_ROUGH", "DEEP_ROUGH"] } }, select: { lie: true, distanceToPin: true, endDistanceToPinM: true, holed: true } },
      },
    }),
    tx.planAction.findMany({
      where: { userId: spillerId, coachId: trenerId, actionType: "WORKBENCH_COACH_PROPOSAL" },
      orderBy: { createdAt: "desc" }, take: 5, select: { id: true, status: true, createdAt: true, suggestion: true },
    }),
  ]);
  return { runder, forslag };
}

function puttPerRunde(holeScores: { putts: number | null }[]): number | null {
  return holeScores.length === 18 && holeScores.every((h) => h.putts != null) ? holeScores.reduce((s, h) => s + (h.putts ?? 0), 0) : null;
}

async function hentProff(dgId: number) {
  const tak = await prisma.datagolfTak.findUnique({ where: { dgPlayerId: dgId }, include: { bands: true } });
  if (!tak) return null;
  const sesonger = await prisma.pgaPlayerSeason.findMany({ where: { dgPlayerId: dgId }, orderBy: [{ year: "desc" }, { tour: "asc" }], take: 6 });
  const sesong = sesonger.find((s) => s.tour === tak.primaryTour) ?? sesonger[0] ?? null;
  return { tak, sesong };
}

export async function hentDgSpillerVisning(opts: {
  bruker: { id: string; role: UserRole };
  spillere: { id: string; navn: string }[];
  spillerId?: string;
  proffId?: number;
  medSpiller: <T>(spillerId: string, les: (tx: Tx) => Promise<T>) => Promise<T | null>;
}): Promise<DgSpillerVisning | null> {
  if (!kanSeDataGolf(opts.bruker)) return null;
  const { rader: proffer } = await hentKatalog({ norskForst: true });
  const valgtProff = proffer.find((p) => p.dgId === opts.proffId) ?? proffer[0] ?? null;
  const p = valgtProff ? await hentProff(valgtProff.dgId) : null;
  const proff: DgSpillerVisning["proff"] = p ? {
    dgId: p.tak.dgPlayerId, navn: visNavn(p.tak.name), tour: p.tak.primaryTour, dgRang: p.tak.dgRank, asOf: p.tak.asOf,
    sg: { sgTotal: p.tak.sgTotal, sgOtt: p.tak.sgOtt, sgApp: p.tak.sgApp, sgArg: p.tak.sgArg, sgPutt: p.tak.sgPutt },
    bands: p.tak.bands.map((b) => ({ band: b.band, lie: b.lie, meter: b.proximityMeters, gir: b.girRate, slag: b.shotCount })),
    sesong: p.sesong ? { tour: p.sesong.tour, aar: p.sesong.year } : null,
  } : null;

  // Bare spillere som deler med treneren kan velges. Delingen sjekkes på nytt i medSpiller.
  const spiller = opts.spillere.find((s) => s.id === opts.spillerId) ?? null;
  const lest = spiller ? await opts.medSpiller(spiller.id, (tx) => lesSpiller(tx, spiller.id, opts.bruker.id)) : null;
  const tom = { spillere: opts.spillere, proffer, proff, gap: null, maalinger: [], innspill: [], forslag: [] };
  if (!spiller || !lest) return { ...tom, spiller: null };

  const egne = egneRundeTall(lest.runder);
  const putt = gjennomsnitt(lest.runder.map((r) => puttPerRunde(r.holeScores)));
  const s = p?.sesong ?? null;
  const maalinger: DgMaaling[] = [
    { label: "Snittscore, brutto", spiller: egne.score.value, spillerAntall: egne.score.count, proff: s?.avgScore ?? null, proffAntall: s?.rounds ?? null, enhet: "slag" },
    { label: "Fairwaytreff", spiller: egne.accuracy.value, spillerAntall: egne.accuracy.count, proff: s?.fairwayPct ?? null, proffAntall: s?.rounds ?? null, enhet: "%" },
    { label: "GIR", spiller: egne.gir.value, spillerAntall: egne.gir.count, proff: s?.girPct ?? null, proffAntall: s?.rounds ?? null, enhet: "%" },
    { label: "Putt per runde", spiller: putt.value, spillerAntall: putt.count, proff: s?.puttsPerRound ?? null, proffAntall: s?.rounds ?? null, enhet: "putt" },
  ];
  return {
    ...tom,
    spiller,
    gap: sgGap(lest.runder, proff?.sg ?? null),
    maalinger,
    innspill: innspillTak(lest.runder.flatMap((r) => r.shots), proff?.bands ?? []),
    forslag: lest.forslag.map((f) => {
      const okter = f.suggestion && typeof f.suggestion === "object" && "okter" in f.suggestion && Array.isArray(f.suggestion.okter) ? f.suggestion.okter.length : null;
      return { id: f.id, status: f.status, opprettet: f.createdAt, okter };
    }),
  };
}
