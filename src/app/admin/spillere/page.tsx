/**
 * CoachHQ — Stallen (konsolidert spilleroversikt).
 *
 * Default view ("kort") er coach Anders sin stall — alle aktive spillere
 * presentert som rike kort med SG-trend, HCP, kategori og status-prikk.
 * Klikk på kort → /admin/spillere/[id] (coach detail-view).
 *
 *   ?view=kort    → grid med rike spillerkort (default, "stallen")
 *   ?view=tabell  → spillerliste-tabell (kompakt, sortbar)
 *   ?view=tavle   → kanban-tavle (auto-klassifisert etter aktivitet)
 *
 * Felles filter-bar øverst: søk, kategori, tier, status.
 */

import Link from "next/link";
import {
  LayoutGrid,
  Search,
  Table2,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { avatarBg } from "@/lib/avatar-colors";
import type { PlayerProgram } from "@/generated/prisma/client";
import { AdminHero as PageHeader } from "@/components/admin/admin-hero";
import { EmptyState } from "@/components/shared/empty-state";

type View = "kort" | "tabell" | "tavle";

type SearchParams = {
  view?: string;
  tier?: string;
  status?: string;
  q?: string;
  sort?: string;
  program?: string;
};

type Tier = "GRATIS" | "PRO" | "ELITE";

type Category = "A" | "B" | "C" | "D";

type StatusKey = "Ny" | "Aktiv" | "Fokus" | "Pause";

type RawPlayer = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  hcp: number | null;
  tier: Tier;
  lastLoginAt: Date | null;
  trainingPlans: { isActive: boolean }[];
  rounds: { playedAt: Date; sgTotal: number | null; score: number }[];
  testResults: { takenAt: Date }[];
  groupMemberships: { group: { name: string } }[];
  enrollmentsAsPlayer: { program: PlayerProgram; coachId: string | null; endedAt: Date | null }[];
};

type EnrichedPlayer = RawPlayer & {
  category: Category;
  boardStatus: StatusKey;
  daysSinceLogin: number;
  /** SG-trend siste 3 målepunkter (eldst → nyest). Brukes til sparkline. */
  sgTrend: number[];
  sgAvg: number | null;
  /** Aktive program-etiketter for visning på kort */
  programLabels: string[];
};

const PROGRAM_LABEL: Record<PlayerProgram, string> = {
  WANG_TOPPIDRETT:   "WANG Toppidrett",
  WANG_UNG:          "WANG Ung",
  GFGK_MINI:         "GFGK Mini",
  GFGK_BREDDE:       "GFGK Bredde",
  GFGK_JENTER:       "GFGK Jenter",
  GFGK_ELITE:        "GFGK Elite",
  AK_ACADEMY:        "AK Academy",
  AK_ACADEMY_JUNIOR: "AK Junior",
  PLATFORM_ONLY:     "Plattform",
};

// Alle gyldige program-verdier fra enum
const ALL_PROGRAMS: PlayerProgram[] = [
  "WANG_TOPPIDRETT", "WANG_UNG",
  "GFGK_MINI", "GFGK_BREDDE", "GFGK_JENTER", "GFGK_ELITE",
  "AK_ACADEMY", "AK_ACADEMY_JUNIOR",
  "PLATFORM_ONLY",
];

function deriveCategory(hcp: number | null): Category {
  if (hcp === null) return "D";
  if (hcp <= 4) return "A";
  if (hcp <= 10) return "B";
  if (hcp <= 18) return "C";
  return "D";
}

function deriveBoardStatus(p: RawPlayer): StatusKey {
  const naa = Date.now();
  const sistInne = p.lastLoginAt
    ? (naa - p.lastLoginAt.getTime()) / 86400000
    : Infinity;
  const aktivPlan = p.trainingPlans.some((tp) => tp.isActive);
  const sisteRunde = p.rounds[0]?.playedAt;
  const dagerSidenRunde = sisteRunde
    ? (naa - sisteRunde.getTime()) / 86400000
    : Infinity;

  if (sistInne > 30) return "Pause";
  if (!aktivPlan) return "Ny";
  if (dagerSidenRunde < 7) return "Fokus";
  return "Aktiv";
}

const KOLONNER: StatusKey[] = ["Ny", "Aktiv", "Fokus", "Pause"];

const STATUS_STRIPE: Record<StatusKey, string> = {
  Ny: "bg-primary/80",
  Aktiv: "bg-primary",
  Fokus: "bg-accent",
  Pause: "bg-muted-foreground",
};

const STATUS_PILL: Record<StatusKey, string> = {
  Ny: "bg-primary/10 text-primary",
  Aktiv: "bg-primary/12 text-primary",
  Fokus: "bg-accent/40 text-accent-foreground",
  Pause: "bg-secondary text-muted-foreground",
};

const STATUS_BESKRIVELSE: Record<StatusKey, string> = {
  Ny: "Ingen aktiv treningsplan",
  Aktiv: "Aktiv plan, ingen nylig runde",
  Fokus: "Aktiv plan + runde siste 7 dager",
  Pause: "Ingen pålogging på 30+ dager",
};

const CAT_STYLE: Record<Category, string> = {
  A: "bg-accent/30 text-accent-foreground",
  B: "bg-destructive/15 text-destructive",
  C: "bg-primary/15 text-primary",
  D: "bg-muted text-muted-foreground",
};

const TIER_STYLE: Record<Tier, string> = {
  GRATIS: "bg-secondary text-muted-foreground",
  PRO: "bg-primary/15 text-primary",
  ELITE: "bg-foreground text-accent",
};

const TIER_LABEL: Record<Tier, string> = {
  GRATIS: "Free",
  PRO: "Pro",
  ELITE: "Elite",
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatSidenDato(d: Date | null): string {
  if (!d) return "aldri";
  const ms = Date.now() - d.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min} min siden`;
  const t = Math.floor(min / 60);
  if (t < 24) {
    if (t < 6) return "i dag";
    return `for ${t} t siden`;
  }
  const dgr = Math.floor(t / 24);
  if (dgr === 1) return "i går";
  if (dgr < 7) return `for ${dgr} d siden`;
  const uker = Math.floor(dgr / 7);
  if (uker < 4) return `for ${uker} uker siden`;
  const mnd = Math.floor(dgr / 30);
  return `for ${mnd} mnd siden`;
}

function formatHcp(hcp: number | null): string {
  if (hcp === null) return "—";
  if (hcp <= 0) return `+${Math.abs(hcp).toFixed(1).replace(".", ",")}`;
  return hcp.toFixed(1).replace(".", ",");
}

export default async function SpillerePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  const view: View =
    params.view === "tabell" || params.view === "tavle"
      ? params.view
      : "kort";

  // Program-filter fra URL (?program=WANG_TOPPIDRETT)
  const programFilter =
    params.program && ALL_PROGRAMS.includes(params.program as PlayerProgram)
      ? (params.program as PlayerProgram)
      : undefined;

  // Where-klausul:
  // ADMIN ser alle spillere med minst én aktiv enrollering (unntatt PLATFORM_ONLY).
  // COACH ser kun spillere der coachId = coach.id og enrollering er aktiv.
  const isAdmin = coach.role === "ADMIN";

  const where = {
    role: "PLAYER" as const,
    deletedAt: null,
    enrollmentsAsPlayer: {
      some: {
        endedAt: null,
        // PLATFORM_ONLY er usynlig for coacher — kun de med ekte program
        NOT: { program: "PLATFORM_ONLY" as PlayerProgram },
        // Coach ser bare sine egne spillere; admin ser alle
        ...(isAdmin ? {} : { coachId: coach.id }),
        // Program-filter fra URL
        ...(programFilter ? { program: programFilter } : {}),
      },
    },
    // Fritekst-søk
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const orderBy =
    params.sort === "hcp-desc"
      ? ({ hcp: "desc" } as const)
      : params.sort === "hcp-asc"
        ? ({ hcp: "asc" } as const)
        : params.sort === "last-login"
          ? ({ lastLoginAt: "desc" } as const)
          : ({ name: "asc" } as const);

  const playersRaw = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      hcp: true,
      tier: true,
      lastLoginAt: true,
      trainingPlans: { select: { isActive: true } },
      rounds: {
        select: { playedAt: true, sgTotal: true, score: true },
        orderBy: { playedAt: "desc" },
        take: 9,
      },
      testResults: {
        select: { takenAt: true },
        orderBy: { takenAt: "desc" },
        take: 1,
      },
      groupMemberships: {
        select: { group: { select: { name: true } } },
        take: 1,
      },
      enrollmentsAsPlayer: {
        where: { endedAt: null },
        select: { program: true, coachId: true, endedAt: true },
      },
    },
    orderBy,
    take: 300,
  });

  const naa = new Date().getTime();
  const playersAll: EnrichedPlayer[] = playersRaw.map((p) => {
    const days = p.lastLoginAt
      ? Math.floor((naa - p.lastLoginAt.getTime()) / 86400000)
      : 999;
    const raw = p as RawPlayer;

    // 3-punkts SG-trend (eldst → nyest). Vi grupperer siste 9 runder
    // i 3 grupper à 3 og tar snitt — gir glattere sparkline.
    const sgValues = raw.rounds
      .map((r) => r.sgTotal)
      .filter((v): v is number => v != null);

    let trend: number[] = [];
    if (sgValues.length >= 3) {
      const reversed = [...sgValues].reverse(); // eldst først
      const chunks: number[][] = [[], [], []];
      reversed.forEach((v, i) => {
        const idx = Math.floor(i / Math.ceil(reversed.length / 3));
        if (idx < 3) chunks[idx].push(v);
      });
      trend = chunks
        .filter((c) => c.length > 0)
        .map((c) => c.reduce((a, b) => a + b, 0) / c.length);
    } else if (sgValues.length > 0) {
      trend = [...sgValues].reverse();
    }

    const sgAvg =
      sgValues.length > 0
        ? sgValues.reduce((a, b) => a + b, 0) / sgValues.length
        : null;

    const programLabels = raw.enrollmentsAsPlayer
      .filter((e) => e.endedAt === null && e.program !== "PLATFORM_ONLY")
      .map((e) => PROGRAM_LABEL[e.program]);

    return {
      ...raw,
      category: deriveCategory(p.hcp),
      boardStatus: deriveBoardStatus(raw),
      daysSinceLogin: days,
      sgTrend: trend,
      sgAvg,
      programLabels,
    };
  });

  // Status-filter (kun for tabell/kart)
  let players = playersAll;
  if (params.status === "uten-plan") {
    players = players.filter(
      (p) => !p.trainingPlans.some((tp) => tp.isActive),
    );
  } else if (params.status === "inaktiv") {
    players = players.filter((p) => p.daysSinceLogin > 30);
  } else if (params.status === "aktiv") {
    players = players.filter((p) => p.daysSinceLogin <= 7);
  }

  // KPI-tall
  const total = playersAll.length;
  const aktive = playersAll.filter((p) => p.daysSinceLogin <= 7).length;
  const proElite = playersAll.filter(
    (p) => p.tier === "PRO" || p.tier === "ELITE",
  ).length;
  const utenPlan = playersAll.filter(
    (p) => !p.trainingPlans.some((tp) => tp.isActive),
  ).length;

  // Snitt-HCP (eks null-verdier)
  const hcpVerdier = playersAll
    .map((p) => p.hcp)
    .filter((v): v is number => v != null);
  const snittHcp =
    hcpVerdier.length > 0
      ? hcpVerdier.reduce((a, b) => a + b, 0) / hcpVerdier.length
      : null;

  // Antall fullførte økter siste 7 dager (på tvers av alle spillere — ikke
  // i scope for denne query'en, så vi viser "økter denne uka" som proxy
  // via aktive-tallet for nå.)
  const okterDenneUka = aktive;

  // Board-grupper
  const grupper: Record<StatusKey, EnrichedPlayer[]> = {
    Ny: [],
    Aktiv: [],
    Fokus: [],
    Pause: [],
  };
  for (const p of playersAll) grupper[p.boardStatus].push(p);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`MIN STALL · ${aktive} AKTIVE SPILLERE`}
        titleLead="Stallen"
        titleItalic="min"
        sub={`${total} totalt · ${proElite} Pro · ${utenPlan} mangler aktiv plan`}
        actions={
          <Link
            href="/admin/elever/ny"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <UserPlus size={14} strokeWidth={1.75} />
            Ny spiller
          </Link>
        }
      />

      <ViewTabs active={view} />

      {/* Filter-rad */}
      <form className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <input type="hidden" name="view" value={view} />
        <label className="flex min-h-11 w-full items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-base text-muted-foreground sm:min-w-[280px] sm:flex-1 sm:text-[13px]">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Søk spiller eller e-post"
            className="flex-1 bg-transparent outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 placeholder:text-muted-foreground"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {/* Program-filter */}
          <select
            name="program"
            defaultValue={params.program ?? ""}
            className="rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-muted-foreground outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
          >
            <option value="">Alle program</option>
            {ALL_PROGRAMS.filter((p) => p !== "PLATFORM_ONLY").map((p) => (
              <option key={p} value={p}>
                {PROGRAM_LABEL[p]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-muted-foreground hover:text-foreground"
          >
            Filtrer
          </button>
        </div>
      </form>

      {/* Body — bytter på view */}
      {total === 0 ? (
        <EmptyState
          icon={Users}
          titleItalic="Ingen spillere"
          titleTrail="registrert ennå"
          sub="Legg til din første spiller for å komme i gang. Du kan invitere via e-post eller opprette manuelt."
          cta={
            <Link
              href="/admin/elever/ny"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <UserPlus size={16} strokeWidth={1.75} />
              Ny spiller
            </Link>
          }
        />
      ) : view === "tabell" ? (
        <TabellVisning players={players} orderBy={orderBy} total={total} />
      ) : view === "tavle" ? (
        <TavleVisning grupper={grupper} />
      ) : (
        <StallenGrid players={players} />
      )}

      {/* KPI-rad nederst */}
      {total > 0 && (
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          <KpiAccent
            label="Snitt-HCP"
            value={snittHcp != null ? formatHcp(snittHcp) : "—"}
            sub={`${hcpVerdier.length} av ${total} har registrert HCP`}
          />
          <Kpi
            label="Aktive økter denne uka"
            value={String(okterDenneUka)}
            sub={
              okterDenneUka > 0
                ? `${Math.round((okterDenneUka / total) * 100)} % av stallen`
                : "Ingen aktivitet"
            }
          />
          <Kpi
            label="I fokus"
            value={String(grupper.Fokus.length)}
            sub="Aktiv plan + runde siste 7d"
          />
          <Kpi
            label="Trenger plan"
            value={String(utenPlan)}
            sub={utenPlan > 0 ? "Krever oppfølging" : "Alt under kontroll"}
            tone={utenPlan > 0 ? "warn" : undefined}
          />
        </div>
      )}
    </div>
  );
}

// ---------- View-tabs ----------

function ViewTabs({ active }: { active: View }) {
  const tabs: { key: View; label: string; icon: typeof Table2 }[] = [
    { key: "kort", label: "Kort", icon: LayoutGrid },
    { key: "tabell", label: "Tabell", icon: Table2 },
    { key: "tavle", label: "Tavle", icon: Trophy },
  ];
  return (
    <div className="flex w-full gap-0.5 overflow-x-auto rounded-md bg-secondary p-1 sm:inline-flex sm:w-fit">
      {tabs.map((t) => {
        const Icon = t.icon;
        const erAktiv = active === t.key;
        return (
          <Link
            key={t.key}
            href={`/admin/spillere?view=${t.key}`}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-sm px-4 py-2 text-sm font-medium transition-colors sm:flex-initial ${
              erAktiv
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}

// ---------- Tabell ----------

function TabellVisning({
  players,
  orderBy,
  total,
}: {
  players: EnrichedPlayer[];
  orderBy: { name: "asc" } | { hcp: "asc" | "desc" } | { lastLoginAt: "desc" };
  total: number;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-4 py-2.5 font-mono text-[11px] text-muted-foreground">
        <span>
          Viser <b className="font-semibold text-foreground">{players.length}</b> av {total} spillere
        </span>
        <span className="text-foreground">
          Sortert: {"name" in orderBy
            ? "Navn ↑"
            : "hcp" in orderBy && orderBy.hcp === "desc"
              ? "HCP høy → lav"
              : "hcp" in orderBy
                ? "HCP lav → høy"
                : "Sist innlogget"}
        </span>
      </div>
      <table className="hidden w-full text-[13px] md:table">
        <thead className="border-b border-border bg-secondary/30 text-left">
          <tr>
            <Th className="w-10"></Th>
            <Th>Spiller</Th>
            <Th>Kat</Th>
            <Th>Tier</Th>
            <Th className="text-right">HCP</Th>
            <Th>Status</Th>
            <Th>Siste økt</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {players.map((p) => (
            <PlayerTableRow key={p.id} player={p} />
          ))}
        </tbody>
      </table>
      <ul className="divide-y divide-border md:hidden">
        {players.map((p) => (
          <PlayerMobileCard key={p.id} player={p} />
        ))}
      </ul>
    </div>
  );
}

function PlayerTableRow({ player }: { player: EnrichedPlayer }) {
  const p = player;
  const erInaktiv = p.daysSinceLogin > 30;
  const statusLabel =
    p.daysSinceLogin > 30 ? "Inaktiv" : p.daysSinceLogin > 7 ? "Forsinket" : "Aktiv";
  const statusStyle = erInaktiv
    ? { bg: "bg-destructive/15 text-destructive", dot: "bg-destructive" }
    : p.daysSinceLogin > 7
      ? { bg: "bg-accent/30 text-accent-foreground", dot: "bg-accent" }
      : { bg: "bg-primary/15 text-primary", dot: "bg-primary" };

  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-secondary/30">
      <td className="px-4 py-4">
        <span className="inline-block h-3.5 w-3.5 rounded-sm border border-border bg-card" />
      </td>
      <td className="px-4 py-4">
        <Link
          href={`/admin/spillere/${p.id}`}
          className="flex items-center gap-2.5 hover:text-primary"
        >
          <div
            className="grid h-8 w-8 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
            style={{ background: avatarBg(p.name) }}
          >
            {initials(p.name)}
          </div>
          <div className="leading-tight">
            <div className="font-medium text-foreground">{p.name}</div>
            <div className="font-mono text-[10px] text-muted-foreground">
              {p.email}
            </div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${CAT_STYLE[p.category]}`}
        >
          {p.category}
        </span>
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${TIER_STYLE[p.tier]}`}
        >
          {TIER_LABEL[p.tier]}
        </span>
      </td>
      <td className="px-4 py-4 text-right font-mono text-[13px] font-semibold tabular-nums">
        {formatHcp(p.hcp)}
      </td>
      <td className="px-4 py-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] ${statusStyle.bg}`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
          />
          {statusLabel}
        </span>
      </td>
      <td className="px-4 py-4">
        <span
          className={`font-mono text-[12px] ${erInaktiv ? "font-medium text-destructive" : "text-muted-foreground"}`}
        >
          {formatSidenDato(p.lastLoginAt)}
        </span>
      </td>
      <td className="px-4 py-4 text-right text-muted-foreground">⋯</td>
    </tr>
  );
}

function PlayerMobileCard({ player }: { player: EnrichedPlayer }) {
  const p = player;
  return (
    <li>
      <Link
        href={`/admin/spillere/${p.id}`}
        className="flex min-h-[68px] items-center gap-4 px-4 py-4 hover:bg-secondary/40 active:bg-secondary"
      >
        <div
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full font-mono text-[11px] font-semibold text-white"
          style={{ background: avatarBg(p.name) }}
        >
          {initials(p.name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="truncate font-medium text-foreground">{p.name}</div>
            <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-foreground">
              {formatHcp(p.hcp)}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${CAT_STYLE[p.category]}`}
            >
              {p.category}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${TIER_STYLE[p.tier]}`}
            >
              {TIER_LABEL[p.tier]}
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {formatSidenDato(p.lastLoginAt)}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

// ---------- Tavle ----------

function TavleVisning({
  grupper,
}: {
  grupper: Record<StatusKey, EnrichedPlayer[]>;
}) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-4 font-mono text-[11px] text-muted-foreground">
        {KOLONNER.map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-sm ${STATUS_STRIPE[k]}`}
            />
            {k}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {KOLONNER.map((status) => (
          <section
            key={status}
            aria-label={`${status}-spillere`}
            className="flex flex-col gap-4 rounded-lg border border-border bg-card/40 p-4"
          >
            <header className="flex items-baseline justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="font-display text-base font-semibold tracking-tight">
                  {status}
                </h2>
                <span
                  className={`inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${STATUS_PILL[status]}`}
                >
                  {grupper[status].length}
                </span>
              </div>
            </header>
            <p className="font-mono text-[10px] uppercase tracking-[0.04em] text-muted-foreground">
              {STATUS_BESKRIVELSE[status]}
            </p>

            {grupper[status].length === 0 ? (
              <div className="grid place-items-center rounded-md border border-dashed border-border bg-card/40 px-4 py-8 text-center font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
                Tom
              </div>
            ) : (
              <ul className="space-y-2">
                {grupper[status].map((p) => (
                  <li
                    key={p.id}
                    className="overflow-hidden rounded-md border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
                  >
                    <Link
                      href={`/admin/spillere/${p.id}`}
                      className="flex"
                      aria-label={`Åpne profil for ${p.name}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`w-1.5 flex-shrink-0 ${STATUS_STRIPE[status]}`}
                      />
                      <div className="flex-1 p-4">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                          {p.hcp != null && (
                            <span>HCP {formatHcp(p.hcp)}</span>
                          )}
                          {p.hcp != null && <span>·</span>}
                          <span>{p.tier}</span>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </>
  );
}

// ---------- Stallen-grid (kort som default) ----------

function StallenGrid({ players }: { players: EnrichedPlayer[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {players.map((p) => (
        <SpillerKort key={p.id} player={p} />
      ))}
    </div>
  );
}

function SpillerKort({ player }: { player: EnrichedPlayer }) {
  const p = player;
  const statusInfo =
    p.daysSinceLogin > 30
      ? { dot: "bg-destructive", label: "Inaktiv", labelClass: "text-destructive" }
      : p.daysSinceLogin > 7
        ? { dot: "bg-accent", label: "Forsinket", labelClass: "text-accent-foreground" }
        : { dot: "bg-primary", label: "Aktiv", labelClass: "text-primary" };

  const sistAktivLabel =
    p.lastLoginAt == null
      ? "Aldri pålogget"
      : p.daysSinceLogin === 0
        ? "Aktiv i dag"
        : p.daysSinceLogin === 1
          ? "Sist aktiv: i går"
          : `Sist aktiv: ${p.daysSinceLogin} dager siden`;

  return (
    <Link
      href={`/admin/spillere/${p.id}`}
      className="group relative flex flex-col gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
    >
      {/* Status-prikk øverst høyre */}
      <span
        aria-label={statusInfo.label}
        className={`absolute right-4 top-4 inline-block h-2 w-2 rounded-full ${statusInfo.dot}`}
      />

      <div className="flex items-center gap-3">
        <Avatar src={p.avatarUrl} name={p.name} />
        <div className="min-w-0 flex-1 pr-4">
          <div className="truncate font-display text-[15px] font-semibold leading-snug text-foreground group-hover:text-primary">
            {p.name}
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {p.programLabels.length > 0 ? (
              p.programLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-sm bg-secondary px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                >
                  {label}
                </span>
              ))
            ) : (
              <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {p.groupMemberships[0]?.group.name ?? "Ingen gruppe"}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-border pt-3.5">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
            HCP
          </div>
          <div className="mt-0.5 font-mono text-[22px] font-semibold leading-none tabular-nums text-foreground">
            {formatHcp(p.hcp)}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${CAT_STYLE[p.category]}`}
          >
            {p.category}
          </span>
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] ${TIER_STYLE[p.tier]}`}
          >
            {TIER_LABEL[p.tier]}
          </span>
        </div>

        <Sparkline values={p.sgTrend} />
      </div>

      <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.06em]">
        <span className={`${statusInfo.labelClass}`}>{statusInfo.label}</span>
        <span className="text-muted-foreground">{sistAktivLabel}</span>
      </div>
    </Link>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full object-cover"
      />
    );
  }
  return (
    <div
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-mono text-[12px] font-semibold text-white"
      style={{ background: avatarBg(name) }}
    >
      {initials(name)}
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return (
      <div className="flex h-8 items-center justify-end font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">
        Lite SG-data
      </div>
    );
  }

  const w = 56;
  const h = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const last = values[values.length - 1];
  const first = values[0];
  const trendUp = last >= first;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="shrink-0"
      aria-label="SG-trend siste runder"
    >
      <polyline
        fill="none"
        stroke={trendUp ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={pts}
      />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - ((v - min) / range) * h;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={1.5}
            fill={trendUp ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
          />
        );
      })}
    </svg>
  );
}

// ---------- Subkomponenter ----------

function Th({
  children,
  className = "",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`px-4 py-4 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function KpiAccent({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-foreground to-foreground/90 p-4 text-background">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-accent/70">
        {label}
      </div>
      <div className="font-mono text-[28px] font-semibold leading-none tabular-nums text-background">
        {value}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-background/70">{sub}</div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  unit,
  sub,
  tone,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  tone?: "warn" | "bad";
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-mono text-[28px] font-semibold leading-none tabular-nums ${
          tone === "warn"
            ? "text-accent-foreground"
            : tone === "bad"
              ? "text-destructive"
              : "text-foreground"
        }`}
      >
        {value}
        {unit && (
          <span className="ml-1 text-[13px] font-medium text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <div className="font-mono text-[11px] text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

// FilterChip — beholdt for fremtidige filter-knapper (status, kategori)
// function FilterChip({ label }: { label: string }) { ... }

