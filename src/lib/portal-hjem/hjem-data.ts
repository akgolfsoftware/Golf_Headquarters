/**
 * Data-loader for PlayerHQ Hjem (/portal).
 *
 * Samler all server-side henting for hjem-skjermen til én typet `HjemData`,
 * strukturert mot Claude Design-fasiten (ph-home.jsx · HomeMobile):
 *   hero → 3 KPI → dagens fokus → Workbench-CTA → pyramide → dagens program →
 *   neste tee → neste turnering.
 *
 * Alt kommer fra ekte Prisma. Mangler data → null/tom liste → tomstate i UI.
 * ALDRI falske tall.
 */

import "server-only";
import { prisma } from "@/lib/prisma";
import { getWeekProgress } from "@/components/portal/workbench/get-week-progress";
import type { PyramidRow } from "@/components/athletic";

type PyramidArea = "FYS" | "TEK" | "SLAG" | "SPILL" | "TURN";
type OktStatus = "done" | "now" | "upcoming";

export type HjemUser = {
  fornavn: string;
  initialer: string;
  tier: string;
  hcp: number | null;
  homeClub: string | null;
  avatarUrl: string | null;
};

export type KpiCelle = {
  label: string;
  value: string;
  unit?: string;
  trend?: { value: string; tone: "positive" | "negative" | "neutral" };
};

/** Display-headline med italic-aksent midt i setningen. */
export type Headline = { pre: string; em: string; post: string };

/** Dagens fokus-økt → FeaturedCard. */
export type DagensFokus = {
  eyebrow: string;
  tittel: string;
  /** Editorial italic-aksent etter tittelen. */
  italic: string;
  beskrivelse: string;
  startHref: string;
  planHref: string;
};

/** Én rad i "Resten av dagen". */
export type ProgramOkt = {
  id: string;
  tid: string;
  tittel: string;
  meta: string;
  status: OktStatus;
  href: string;
};

export type NesteTee = {
  dagKort: string;
  datoTall: string;
  navn: string;
  meta: string;
  href: string;
};

export type NesteTurnering = {
  navn: string;
  meta: string;
  chip: string;
  href: string;
  planHref: string;
};

export type HjemData = {
  user: HjemUser;
  /** "ONS 28. MAI · OSLO GK" */
  datoEyebrow: string;
  /** "God morgen" */
  hilsen: string;
  headline: Headline;
  kpi: KpiCelle[];
  /** Desktop-utvidet KPI-sett (opptil 5: HCP/SG Total/Drive snitt/Snitt/Neste økt). */
  kpiDesktop: KpiCelle[];
  dagensFokus: DagensFokus | null;
  dagensProgram: ProgramOkt[];
  pyramide: PyramidRow[];
  pyramideNote: string | null;
  nesteTee: NesteTee | null;
  nesteTurnering: NesteTurnering | null;
  heroImageId: number;
  /** ISO-ukenummer nå — til "UKE NN · PYRAMIDEN". */
  ukeNr: number;
};

const PRACTICE_TO_PYRAMID: Record<string, PyramidArea> = {
  BLOKK: "TEK",
  RANDOM: "SLAG",
  KONKURRANSE: "TURN",
  SPILL_TEST: "SPILL",
};

const PYRAMID_LABEL: Record<string, string> = { fys: "Fysisk", tek: "Teknisk", slag: "Golfslag", spill: "Spill", turn: "Turnering" };
const PYRAMID_TONE: Record<string, "pyr-fys" | "pyr-tek" | "pyr-slag" | "pyr-spill" | "pyr-turn"> = {
  fys: "pyr-fys", tek: "pyr-tek", slag: "pyr-slag", spill: "pyr-spill", turn: "pyr-turn",
};
const TEMA: Record<PyramidArea, string> = { FYS: "Fysikken", TEK: "Teknikken", SLAG: "Slagene", SPILL: "Spillet", TURN: "Turneringsformen" };
/** Kort område-navn til økt-rad-meta (matcher fasitens "Oppvarming ·"/"Approach ·"-form). */
const TEMA_LABEL: Record<PyramidArea, string> = { FYS: "Fysisk", TEK: "Teknisk", SLAG: "Golfslag", SPILL: "Spill", TURN: "Turnering" };
/** Editorial italic-frase per fokusområde (designets "alt om bane-flighten."-mønster). */
const FOKUS_ITALIC: Record<PyramidArea, string> = { FYS: "bygg motoren.", TEK: "slip teknikken.", SLAG: "der slagene sitter.", SPILL: "spill det smart.", TURN: "toppform mot start." };

const UKEDAG_KORT = ["SØN", "MAN", "TIR", "ONS", "TOR", "FRE", "LØR"];
const MND_KORT = ["JAN", "FEB", "MAR", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DES"];

function ukenummer(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604_800_000);
}

function tid(d: Date): string {
  return d.toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Oslo" });
}

function initialerAv(navn: string): string {
  return navn.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

function nb2(n: number, signed = false): string {
  return n.toLocaleString("nb-NO", { minimumFractionDigits: 2, maximumFractionDigits: 2, signDisplay: signed ? "exceptZero" : "auto" });
}

export async function getHjemData(userId: string): Promise<HjemData> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { name: true, tier: true, hcp: true, homeClub: true, avatarUrl: true },
  });

  const now = new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  // --- Dagens økter ---
  const dagensOkter = await prisma.trainingSessionV2
    .findMany({
      where: { studentId: userId, startTime: { gte: startOfDay, lt: endOfDay } },
      orderBy: { startTime: "asc" },
      select: {
        id: true, title: true, startTime: true, endTime: true, status: true, practiceType: true,
        _count: { select: { drills: true } },
        drills: { select: { name: true }, orderBy: { sortOrder: "asc" }, take: 3 },
      },
      take: 12,
    })
    .catch(() => []);

  const statusAv = (s: string): OktStatus =>
    s === "COMPLETED" ? "done" : s === "IN_PROGRESS" ? "now" : "upcoming";
  const varighetMin = (o: { startTime: Date; endTime: Date }) =>
    Math.max(0, Math.round((o.endTime.getTime() - o.startTime.getTime()) / 60_000));
  const pyrAv = (pt: string): PyramidArea => PRACTICE_TO_PYRAMID[pt] ?? "TEK";

  const dagensProgram: ProgramOkt[] = dagensOkter.map((o) => ({
    id: o.id,
    tid: tid(o.startTime),
    tittel: o.title,
    meta: `${TEMA_LABEL[pyrAv(o.practiceType)]} · ${varighetMin(o)} min`,
    status: statusAv(o.status),
    href: `/portal/gjennomfore/${o.id}`,
  }));

  // Fokus-økt: pågående → neste planlagte → første.
  const fokusKilde =
    dagensOkter.find((o) => o.status === "IN_PROGRESS") ??
    dagensOkter.find((o) => o.endTime > now) ??
    dagensOkter[0] ??
    null;

  const fokusDrills = fokusKilde?.drills.map((d) => d.name) ?? [];
  const dagensFokus: DagensFokus | null = fokusKilde
    ? {
        eyebrow: `Dagens fokus · kl ${tid(fokusKilde.startTime)}`,
        tittel: fokusKilde.title,
        italic: FOKUS_ITALIC[pyrAv(fokusKilde.practiceType)],
        beskrivelse: fokusDrills.length
          ? fokusDrills.join(", ")
          : `${fokusKilde._count.drills} drills · ${user.homeClub ?? "egen økt"}`,
        startHref: `/portal/gjennomfore/${fokusKilde.id}`,
        planHref: "/portal/planlegge/workbench",
      }
    : null;

  // --- KPI: mobil = HCP · SG Total · Neste økt; desktop legger til Drive snitt + Snitt ---
  const [runder, driverTrend] = await Promise.all([
    prisma.round.findMany({ where: { userId }, orderBy: { playedAt: "desc" }, select: { sgTotal: true, score: true } }).catch(() => []),
    prisma.clubMetricTrend.findFirst({ where: { userId, club: "Driver" }, orderBy: { weekStart: "desc" }, select: { avgTotal: true } }).catch(() => null),
  ]);
  const sgVals = runder.map((r) => r.sgTotal).filter((n): n is number => n != null);
  const scoreVals = runder.map((r) => r.score).filter((n): n is number => n != null);
  const snitt = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
  const sgSnitt = snitt(sgVals);
  const snittScore = snitt(scoreVals);
  let sgTrend: KpiCelle["trend"] | undefined;
  if (sgVals.length >= 6) {
    const nyere = snitt(sgVals.slice(0, Math.ceil(sgVals.length / 2)));
    const eldre = snitt(sgVals.slice(Math.ceil(sgVals.length / 2)));
    if (nyere != null && eldre != null) {
      const d = nyere - eldre;
      sgTrend = { value: `${d >= 0 ? "↑" : "↓"} ${nb2(d, true)}`, tone: d >= 0 ? "positive" : "negative" };
    }
  }

  const kHcp: KpiCelle | null = user.hcp != null ? { label: "HCP", value: user.hcp.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) } : null;
  const kSg: KpiCelle | null = sgSnitt != null ? { label: "SG Total", value: nb2(sgSnitt, true), trend: sgTrend } : null;
  const kNeste: KpiCelle | null = fokusKilde ? { label: "Neste økt", value: tid(fokusKilde.startTime) } : null;
  const kDrive: KpiCelle | null = driverTrend?.avgTotal != null ? { label: "Drive snitt", value: String(Math.round(driverTrend.avgTotal)), unit: "m" } : null;
  const kSnitt: KpiCelle | null = snittScore != null ? { label: "Snitt", value: snittScore.toLocaleString("nb-NO", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) } : null;

  // Mobil: 3 viktigste. Desktop: opptil 5 i fasit-rekkefølge.
  const kpi: KpiCelle[] = [kHcp, kSg, kNeste].filter((k): k is KpiCelle => k != null);
  const kpiDesktop: KpiCelle[] = [kHcp, kSg, kDrive, kSnitt, kNeste].filter((k): k is KpiCelle => k != null);

  // --- Pyramide siste 7 dager ---
  const ukens = await getWeekProgress(userId).catch(() => null);
  const REKKEFOLGE = ["fys", "tek", "slag", "spill", "turn"] as const;
  const pyramide: PyramidRow[] =
    ukens && ukens.ukens_stats.okter > 0
      ? REKKEFOLGE.map((k) => {
          const andel = ukens.fordeling.actual[k];
          return { label: PYRAMID_LABEL[k], fillPercent: Math.round(andel * 100), value: `${Math.round(andel * 100)} %`, tone: PYRAMID_TONE[k] };
        })
      : [];
  const pyramideNote =
    pyramide.length > 0 ? `Uke ${ukenummer(now)} · ${ukens?.ukens_stats.okter} økter siste 7 dager` : null;

  // --- Kommende turneringer (to nærmeste) ---
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);
  const upcoming = await prisma.tournamentEntry
    .findMany({
      where: {
        userId,
        entryStatus: { in: ["PLANNED", "CONFIRMED"] },
        OR: [{ tournament: { startDate: { gte: todayMidnight } } }, { manualDate: { gte: todayMidnight } }],
      },
      include: { tournament: true },
      orderBy: [{ tournament: { startDate: "asc" } }, { manualDate: "asc" }],
      take: 2,
    })
    .catch(() => []);

  const teeAv = (e: (typeof upcoming)[number]): { dato: Date; navn: string; sted: string; status: string } | null => {
    const dato = e.tournament?.startDate ?? e.manualDate ?? null;
    if (!dato) return null;
    return {
      dato,
      navn: e.tournament?.name ?? e.manualName ?? "Turnering",
      sted: e.tournament?.location ?? e.category ?? "Sted ikke satt",
      status: e.entryStatus === "CONFIRMED" ? "Bekreftet" : "Påmeldt",
    };
  };

  const t0 = upcoming[0] ? teeAv(upcoming[0]) : null;
  const t1 = upcoming[1] ? teeAv(upcoming[1]) : null;

  const nesteTee: NesteTee | null = t0
    ? {
        dagKort: UKEDAG_KORT[t0.dato.getDay()],
        datoTall: String(t0.dato.getDate()),
        navn: t0.navn,
        meta: `${tid(t0.dato)} · 18 hull · ${t0.sted}`,
        href: "/portal/tren/turneringer",
      }
    : null;

  const turn = t1 ?? t0;
  const nesteTurnering: NesteTurnering | null = turn
    ? {
        navn: turn.navn,
        meta: `${turn.dato.getDate()}. ${MND_KORT[turn.dato.getMonth()].toLowerCase()} · ${turn.sted}`,
        chip: turn.status,
        href: "/portal/tren/turneringer",
        planHref: "/portal/planlegge/workbench",
      }
    : null;

  // --- Hero-tekst ---
  const fornavn = user.name.trim().split(/\s+/)[0] || "spiller";
  const time = now.getHours();
  const hilsen = time < 5 ? "God natt" : time < 11 ? "God morgen" : time < 17 ? "Hei" : "God kveld";

  const fokusPyr: PyramidArea | null = fokusKilde ? PRACTICE_TO_PYRAMID[fokusKilde.practiceType] ?? "TEK" : null;
  const headline: Headline = fokusPyr
    ? { pre: `${TEMA[fokusPyr]} er`, em: "der", post: "det skjer i dag." }
    : { pre: "I dag er", em: "det", post: "som teller." };

  const datoEyebrow = `${UKEDAG_KORT[now.getDay()]} ${now.getDate()}. ${MND_KORT[now.getMonth()]} · ${(user.homeClub ?? "").toUpperCase() || `UKE ${ukenummer(now)}`}`;
  const heroImageId = ((user.name.length * 7) % 30) + 1;

  return {
    user: { fornavn, initialer: initialerAv(user.name), tier: user.tier, hcp: user.hcp, homeClub: user.homeClub, avatarUrl: user.avatarUrl },
    datoEyebrow,
    hilsen,
    headline,
    kpi,
    kpiDesktop,
    dagensFokus,
    dagensProgram,
    pyramide,
    pyramideNote,
    nesteTee,
    nesteTurnering,
    heroImageId,
    ukeNr: ukenummer(now),
  };
}
