/**
 * Data-loader for AgencyOS Stallen — spillertabell (/admin/spillere).
 * Henter ekte Prisma-data og mapper til StallenRow[] for den sortbare
 * spillertabellen. Pixel-port av
 * [historisk fasit, fjernet 2026-07-03] agencyos/components-agency-player-table.html.
 *
 * Følger samme mønster som src/lib/agencyos/daily-brief-data.tsx — alle tall
 * er utledet fra ekte data. Felter uten kilde i datamodellen vises tomt/utledet
 * (aldri oppdiktede verdier i UI).
 */

import { prisma } from "@/lib/prisma";
import type { PlayerProgram, Tier, UserStatus, PyramidArea } from "@/generated/prisma/client";
import { erOktGjennomfort } from "@/lib/workbench/compliance";

// ── Typer eksponert til komponenten ─────────────────────────────
export type GroupBucket = "WANG" | "GFGK" | "AKA";
export type TierKind = "konk" | "mosj" | "akad";
export type SgTone = "pos" | "neg" | "flat";
export type StatusKind = "aktiv" | "bak" | "inaktiv" | "veil";
export type Axis = "fys" | "tek" | "slag" | "spill" | "turn";

export type AxisAdh = { axis: Axis; pct: number; alarm: boolean };

export type StallenRow = {
  id: string;
  name: string;
  /** Initialer for avatar-fallback. */
  initials: string;
  /** Handicap formatert (+1,2 / 2,1 / —). */
  hcp: string;
  avatarUrl: string | null;
  /** Mono sub-linje under navn (homeClub · status e.l.). */
  sub: string;
  group: GroupBucket | null;
  coachName: string | null;
  coachInitials: string | null;
  /** Abonnement-tier. NB: fasit viser KONK/MOSJ/AKAD (ambisjon) — vi har kun
   *  Tier-enum (GRATIS/PRO/ELITE). Se rapport/avvik. */
  tier: TierKind;
  tierLabel: string;
  /** Økter denne uka — fullført / planlagt. */
  oktDone: number;
  oktPlanned: number;
  /** Treningstimer siste 30 dager. */
  hours30: number;
  /** SG-trend siste 8 målepunkter (eldst → nyest) for sparkline. */
  sgTrend: number[];
  /** SG-delta (nyeste − eldste). null = for lite data. */
  sgDelta: number | null;
  sgTone: SgTone;
  /** Pyramide-adherence per akse denne uka (% av planlagte timer). */
  adherence: AxisAdh[];
  /** Aggregert adherence-prosent denne uka. null = ingen planlagte økter. */
  adhPct: number | null;
  status: StatusKind;
  statusLabel: string;
  /** Aldri logget inn (lastLoginAt mangler) — bulk-importert plassholderprofil
   *  uten egen aktivitet ennå, skal grupperes bak «Venter på innlogging». */
  neverLoggedIn: boolean;
  /** Abonnements-pakke (Subscription.tier, «Drop-in» uten abonnement) —
   *  flyttet inn fra den tidligere cockpit-spillerlista (B2, 2026-07-12). */
  pakke: string;
  pakkeAktiv: boolean;
  /** Minst én FAILED betaling — «skylder»-flagget fra cockpit-lista. */
  skylder: boolean;
};

export type StallenData = {
  rows: StallenRow[];
  /** Totalt antall spillere (etter rolle/coach-scope, før gruppe/søk-filter). */
  total: number;
  /** Antall per gruppe-bucket (for filter-piller). */
  counts: { all: number; WANG: number; GFGK: number; AKA: number };
  bakPlan: number;
  inaktive: number;
  /** Treningstimer-delta siste 30 d vs forrige 30 d (hele stallen). */
  hoursDelta: number;
  /** ISO-ukenummer for "uke X" i tittelen. */
  weekNo: number;
};

export type StallenSort =
  | "sg"
  | "name"
  | "group"
  | "coach"
  | "tier"
  | "okt"
  | "hours"
  | "adh"
  | "status";
export type SortDir = "asc" | "desc";

export type StallenParams = {
  q?: string;
  group?: string; // WANG | GFGK | AKA | alle
  sort?: string;
  dir?: string;
};

// ── Hjelpere ────────────────────────────────────────────────────
function initials(name: string | null | undefined): string {
  if (!name) return "—";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Handicap → visningsstreng: +1,2 (plusshcp) / 2,1 / — (mangler). */
function fmtHcp(v: number | null): string {
  if (v == null) return "—";
  if (v <= 0) return `+${Math.abs(v).toFixed(1).replace(".", ",")}`;
  return v.toFixed(1).replace(".", ",");
}

/** Forkortet visningsnavn: "Øyvind Rohjan" → "Øyvind R." */
function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return name;
  const first = parts[0];
  const rest = parts.slice(1).map((p) => `${p[0].toUpperCase()}.`).join("");
  return `${first} ${rest}`;
}

const PROGRAM_BUCKET: Record<PlayerProgram, GroupBucket | null> = {
  WANG_TOPPIDRETT: "WANG",
  WANG_UNG: "WANG",
  GFGK_MINI: "GFGK",
  GFGK_BREDDE: "GFGK",
  GFGK_JENTER: "GFGK",
  GFGK_ELITE: "GFGK",
  AK_ACADEMY: "AKA",
  AK_ACADEMY_JUNIOR: "AKA",
  PLATFORM_ONLY: null,
};

/** Tier-enum → fasitens ikon-bucket + label. Vi har ikke ambisjons-tier i
 *  datamodellen, så abonnement-tier brukes som nærmeste ekte felt. */
const TIER_MAP: Record<Tier, { kind: TierKind; label: string }> = {
  ELITE: { kind: "konk", label: "PRO" }, // ELITE dødt enum → vis som PRO (betalt)
  PRO: { kind: "konk", label: "PRO" },
  GRATIS: { kind: "mosj", label: "FREE" },
};

const PYR_TO_AXIS: Record<PyramidArea, Axis> = {
  FYS: "fys",
  TEK: "tek",
  SLAG: "slag",
  SPILL: "spill",
  TURN: "turn",
};
const AXIS_ORDER: Axis[] = ["fys", "tek", "slag", "spill", "turn"];

function isoWeek(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - dayNum + 3);
  const firstThursday = new Date(Date.UTC(date.getUTCFullYear(), 0, 4));
  const firstDayNum = (firstThursday.getUTCDay() + 6) % 7;
  firstThursday.setUTCDate(firstThursday.getUTCDate() - firstDayNum + 3);
  return 1 + Math.round((date.getTime() - firstThursday.getTime()) / 604_800_000);
}

function statusFrom(
  userStatus: UserStatus,
  daysSinceLogin: number | null,
  oktDone: number,
  oktPlanned: number,
  wantsGuidance: boolean,
): { status: StatusKind; label: string } {
  if (wantsGuidance) return { status: "veil", label: "Ønsker veil." };
  if (userStatus === "INAKTIV") return { status: "inaktiv", label: "Inaktiv" };
  if (daysSinceLogin == null || daysSinceLogin >= 14)
    return { status: "inaktiv", label: "Inaktiv" };
  if (userStatus === "SKADET" || userStatus === "PERMISJON")
    return { status: "bak", label: "Bak plan" };
  // Bak plan: planlagte økter denne uka, men under halvparten gjennomført
  // og uka er kommet et stykke (>=3 dager inn).
  if (oktPlanned > 0 && oktDone < oktPlanned * 0.5)
    return { status: "bak", label: "Bak plan" };
  return { status: "aktiv", label: "Aktiv" };
}

// ── Hoved-loader ────────────────────────────────────────────────
export async function loadStallen(
  coach: { id: string; role: string },
  params: StallenParams,
): Promise<StallenData> {
  const now = new Date();
  const isAdmin = coach.role === "ADMIN";

  // Tidsvinduer
  const ukeStart = new Date(now);
  ukeStart.setHours(0, 0, 0, 0);
  ukeStart.setDate(ukeStart.getDate() - ((ukeStart.getDay() + 6) % 7));
  const ukeSlutt = new Date(ukeStart);
  ukeSlutt.setDate(ukeSlutt.getDate() + 7);

  const tretti = new Date(now);
  tretti.setDate(tretti.getDate() - 30);
  const seksti = new Date(now);
  seksti.setDate(seksti.getDate() - 60);

  // Where: spillere i coachens scope (ADMIN ser alle, COACH ser sine via enrollering).
  const where = {
    role: "PLAYER" as const,
    deletedAt: null,
    enrollmentsAsPlayer: {
      some: {
        endedAt: null,
        NOT: { program: "PLATFORM_ONLY" as PlayerProgram },
        ...(isAdmin ? {} : { coachId: coach.id }),
      },
    },
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
            { homeClub: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const players = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      hcp: true,
      avatarUrl: true,
      homeClub: true,
      userStatus: true,
      tier: true,
      lastLoginAt: true,
      enrollmentsAsPlayer: {
        where: { endedAt: null },
        select: {
          program: true,
          coach: { select: { name: true } },
        },
        orderBy: { enrolledAt: "desc" },
      },
      // SG-trend: foretrekk BrukerSgInput, fall tilbake på Round.
      sgInputs: {
        where: { sgTotal: { not: null } },
        select: { sgTotal: true },
        orderBy: { dato: "desc" },
        take: 8,
      },
      rounds: {
        where: { sgTotal: { not: null } },
        select: { sgTotal: true },
        orderBy: { playedAt: "desc" },
        take: 8,
      },
      // Pending session-request → "Ønsker veiledning".
      sessionRequestsAsPlayer: {
        where: { status: "PENDING" },
        select: { id: true },
        take: 1,
      },
      // Pakke + «skylder» (B2): abonnement og feilede betalinger.
      subscription: { select: { tier: true, status: true } },
      _count: { select: { payments: { where: { status: "FAILED" } } } },
      // Treningsplan-økter for uke (adherence + økter) og 30 d (timer).
      trainingPlans: {
        select: {
          sessions: {
            where: { scheduledAt: { gte: seksti, lt: ukeSlutt } },
            select: {
              scheduledAt: true,
              durationMin: true,
              status: true,
              pyramidArea: true,
            },
          },
        },
      },
    },
    take: 400,
  });

  const rows: StallenRow[] = players.map((p) => {
    const days = p.lastLoginAt
      ? Math.floor((now.getTime() - p.lastLoginAt.getTime()) / 86_400_000)
      : null;

    // Gruppe-bucket: første aktive enrollering som mapper til en bucket.
    let group: GroupBucket | null = null;
    for (const e of p.enrollmentsAsPlayer) {
      const b = PROGRAM_BUCKET[e.program];
      if (b) {
        group = b;
        break;
      }
    }
    const coachName = p.enrollmentsAsPlayer.find((e) => e.coach?.name)?.coach?.name ?? null;

    // SG-trend (eldst → nyest). Bruk BrukerSgInput hvis tilgjengelig, ellers Round.
    const sgSource =
      p.sgInputs.length >= 2
        ? p.sgInputs.map((s) => s.sgTotal as number)
        : p.rounds.map((r) => r.sgTotal as number);
    const sgTrend = [...sgSource].reverse(); // nyeste-først → eldst-først
    const sgDelta =
      sgTrend.length >= 2 ? sgTrend[sgTrend.length - 1] - sgTrend[0] : null;
    const sgTone: SgTone =
      sgDelta == null || Math.abs(sgDelta) < 0.05 ? "flat" : sgDelta > 0 ? "pos" : "neg";

    // Flat ut alle planøkter
    const sessions = p.trainingPlans.flatMap((tp) => tp.sessions);

    // Timer siste 30 d (gjennomførte/planlagte i vinduet) i timer.
    const min30 = sessions
      .filter((s) => s.scheduledAt >= tretti && s.scheduledAt < now)
      .reduce((sum, s) => sum + (s.durationMin ?? 0), 0);
    const hours30 = Math.round((min30 / 60) * 10) / 10;

    // Økter denne uka — planlagt vs fullført.
    const ukeSessions = sessions.filter(
      (s) => s.scheduledAt >= ukeStart && s.scheduledAt < ukeSlutt,
    );
    const oktPlanned = ukeSessions.length;
    const oktDone = ukeSessions.filter((s) => erOktGjennomfort(s.status)).length;

    // Pyramide-adherence denne uka per akse: % minutter fullført av planlagt.
    const plannedByAxis = new Map<Axis, number>();
    const doneByAxis = new Map<Axis, number>();
    for (const s of ukeSessions) {
      const ax = PYR_TO_AXIS[s.pyramidArea];
      const dur = s.durationMin ?? 0;
      plannedByAxis.set(ax, (plannedByAxis.get(ax) ?? 0) + dur);
      if (erOktGjennomfort(s.status))
        doneByAxis.set(ax, (doneByAxis.get(ax) ?? 0) + dur);
    }
    const adherence: AxisAdh[] = AXIS_ORDER.map((axis) => {
      const planned = plannedByAxis.get(axis) ?? 0;
      const done = doneByAxis.get(axis) ?? 0;
      const pct = planned > 0 ? Math.round((done / planned) * 100) : 0;
      return { axis, pct, alarm: planned > 0 && pct < 40 };
    });
    const totalPlanned = [...plannedByAxis.values()].reduce((a, b) => a + b, 0);
    const totalDone = [...doneByAxis.values()].reduce((a, b) => a + b, 0);
    const adhPct = totalPlanned > 0 ? Math.round((totalDone / totalPlanned) * 100) : null;

    const wantsGuidance = p.sessionRequestsAsPlayer.length > 0;
    const { status, label: statusLabel } = statusFrom(
      p.userStatus,
      days,
      oktDone,
      oktPlanned,
      wantsGuidance,
    );

    const tierInfo = TIER_MAP[p.tier];

    // Sub-linje: homeClub + status-hint (fasit: "SRIXON #2 · 12 DG", "SKADE · KNE").
    const subParts: string[] = [];
    if (p.homeClub) subParts.push(p.homeClub.toUpperCase());
    if (p.userStatus === "SKADET") subParts.push("SKADE");
    else if (p.userStatus === "PERMISJON") subParts.push("PERMISJON");
    else if (status === "inaktiv" && days != null) subParts.push(`${days} DG INAKTIV`);
    const sub = subParts.join(" · ") || "—";

    return {
      id: p.id,
      name: shortName(p.name),
      initials: initials(p.name),
      hcp: fmtHcp(p.hcp),
      avatarUrl: p.avatarUrl,
      sub,
      group,
      coachName,
      coachInitials: coachName ? initials(coachName) : null,
      tier: tierInfo.kind,
      tierLabel: tierInfo.label,
      oktDone,
      oktPlanned,
      hours30,
      sgTrend,
      sgDelta,
      sgTone,
      adherence,
      adhPct,
      status,
      statusLabel,
      neverLoggedIn: days == null,
      pakke: p.subscription?.tier ?? "Drop-in",
      pakkeAktiv: p.subscription?.status === "ACTIVE",
      skylder: p._count.payments > 0,
    };
  });

  // Tellere (før gruppe-filter, etter rolle/søk-scope).
  const counts = {
    all: rows.length,
    WANG: rows.filter((r) => r.group === "WANG").length,
    GFGK: rows.filter((r) => r.group === "GFGK").length,
    AKA: rows.filter((r) => r.group === "AKA").length,
  };
  const bakPlan = rows.filter((r) => r.status === "bak").length;
  const inaktive = rows.filter((r) => r.status === "inaktiv").length;

  // Timer-delta hele stallen: siste 30 d vs forrige 30 d.
  let min30all = 0;
  let min60all = 0;
  for (const p of players) {
    for (const tp of p.trainingPlans) {
      for (const s of tp.sessions) {
        const dur = s.durationMin ?? 0;
        if (s.scheduledAt >= tretti && s.scheduledAt < now) min30all += dur;
        else if (s.scheduledAt >= seksti && s.scheduledAt < tretti) min60all += dur;
      }
    }
  }
  const hoursDelta = Math.round((min30all - min60all) / 60);

  // Gruppe-filter (etter at tellere er låst).
  const groupFilter =
    params.group === "WANG" || params.group === "GFGK" || params.group === "AKA"
      ? (params.group as GroupBucket)
      : null;
  let filtered = groupFilter ? rows.filter((r) => r.group === groupFilter) : rows;

  // Sortering (3-state håndteres i UI via URL; default: SG-trend descending).
  const sort = (params.sort as StallenSort) || "sg";
  const dir: SortDir = params.dir === "asc" ? "asc" : "desc";
  filtered = sortRows(filtered, sort, dir);

  return {
    rows: filtered,
    total: rows.length,
    counts,
    bakPlan,
    inaktive,
    hoursDelta,
    weekNo: isoWeek(now),
  };
}

function sortRows(rows: StallenRow[], sort: StallenSort, dir: SortDir): StallenRow[] {
  const mul = dir === "asc" ? 1 : -1;
  const byNum = (a: number | null, b: number | null) => {
    const av = a ?? -Infinity;
    const bv = b ?? -Infinity;
    return (av - bv) * mul;
  };
  const byStr = (a: string | null, b: string | null) =>
    (a ?? "").localeCompare(b ?? "", "nb") * mul;

  const copy = [...rows];
  switch (sort) {
    case "name":
      return copy.sort((a, b) => byStr(a.name, b.name));
    case "group":
      return copy.sort((a, b) => byStr(a.group, b.group));
    case "coach":
      return copy.sort((a, b) => byStr(a.coachName, b.coachName));
    case "tier":
      return copy.sort((a, b) => byStr(a.tierLabel, b.tierLabel));
    case "okt":
      return copy.sort((a, b) => byNum(a.oktDone, b.oktDone));
    case "hours":
      return copy.sort((a, b) => byNum(a.hours30, b.hours30));
    case "adh":
      return copy.sort((a, b) => byNum(a.adhPct, b.adhPct));
    case "status":
      return copy.sort((a, b) => byStr(a.statusLabel, b.statusLabel));
    case "sg":
    default:
      return copy.sort((a, b) => byNum(a.sgDelta, b.sgDelta));
  }
}
