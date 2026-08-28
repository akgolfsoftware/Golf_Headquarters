/**
 * Data-loader for PlayerHQ DataGolf-spillerkort (DG-01 / C10).
 *
 * Kun DataGolf-motor: PublicPlayerRound.source = DATAGOLF og PgaPlayerSeason
 * med DataGolf-kilde. Broadie-SG fra Round/BrukerSgInput og PEI vises ikke.
 * PGA-putt per avstand lastes for kildemerking (syncPgaPuttDistance = Broadie).
 */

import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/uke-helpers";
import {
  byggFeltRader,
  erDataGolfKilde,
  fmtDatoNb,
  initialer,
  kunDataGolf,
  pgaPuttKildeTekst,
  restAv,
  snitt,
  svakesteBotte,
  type FeltRad,
} from "./datagolf-kort";

const MAKS_RUNDER = 12;
const HCP_FELT_MIN = 0;
const HCP_FELT_MAX = 5;

export type DataGolfKode = "OTT" | "APP" | "ARG" | "PUTT";

export type DataGolfFeltRad = {
  plass: number;
  label: string;
  verdi: number;
  erDu: boolean;
};

export type DataGolfKategoriRad = {
  code: DataGolfKode;
  name: string;
  verdi: number | null;
};

export type DataGolfInnspillBotte = {
  label: string;
  verdi: number | null;
};

export type DataGolfStart = {
  id: string;
  navn: string;
  dato: string;
  sg: number | null;
  feltstyrke: number | null;
  kommende: boolean;
};

export type DataGolfPuttRad = {
  meter: number;
  sunkPct: number;
};

export type DataGolfData = {
  initialer: string;
  feltTekst: string;
  oppdatertLabel: string | null;
  antallRunder: number;
  skill: number | null;
  trueSg: number | null;
  rest: number | null;
  felt: DataGolfFeltRad[];
  skillKategorier: DataGolfKategoriRad[];
  innspill: DataGolfInnspillBotte[];
  innspillErTour: boolean;
  lekkasje: { label: string; verdi: number } | null;
  starter: DataGolfStart[];
  pgaPutt: DataGolfPuttRad[];
  pgaPuttKildeTekst: string;
};

const KAT_NAVN: Record<DataGolfKode, string> = {
  OTT: "Tee-slag",
  APP: "Innspill",
  ARG: "Nærspill",
  PUTT: "Putting",
};

const TOM: DataGolfData = {
  initialer: "",
  feltTekst: "HCP 0–5 · 0 = feltsnitt. Egen motor — blandes aldri med SG eller PEI.",
  oppdatertLabel: null,
  antallRunder: 0,
  skill: null,
  trueSg: null,
  rest: null,
  felt: [],
  skillKategorier: [
    { code: "OTT", name: KAT_NAVN.OTT, verdi: null },
    { code: "APP", name: KAT_NAVN.APP, verdi: null },
    { code: "ARG", name: KAT_NAVN.ARG, verdi: null },
    { code: "PUTT", name: KAT_NAVN.PUTT, verdi: null },
  ],
  innspill: [],
  innspillErTour: false,
  lekkasje: null,
  starter: [],
  pgaPutt: [],
  pgaPuttKildeTekst: pgaPuttKildeTekst("broadie-estimate"),
};

function sisteSnitt(
  runder: Array<{
    sgTotal: number | null;
    sgOtt: number | null;
    sgApp: number | null;
    sgArg: number | null;
    sgPutt: number | null;
    playedAt: Date;
  }>,
) {
  const siste = [...runder].sort((a, b) => b.playedAt.getTime() - a.playedAt.getTime()).slice(0, MAKS_RUNDER);
  return {
    antall: siste.length,
    total: snitt(siste.map((r) => r.sgTotal)),
    ott: snitt(siste.map((r) => r.sgOtt)),
    app: snitt(siste.map((r) => r.sgApp)),
    arg: snitt(siste.map((r) => r.sgArg)),
    putt: snitt(siste.map((r) => r.sgPutt)),
    sist: siste[0]?.playedAt ?? null,
  };
}

export async function hentDataGolf(userId: string): Promise<DataGolfData> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      publicPlayerId: true,
      publicPlayer: { select: { id: true, dataGolfId: true } },
    },
  });
  if (!user) return TOM;

  const now = startOfDay(new Date());

  const [season, egneDgRunder, feltDgRunder, innspillBaselines, puttRader, egneStarter, egnePublicEntries] = await Promise.all([
    user.publicPlayer?.dataGolfId != null
      ? prisma.pgaPlayerSeason.findFirst({
          where: { dgPlayerId: user.publicPlayer.dataGolfId },
          orderBy: { year: "desc" },
          select: { sgTotal: true, sgOtt: true, sgApp: true, sgArg: true, sgPutt: true, source: true },
        })
      : Promise.resolve(null),
    user.publicPlayerId
      ? prisma.publicPlayerRound.findMany({
          where: { source: "DATAGOLF", entry: { playerId: user.publicPlayerId } },
          select: {
            sgTotal: true,
            sgOtt: true,
            sgApp: true,
            sgArg: true,
            sgPutt: true,
            source: true,
            entry: { select: { playerId: true, tournament: { select: { startDate: true } } } },
          },
        })
      : Promise.resolve([]),
    prisma.publicPlayerRound.findMany({
      where: {
        source: "DATAGOLF",
        sgTotal: { not: null },
        entry: { player: { linkedUser: { deletedAt: null, hcp: { gte: HCP_FELT_MIN, lte: HCP_FELT_MAX } } } },
      },
      select: {
        sgTotal: true,
        sgOtt: true,
        sgApp: true,
        sgArg: true,
        sgPutt: true,
        source: true,
        createdAt: true,
        entry: {
          select: {
            playerId: true,
            tournament: { select: { startDate: true, name: true } },
          },
        },
      },
    }),
    prisma.sgBaseline.findMany({
      where: { category: "APP", lie: "FAIRWAY" },
      select: { distanceBucket: true, expectedStrokes: true, source: true },
      orderBy: { distanceBucket: "asc" },
    }),
    prisma.pgaPuttDistance.findMany({
      orderBy: { distanceMeters: "asc" },
      select: { distanceMeters: true, tourAvgSunkPct: true, source: true },
    }),
    prisma.tournamentEntry.findMany({
      where: { userId, withdrawnAt: null },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        manualName: true,
        manualDate: true,
        tournament: { select: { name: true, startDate: true, status: true } },
      },
    }),
    user.publicPlayerId
      ? prisma.publicPlayerEntry.findMany({
          where: { playerId: user.publicPlayerId },
          orderBy: { createdAt: "desc" },
          take: 8,
          select: {
            id: true,
            tournament: { select: { name: true, startDate: true, status: true } },
            roundDetails: {
              where: { source: "DATAGOLF", sgTotal: { not: null } },
              select: { sgTotal: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  const egne = kunDataGolf(
    egneDgRunder.map((r) => ({
      source: r.source,
      playerId: r.entry.playerId,
      sgTotal: r.sgTotal,
      sgOtt: r.sgOtt,
      sgApp: r.sgApp,
      sgArg: r.sgArg,
      sgPutt: r.sgPutt,
      playedAt: r.entry.tournament.startDate,
    })),
  );
  const duSnitt = sisteSnitt(egne);

  const feltRunder = kunDataGolf(
    feltDgRunder.map((r) => ({
      source: r.source,
      playerId: r.entry.playerId,
      sgTotal: r.sgTotal,
      sgOtt: r.sgOtt,
      sgApp: r.sgApp,
      sgArg: r.sgArg,
      sgPutt: r.sgPutt,
      playedAt: r.entry.tournament.startDate,
    })),
  );

  const perSpiller = new Map<string, typeof feltRunder>();
  for (const r of feltRunder) {
    const list = perSpiller.get(r.playerId) ?? [];
    list.push(r);
    perSpiller.set(r.playerId, list);
  }

  const duPlayerId = user.publicPlayerId;
  const feltRader: FeltRad[] = [];
  for (const [playerId, runder] of perSpiller) {
    const s = sisteSnitt(runder);
    if (s.total == null) continue;
    feltRader.push({
      id: playerId,
      erDu: duPlayerId != null && playerId === duPlayerId,
      verdi: s.total,
    });
  }

  const feltSnitt = snitt(feltRader.map((r) => r.verdi));
  const felt = byggFeltRader(feltRader, feltSnitt);

  const skill = season && erDataGolfKilde(season.source) ? (season.sgTotal ?? null) : null;
  const trueSg = duSnitt.total;
  const rest = restAv(trueSg, skill);

  // Skill-fanen: sesong-skill (DataGolf) hvis den finnes, ellers True SG
  // per kategori fra egne DATAGOLF-runder. Aldri Broadie fra Round, og
  // aldri sesong-tall blandet med runde-snitt i samme celle.
  const harSkillSesong = skill != null;
  const skillKategorier: DataGolfKategoriRad[] = [
    { code: "OTT", name: KAT_NAVN.OTT, verdi: harSkillSesong ? (season?.sgOtt ?? null) : duSnitt.ott },
    { code: "APP", name: KAT_NAVN.APP, verdi: harSkillSesong ? (season?.sgApp ?? null) : duSnitt.app },
    { code: "ARG", name: KAT_NAVN.ARG, verdi: harSkillSesong ? (season?.sgArg ?? null) : duSnitt.arg },
    { code: "PUTT", name: KAT_NAVN.PUTT, verdi: harSkillSesong ? (season?.sgPutt ?? null) : duSnitt.putt },
  ];

  const dgBaselines = innspillBaselines.filter((b) => erDataGolfKilde(b.source));
  const innspill: DataGolfInnspillBotte[] = dgBaselines.slice(0, 6).map((b) => ({
    label: b.distanceBucket.replace(/y$/i, ""),
    verdi: b.expectedStrokes,
  }));
  const lekkasje = innspillErPlayer(innspill) ? svakesteBotte(innspill) : null;

  const starterFraEntry: DataGolfStart[] = egneStarter.map((e) => {
    const dato = e.tournament?.startDate ?? e.manualDate;
    const navn = e.tournament?.name ?? e.manualName ?? "Start";
    const kommende = dato != null && dato >= now;
    return {
      id: e.id,
      navn,
      dato: dato ? fmtDatoNb(dato) : "mangler",
      sg: null,
      feltstyrke: null,
      kommende,
    };
  });

  const starterFraPublic: DataGolfStart[] = egnePublicEntries.map((e) => {
    const dato = e.tournament.startDate;
    const kommende = dato >= now || e.tournament.status === "UPCOMING";
    return {
      id: e.id,
      navn: e.tournament.name,
      dato: fmtDatoNb(dato),
      sg: snitt(e.roundDetails.map((r) => r.sgTotal)),
      feltstyrke: null,
      kommende,
    };
  });

  const starter = dedupeStarter([...starterFraPublic, ...starterFraEntry]).slice(0, 6);

  const puttKilde = puttRader[0]?.source ?? "broadie-estimate";
  const pgaPutt: DataGolfPuttRad[] = puttRader.map((p) => ({
    meter: p.distanceMeters,
    sunkPct: p.tourAvgSunkPct,
  }));

  const oppdatert = duSnitt.sist;

  return {
    initialer: initialer(user.name),
    feltTekst: TOM.feltTekst,
    oppdatertLabel: oppdatert
      ? `Siste ${duSnitt.antall} DataGolf-runder · oppdatert ${fmtDatoNb(oppdatert)}`
      : duSnitt.antall > 0
        ? `Siste ${duSnitt.antall} DataGolf-runder`
        : null,
    antallRunder: duSnitt.antall,
    skill,
    trueSg,
    rest,
    felt,
    skillKategorier,
    innspill,
    innspillErTour: innspill.length > 0,
    lekkasje,
    starter,
    pgaPutt,
    pgaPuttKildeTekst: pgaPuttKildeTekst(puttKilde),
  };
}

/** Tour-baselines er ikke spillerens tall — da er «lekkasje / tren mot» UTKAST uten auto-plan. */
function innspillErPlayer(_botter: DataGolfInnspillBotte[]): boolean {
  return false;
}

function dedupeStarter(rader: DataGolfStart[]): DataGolfStart[] {
  const sett = new Set<string>();
  const ut: DataGolfStart[] = [];
  for (const r of rader) {
    const k = `${r.navn}|${r.dato}`;
    if (sett.has(k)) continue;
    sett.add(k);
    ut.push(r);
  }
  ut.sort((a, b) => {
    if (a.kommende !== b.kommende) return a.kommende ? -1 : 1;
    return b.dato.localeCompare(a.dato);
  });
  return ut;
}
