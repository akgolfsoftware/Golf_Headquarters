/**
 * CoachHQ / AgencyOS — Stallen (spilleroversikt).
 *
 * Default view ("tabell") er den pixel-portede AgencyOS-spillertabellen
 * (public/design-handover/agencyos/components-agency-player-table.html):
 * sortbar, filtrerbar, multi-select med batch-bar, SG-sparkline + pyramide-
 * adherence per spiller. Server-data via loadStallen (ekte Prisma).
 *
 * Alternative views (eksisterende funksjonalitet, beholdt):
 *   ?view=kort   → rike spillerkort (grid)
 *   ?view=tavle  → kanban-tavle (auto-klassifisert etter aktivitet)
 *
 * Klikk på rad/kort → /admin/spillere/[id] (coach detail-view).
 */

import Link from "next/link";
import { LayoutGrid, Search, Table2, Trophy, UserPlus, Users } from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { avatarBg } from "@/lib/avatar-colors";
import type { PlayerProgram } from "@/generated/prisma/client";
import { Sparkline } from "@/components/athletic";
import { EmptyState } from "@/components/shared/empty-state";
import { SpillerListe } from "@/components/admin/spillere/spiller-liste";
import { mapStallenData } from "./spiller-liste-map";
import { loadStallen } from "@/lib/admin/stallen-data";

export const dynamic = "force-dynamic";

type View = "tabell" | "kort" | "tavle";

type SearchParams = {
  view?: string;
  tier?: string;
  status?: string;
  q?: string;
  sort?: string;
  dir?: string;
  program?: string;
  group?: string;
};

type Category = "A" | "B" | "C" | "D";
type StatusKey = "Ny" | "Aktiv" | "Fokus" | "Pause";
type Tier = "GRATIS" | "PRO" | "ELITE";

export default async function SpillerePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const coach = await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  const view: View =
    params.view === "kort" || params.view === "tavle" ? params.view : "tabell";

  return (
    <div className="space-y-4">
      <ViewTabs active={view} />

      {view === "tabell" ? (
        <TabellView coach={coach} params={params} />
      ) : view === "kort" ? (
        <KortOgTavleView coach={coach} params={params} view="kort" />
      ) : (
        <KortOgTavleView coach={coach} params={params} view="tavle" />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════
//  TABELL — pixel-port av AgencyOS spillertabell
// ════════════════════════════════════════════════════════════════
async function TabellView({
  coach,
  params,
}: {
  coach: { id: string; role: string };
  params: SearchParams;
}) {
  const data = await loadStallen(
    { id: coach.id, role: coach.role },
    { q: params.q, group: params.group, sort: params.sort, dir: params.dir },
  );

  return <SpillerListe data={mapStallenData(data)} />;
}

// ── View-tabs ────────────────────────────────────────────────────
function ViewTabs({ active }: { active: View }) {
  const tabs: { key: View; label: string; icon: typeof Table2 }[] = [
    { key: "tabell", label: "Tabell", icon: Table2 },
    { key: "kort", label: "Kort", icon: LayoutGrid },
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

// ════════════════════════════════════════════════════════════════
//  KORT + TAVLE — eksisterende funksjonalitet (beholdt)
// ════════════════════════════════════════════════════════════════
const PROGRAM_LABEL: Record<PlayerProgram, string> = {
  WANG_TOPPIDRETT: "WANG Toppidrett",
  WANG_UNG: "WANG Ung",
  GFGK_MINI: "GFGK Mini",
  GFGK_BREDDE: "GFGK Bredde",
  GFGK_JENTER: "GFGK Jenter",
  GFGK_ELITE: "GFGK Elite",
  AK_ACADEMY: "AK Academy",
  AK_ACADEMY_JUNIOR: "AK Junior",
  PLATFORM_ONLY: "Plattform",
};

const ALL_PROGRAMS: PlayerProgram[] = [
  "WANG_TOPPIDRETT", "WANG_UNG",
  "GFGK_MINI", "GFGK_BREDDE", "GFGK_JENTER", "GFGK_ELITE",
  "AK_ACADEMY", "AK_ACADEMY_JUNIOR",
  "PLATFORM_ONLY",
];

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

function deriveCategory(hcp: number | null): Category {
  if (hcp === null) return "D";
  if (hcp <= 4) return "A";
  if (hcp <= 10) return "B";
  if (hcp <= 18) return "C";
  return "D";
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatHcp(hcp: number | null): string {
  if (hcp === null) return "—";
  if (hcp <= 0) return `+${Math.abs(hcp).toFixed(1).replace(".", ",")}`;
  return hcp.toFixed(1).replace(".", ",");
}

type EnrichedPlayer = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  hcp: number | null;
  tier: Tier;
  lastLoginAt: Date | null;
  trainingPlans: { isActive: boolean }[];
  groupMemberships: { group: { name: string } }[];
  category: Category;
  boardStatus: StatusKey;
  daysSinceLogin: number;
  sgTrend: number[];
  programLabels: string[];
};

async function KortOgTavleView({
  coach,
  params,
  view,
}: {
  coach: { id: string; role: string };
  params: SearchParams;
  view: "kort" | "tavle";
}) {
  const isAdmin = coach.role === "ADMIN";
  const programFilter =
    params.program && ALL_PROGRAMS.includes(params.program as PlayerProgram)
      ? (params.program as PlayerProgram)
      : undefined;

  const where = {
    role: "PLAYER" as const,
    deletedAt: null,
    enrollmentsAsPlayer: {
      some: {
        endedAt: null,
        NOT: { program: "PLATFORM_ONLY" as PlayerProgram },
        ...(isAdmin ? {} : { coachId: coach.id }),
        ...(programFilter ? { program: programFilter } : {}),
      },
    },
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

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
      groupMemberships: {
        select: { group: { select: { name: true } } },
        take: 1,
      },
      enrollmentsAsPlayer: {
        where: { endedAt: null },
        select: { program: true, coachId: true, endedAt: true },
      },
    },
    orderBy: { name: "asc" },
    take: 300,
  });

  const naa = new Date().getTime();
  const playersAll: EnrichedPlayer[] = playersRaw.map((p) => {
    const days = p.lastLoginAt
      ? Math.floor((naa - p.lastLoginAt.getTime()) / 86400000)
      : 999;

    const sgValues = p.rounds
      .map((r) => r.sgTotal)
      .filter((v): v is number => v != null);

    let trend: number[] = [];
    if (sgValues.length >= 3) {
      const reversed = [...sgValues].reverse();
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

    const aktivPlan = p.trainingPlans.some((tp) => tp.isActive);
    const sisteRunde = p.rounds[0]?.playedAt;
    const dagerSidenRunde = sisteRunde
      ? (naa - sisteRunde.getTime()) / 86400000
      : Infinity;
    let boardStatus: StatusKey;
    if (days > 30) boardStatus = "Pause";
    else if (!aktivPlan) boardStatus = "Ny";
    else if (dagerSidenRunde < 7) boardStatus = "Fokus";
    else boardStatus = "Aktiv";

    const programLabels = p.enrollmentsAsPlayer
      .filter((e) => e.endedAt === null && e.program !== "PLATFORM_ONLY")
      .map((e) => PROGRAM_LABEL[e.program]);

    return {
      id: p.id,
      name: p.name,
      email: p.email,
      avatarUrl: p.avatarUrl,
      hcp: p.hcp,
      tier: p.tier as Tier,
      lastLoginAt: p.lastLoginAt,
      trainingPlans: p.trainingPlans,
      groupMemberships: p.groupMemberships,
      category: deriveCategory(p.hcp),
      boardStatus,
      daysSinceLogin: days,
      sgTrend: trend,
      programLabels,
    };
  });

  const total = playersAll.length;

  if (total === 0) {
    return (
      <EmptyState
        icon={Users}
        titleItalic="Ingen spillere"
        titleTrail="registrert ennå"
        sub="Legg til din første spiller for å komme i gang. Du kan invitere via e-post eller opprette manuelt."
        cta={
          <Link
            href="/admin/spillere/ny"
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <UserPlus size={16} strokeWidth={1.75} />
            Ny spiller
          </Link>
        }
      />
    );
  }

  const grupper: Record<StatusKey, EnrichedPlayer[]> = {
    Ny: [],
    Aktiv: [],
    Fokus: [],
    Pause: [],
  };
  for (const p of playersAll) grupper[p.boardStatus].push(p);

  return (
    <div className="space-y-4">
      {/* Filter-rad (kun kort) */}
      {view === "kort" && (
        <form className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <input type="hidden" name="view" value="kort" />
          <label className="flex min-h-11 w-full items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-base text-muted-foreground sm:min-w-[280px] sm:flex-1 sm:text-[13px]">
            <Search size={14} strokeWidth={1.75} />
            <input
              type="search"
              name="q"
              defaultValue={params.q ?? ""}
              placeholder="Søk spiller eller e-post"
              className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <select
              name="program"
              defaultValue={params.program ?? ""}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-muted-foreground outline-none"
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
      )}

      {view === "tavle" ? (
        <TavleVisning grupper={grupper} />
      ) : (
        <StallenGrid players={playersAll} />
      )}
    </div>
  );
}

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
            <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-sm ${STATUS_STRIPE[k]}`} />
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
                <h2 className="font-display text-base font-semibold tracking-tight">{status}</h2>
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
                      <span aria-hidden="true" className={`w-1.5 flex-shrink-0 ${STATUS_STRIPE[status]}`} />
                      <div className="flex-1 p-4">
                        <div className="font-medium text-foreground">{p.name}</div>
                        <div className="mt-1 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                          {p.hcp != null && <span>HCP {formatHcp(p.hcp)}</span>}
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

function StallenGrid({ players }: { players: EnrichedPlayer[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {players.map((p) => (
        <SpillerKort key={p.id} player={p} />
      ))}
    </div>
  );
}

function SpillerKort({ player: p }: { player: EnrichedPlayer }) {
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
      <span
        aria-label={statusInfo.label}
        className={`absolute right-4 top-4 inline-block h-2 w-2 rounded-full ${statusInfo.dot}`}
      />

      <div className="flex items-center gap-2">
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

      <div className="flex items-end justify-between gap-2 border-t border-border pt-4">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">HCP</div>
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

        <Sparkline
          values={p.sgTrend}
          color={
            p.sgTrend.length >= 2 && p.sgTrend[p.sgTrend.length - 1] >= p.sgTrend[0]
              ? "hsl(var(--primary))"
              : "hsl(var(--destructive))"
          }
        />
      </div>

      <div className="flex items-center justify-between gap-2 font-mono text-[10px] uppercase tracking-[0.06em]">
        <span className={statusInfo.labelClass}>{statusInfo.label}</span>
        <span className="text-muted-foreground">{sistAktivLabel}</span>
      </div>
    </Link>
  );
}

function Avatar({ src, name }: { src: string | null; name: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
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
