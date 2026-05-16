/**
 * CoachHQ — Spillere (konsolidert)
 *
 * Erstatter de tidligere separat-rutene /admin/elever (tabell) og /admin/board
 * (tavle). Tab-toggle øverst styrer hvilken visning som rendres:
 *
 *   ?view=tabell  → spillerliste-tabell (status, HCP, tier, kategori)
 *   ?view=tavle   → kanban-tavle (auto-klassifisert etter aktivitet)
 *   ?view=kart    → kort-grid (kompakt oversikt med foto/initialer)
 *
 * Felles filter-bar øverst: søk, kategori, tier, status.
 *
 * NB: Spiller-detalj-rutene under /admin/elever/[id]/... beholdes uendret —
 * de er fortsatt kanonisk inngang til spillerprofiler. Kun listevisningen
 * konsolideres her.
 */

import Link from "next/link";
import {
  ChevronDown,
  LayoutGrid,
  Map as MapIcon,
  Search,
  Table2,
  UserPlus,
  Users,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { avatarBg } from "@/lib/avatar-colors";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

type View = "tabell" | "tavle" | "kart";

type SearchParams = {
  view?: string;
  tier?: string;
  status?: string;
  q?: string;
  sort?: string;
};

type Tier = "GRATIS" | "PRO" | "ELITE";

type Category = "A" | "B" | "C" | "D";

type StatusKey = "Ny" | "Aktiv" | "Fokus" | "Pause";

type RawPlayer = {
  id: string;
  name: string;
  email: string;
  hcp: number | null;
  tier: Tier;
  lastLoginAt: Date | null;
  trainingPlans: { isActive: boolean }[];
  rounds: { playedAt: Date }[];
  testResults: { takenAt: Date }[];
  groupMemberships: { group: { name: string } }[];
};

type EnrichedPlayer = RawPlayer & {
  category: Category;
  boardStatus: StatusKey;
  daysSinceLogin: number;
};

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
  await requirePortalUser({ allow: ["COACH", "ADMIN"] });
  const params = await searchParams;

  const view: View =
    params.view === "tavle" || params.view === "kart" ? params.view : "tabell";

  // Felles where-klausul
  const where: {
    role: "PLAYER";
    tier?: Tier;
    OR?: {
      name?: { contains: string; mode: "insensitive" };
      email?: { contains: string; mode: "insensitive" };
    }[];
  } = { role: "PLAYER" };

  if (params.tier === "GRATIS" || params.tier === "PRO" || params.tier === "ELITE") {
    where.tier = params.tier;
  }
  if (params.q) {
    where.OR = [
      { name: { contains: params.q, mode: "insensitive" } },
      { email: { contains: params.q, mode: "insensitive" } },
    ];
  }

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
      hcp: true,
      tier: true,
      lastLoginAt: true,
      trainingPlans: { select: { isActive: true } },
      rounds: {
        select: { playedAt: true },
        orderBy: { playedAt: "desc" },
        take: 1,
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
    },
    orderBy,
    take: 300,
  });

  const naa = Date.now();
  const playersAll: EnrichedPlayer[] = playersRaw.map((p) => {
    const days = p.lastLoginAt
      ? Math.floor((naa - p.lastLoginAt.getTime()) / 86400000)
      : 999;
    return {
      ...(p as RawPlayer),
      category: deriveCategory(p.hcp),
      boardStatus: deriveBoardStatus(p as RawPlayer),
      daysSinceLogin: days,
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
  const inaktive = playersAll.filter((p) => p.daysSinceLogin > 30).length;
  const proElite = playersAll.filter(
    (p) => p.tier === "PRO" || p.tier === "ELITE",
  ).length;

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
        eyebrow="CoachHQ · /admin/spillere"
        titleLead={String(total)}
        titleItalic="spillere"
        sub={`AK Golf · ${proElite} Pro/Elite · ${aktive} aktive denne uka`}
        actions={
          <Link
            href="/admin/elever/ny"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <UserPlus size={14} strokeWidth={1.75} />
            Ny spiller
          </Link>
        }
      />

      <ViewTabs active={view} />

      {/* KPI-strip */}
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <KpiAccent
          label="Totalt"
          value={String(total)}
          sub={total > 0 ? `${aktive} aktive denne uka` : "Ingen spillere"}
        />
        <Kpi
          label="Pro + Elite"
          value={String(proElite)}
          unit={`/ ${total}`}
          sub={
            total > 0
              ? `${Math.round((proElite / total) * 100)} % betalende`
              : "—"
          }
        />
        <Kpi
          label="I fokus"
          value={String(grupper.Fokus.length)}
          sub="aktiv plan + runde siste 7d"
        />
        <Kpi
          label="Inaktive > 30 d"
          value={String(inaktive)}
          sub={inaktive > 0 ? "Krever oppfølging" : "Alt under kontroll"}
          tone={inaktive > 0 ? "warn" : undefined}
        />
      </div>

      {/* Filter-rad */}
      <form className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="view" value={view} />
        <label className="flex flex-1 min-w-[280px] items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.75} />
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Søk spiller, e-post eller HCP"
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </label>
        <FilterChip label="Kategori" />
        <FilterChip label="Tier" />
        <FilterChip label="Status" />
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
        <KartVisning players={players} />
      )}
    </div>
  );
}

// ---------- View-tabs ----------

function ViewTabs({ active }: { active: View }) {
  const tabs: { key: View; label: string; icon: typeof Table2 }[] = [
    { key: "tabell", label: "Tabell", icon: Table2 },
    { key: "tavle", label: "Tavle", icon: LayoutGrid },
    { key: "kart", label: "Kart", icon: MapIcon },
  ];
  return (
    <div className="inline-flex w-fit gap-0.5 rounded-md bg-secondary p-1">
      {tabs.map((t) => {
        const Icon = t.icon;
        const erAktiv = active === t.key;
        return (
          <Link
            key={t.key}
            href={`/admin/spillere?view=${t.key}`}
            className={`inline-flex items-center gap-1.5 rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
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
      <table className="hidden w-full text-[13px] sm:table">
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
      <ul className="divide-y divide-border sm:hidden">
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
          href={`/admin/elever/${p.id}`}
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
        href={`/admin/elever/${p.id}`}
        className="flex min-h-16 items-center gap-4 px-4 py-4 hover:bg-secondary/40"
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
                      href={`/admin/elever/${p.id}`}
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

// ---------- Kart (card-grid) ----------

function KartVisning({ players }: { players: EnrichedPlayer[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {players.map((p) => (
        <Link
          key={p.id}
          href={`/admin/elever/${p.id}`}
          className="group flex flex-col gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div
              className="grid h-12 w-12 shrink-0 place-items-center rounded-full font-mono text-sm font-semibold text-white"
              style={{ background: avatarBg(p.name) }}
            >
              {initials(p.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-sm font-semibold text-foreground group-hover:text-primary">
                {p.name}
              </div>
              <div className="mt-0.5 truncate font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                {p.groupMemberships[0]?.group.name ?? "Ingen gruppe"}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 border-t border-border pt-4">
            <Stat label="HCP" value={formatHcp(p.hcp)} />
            <Stat label="Kat" value={p.category} />
            <Stat label="Tier" value={TIER_LABEL[p.tier]} />
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
            Sist innlogget: {formatSidenDato(p.lastLoginAt)}
          </div>
        </Link>
      ))}
    </div>
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

function FilterChip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-[12px] text-muted-foreground">
      {label}
      <ChevronDown size={11} strokeWidth={1.75} />
    </span>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-sm font-semibold tabular-nums">
        {value}
      </div>
    </div>
  );
}

