/**
 * Turnering — datalasting per fane (MASTERPLAN 15.6).
 *
 * Kun den AKTIVE fanen lastes fra siden — aldri alle fire samtidig.
 * "dubletter" har egen loader i src/lib/admin/ko/last-dubletter.ts (delt
 * med Kø, flyttes ikke hit — se faner.ts).
 */

import { prisma } from "@/lib/prisma";
import { startOfWeek } from "@/lib/uke-helpers";
import type {
  AdminTurneringerV2Data,
  AdminTurneringV2Row,
  TurneringChipTone,
} from "@/components/admin/v2/AdminTurneringerV2";

type RadIntern = Omit<AdminTurneringV2Row, "erKommende"> & { statuser: string[] };

/** «9.–10. jun» / «21. jun» / «14. aug – 16. sep» (nb-NO, uten år). */
function datoSpenn(start: Date, end: Date | null): string {
  const mnd = (d: Date) => d.toLocaleDateString("nb-NO", { month: "short" }).replace(/\.$/, "");
  if (!end || start.toDateString() === end.toDateString()) {
    return `${start.getDate()}. ${mnd(start)}`;
  }
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${start.getDate()}.–${end.getDate()}. ${mnd(start)}`;
  }
  return `${start.getDate()}. ${mnd(start)} – ${end.getDate()}. ${mnd(end)}`;
}

/** Chip fra entry-statusene til stallens påmeldinger. */
function statusChip(statuser: string[]): { label: string; tone: TurneringChipTone } | null {
  const aktive = statuser.filter((s) => s === "PLANNED" || s === "CONFIRMED");
  if (aktive.length === 0) {
    if (statuser.some((s) => s === "COMPLETED" || s === "DNF")) {
      return { label: "Gjennomført", tone: "neu" };
    }
    if (statuser.some((s) => s === "WITHDRAWN")) {
      return { label: "Trukket", tone: "neu" };
    }
    return null;
  }
  if (aktive.every((s) => s === "CONFIRMED")) return { label: "Bekreftet", tone: "ok" };
  return { label: "Påmelding åpen", tone: "lime" };
}

/**
 * Fane «Mine spillere» — flyttet ORDRETT fra src/app/admin/tournaments/page.tsx
 * (den tidligere eneste /admin/tournaments-visningen). Viser KUN turneringer
 * stallen er påmeldt i — samme datakilde og logikk som før, uendret.
 */
export async function lastMineSpillereTurneringer(): Promise<AdminTurneringerV2Data> {
  const now = new Date();
  const ukeStart = startOfWeek(now);

  const entries = await prisma.tournamentEntry.findMany({
    select: {
      entryStatus: true,
      tournamentId: true,
      manualName: true,
      manualDate: true,
      manualEndDate: true,
      tournament: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          location: true,
          course: { select: { name: true } },
        },
      },
    },
  });

  const perTurnering = new Map<string, { start: Date; end: Date | null } & RadIntern>();
  for (const e of entries) {
    const t = e.tournament;
    const key = t ? t.id : `manuell:${e.manualName ?? "?"}:${e.manualDate?.toISOString() ?? "?"}`;
    const start = t?.startDate ?? e.manualDate;
    if (!start) continue;
    const eksisterende = perTurnering.get(key);
    if (eksisterende) {
      eksisterende.statuser.push(e.entryStatus);
    } else {
      perTurnering.set(key, {
        key,
        href: t ? `/admin/tournaments/${t.id}` : null,
        navn: t?.name ?? e.manualName ?? "(uten navn)",
        start,
        end: t?.endDate ?? e.manualEndDate ?? null,
        anlegg: t ? (t.course?.name ?? (t.location || null)) : null,
        datoTekst: "",
        paameldte: 0,
        chip: null,
        statuser: [e.entryStatus],
      });
    }
  }

  const rader: AdminTurneringV2Row[] = [...perTurnering.values()]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((r) => ({
      key: r.key,
      href: r.href,
      navn: r.navn,
      datoTekst: datoSpenn(r.start, r.end),
      anlegg: r.anlegg,
      paameldte: r.statuser.filter((s) => s !== "WITHDRAWN").length,
      chip: statusChip(r.statuser),
      erKommende: r.start.getTime() >= ukeStart.getTime(),
    }));

  // Manuelt registrerte turneringer uten kobling mot en kanonisk kilde ennå —
  // samme datagrunnlag som dubletter-fanen.
  const dublettAntall = await prisma.tournament.count({
    where: { sourceOrigin: "MANUAL", mergedIntoId: null },
  });

  // KPI-rad (fasit agencyos-turneringer.html): stallens dekning + synk-hull,
  // ikke bare listen under. Stallstørrelse = aktive PLAYER-brukere.
  const [stallStorrelse, paameldteSpillere, utenKobling] = await Promise.all([
    prisma.user.count({ where: { role: "PLAYER" } }),
    prisma.tournamentEntry
      .findMany({ where: { entryStatus: { not: "WITHDRAWN" } }, select: { userId: true }, distinct: ["userId"] })
      .then((rows) => rows.length),
    // Scrapet resultat (PublicPlayerEntry) uten kobling til en PlayerHQ-bruker
    // — spilleren finnes i turneringen, men ikke koblet til en konto her.
    prisma.publicPlayerEntry.count({
      where: {
        tournament: { startDate: { gte: new Date(now.getFullYear(), 0, 1) }, mergedIntoId: null },
        player: { linkedUser: null },
      },
    }),
  ]);

  return {
    sesong: now.getFullYear(),
    rader,
    dublettAntall,
    kpi: { paameldteSpillere, stallStorrelse, utenKobling },
  };
}

/** Antall stallpåmeldte turneringer — brukt til fanepillens teller uten å laste hele fanen. */
export async function tellMineSpillereTurneringer(): Promise<number> {
  const rader = await prisma.tournamentEntry.findMany({
    select: { tournamentId: true, manualName: true, manualDate: true },
    distinct: ["tournamentId"],
  });
  // distinct på tournamentId alene teller manuelle rader (tournamentId null) som én —
  // godt nok for en pilletelling, den ekte listen (lastMineSpillereTurneringer) grupperer likt.
  const nokler = new Set(
    rader.map((r) => r.tournamentId ?? `manuell:${r.manualName ?? "?"}:${r.manualDate?.toISOString() ?? "?"}`),
  );
  return nokler.size;
}

export type TurneringAlleRad = {
  id: string;
  navn: string;
  datoTekst: string;
  anlegg: string | null;
  paameldte: number;
  kilde: string | null;
};

export type TurneringAlleData = {
  rader: TurneringAlleRad[];
  totalt: number;
  side: number;
  sideStorrelse: number;
  sok: string;
};

const ALLE_SIDE_STORRELSE = 50;

/**
 * Fane «Alle» — NY: full, søkbar, paginert liste over ALLE turneringer i
 * basen (~7 274 stk, jf. canvas). Fantes ikke som admin-visning før 15.6 —
 * /admin/tournaments viste kun stallens egne (nå fanen «Mine spillere»).
 */
export async function lastAlleTurneringer(params: { sok?: string; side?: number }): Promise<TurneringAlleData> {
  const sok = (params.sok ?? "").trim();
  const side = Math.max(0, params.side ?? 0);

  const where = sok
    ? { name: { contains: sok, mode: "insensitive" as const } }
    : {};

  const [totalt, turneringer] = await Promise.all([
    prisma.tournament.count({ where }),
    prisma.tournament.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip: side * ALLE_SIDE_STORRELSE,
      take: ALLE_SIDE_STORRELSE,
      select: {
        id: true,
        name: true,
        startDate: true,
        endDate: true,
        location: true,
        sourceOrigin: true,
        tour: true,
        course: { select: { name: true } },
      },
    }),
  ]);

  // IKKE `_count: { select: { publicEntries: true } }` i spørringen over — den
  // tabellen har 900k+ rader, og Prisma oversetter en relasjonstelling til en
  // UFILTRERT GROUP BY over hele tabellen uansett `take` (gotchas.md, «Prismas
  // _count på en relasjon skanner HELE relasjonstabellen»). Tell i stedet KUN
  // for de 50 idene som faktisk vises.
  const ider = turneringer.map((t) => t.id);
  const tellinger =
    ider.length === 0
      ? []
      : await prisma.publicPlayerEntry.groupBy({
          by: ["tournamentId"],
          where: { tournamentId: { in: ider } },
          _count: { _all: true },
        });
  const paameldteMap = new Map(tellinger.map((t) => [t.tournamentId, t._count._all]));

  const rader: TurneringAlleRad[] = turneringer.map((t) => ({
    id: t.id,
    navn: t.name,
    datoTekst: datoSpenn(t.startDate, t.endDate),
    anlegg: t.course?.name ?? t.location ?? null,
    paameldte: paameldteMap.get(t.id) ?? 0,
    kilde: t.sourceOrigin ?? t.tour ?? null,
  }));

  return { rader, totalt, side, sideStorrelse: ALLE_SIDE_STORRELSE, sok };
}

export type TurneringKartData = {
  noPlayers: number;
  withDg: number;
  entriesNo: number;
  rounds: number;
  tournamentsNo: number;
  since2016: number;
  byOrigin: { sourceOrigin: string | null; antall: number }[];
  topPlayers: { navn: string; tier: string; fodselsaar: number | null; antallEntries: number }[];
};

/**
 * Fane «Kart» — flyttet ORDRETT fra src/app/admin/turnering-kart/page.tsx.
 * Dekningsdashboard for norske spillere/turneringer, ikke et geografisk kart.
 */
export async function lastTurneringKart(): Promise<TurneringKartData> {
  const [noPlayers, withDg, entriesNo, rounds, tournamentsNo, byOrigin, topPlayers] = await Promise.all([
    prisma.publicPlayer.count({ where: { country: "NO" } }),
    prisma.publicPlayer.count({
      where: { country: "NO", dataGolfId: { not: null } },
    }),
    prisma.publicPlayerEntry.count({
      where: { player: { country: "NO" } },
    }),
    prisma.publicPlayerRound.count({
      where: { entry: { player: { country: "NO" } } },
    }),
    prisma.tournament.count({
      where: { OR: [{ country: "NO" }, { tour: { in: ["amateur-no", "junior-no"] } }] },
    }),
    prisma.tournament.groupBy({
      by: ["sourceOrigin"],
      _count: true,
      orderBy: { _count: { sourceOrigin: "desc" } },
      take: 12,
    }),
    prisma.publicPlayer.findMany({
      where: { country: "NO" },
      select: {
        name: true,
        tier: true,
        birthYear: true,
        _count: { select: { entries: true } },
      },
      orderBy: { entries: { _count: "desc" } },
      take: 25,
    }),
  ]);

  const since2016 = await prisma.publicPlayerEntry.count({
    where: {
      player: { country: "NO" },
      tournament: { startDate: { gte: new Date("2016-01-01") } },
    },
  });

  return {
    noPlayers,
    withDg,
    entriesNo,
    rounds,
    tournamentsNo,
    since2016,
    byOrigin: byOrigin.map((o) => ({ sourceOrigin: o.sourceOrigin, antall: o._count })),
    topPlayers: topPlayers.map((p) => ({
      navn: p.name,
      tier: p.tier,
      fodselsaar: p.birthYear,
      antallEntries: p._count.entries,
    })),
  };
}

/** Fanetellinger — billige count-spørringer for pillene. */
export async function turneringFaneTellinger(): Promise<{ alle: number; "mine-spillere": number; dubletter: number }> {
  const [alle, mineSpillere, dubletter] = await Promise.all([
    prisma.tournament.count(),
    tellMineSpillereTurneringer(),
    prisma.tournament.count({ where: { sourceOrigin: "MANUAL", mergedIntoId: null } }),
  ]);
  return { alle, "mine-spillere": mineSpillere, dubletter };
}
