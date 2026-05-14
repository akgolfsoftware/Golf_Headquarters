/**
 * PlayerHQ · Mål · Leaderboard
 *
 * Endelig design fra wireframe/design-files-v2/playerhq-A/03-mal-leaderboard.html.
 * Datakilde: User (Pro-spillere) + Round (siste 30 dager). Rangerer etter
 * snitt SG-total. Badges, økt-volum og delta-rang er plassholdere inntil
 * vi har streak/session-tracking på plass. Plassholdere markert med // TODO.
 */

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Flame,
  Lock,
  Search,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";

import { requirePortalUser } from "@/lib/auth/requirePortalUser";
import { prisma } from "@/lib/prisma";
import { avatarBg } from "@/lib/avatar-colors";
import { FEATURES } from "@/lib/features";

type Tab = "venner" | "klubb" | "globalt";

type Rad = {
  id: string;
  rank: number;
  name: string;
  sub: string;
  initials: string;
  avatarBg: string;
  hcp: string;
  sg: number | null;
  sessions: number;
  sessionsPct: number;
  me: boolean;
  medal?: "gold" | "silver" | "bronze";
};

function initialer(navn: string) {
  return navn
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  if (!FEATURES.LEADERBOARD) notFound();

  const user = await requirePortalUser();
  const sp = await searchParams;
  const tab: Tab = sp?.tab === "venner" || sp?.tab === "globalt" ? sp.tab : "klubb";

  const tretti = new Date();
  tretti.setDate(tretti.getDate() - 30);

  const proBrukere = await prisma.user.findMany({
    where: { tier: "PRO", role: "PLAYER" },
    select: {
      id: true,
      name: true,
      hcp: true,
      homeClub: true,
      rounds: {
        where: { playedAt: { gte: tretti }, sgTotal: { not: null } },
        select: { sgTotal: true },
      },
    },
  });

  const rangering: Rad[] = proBrukere
    .map((b) => {
      const sg = b.rounds.length
        ? b.rounds.reduce((s, r) => s + (r.sgTotal ?? 0), 0) / b.rounds.length
        : null;
      return {
        id: b.id,
        rank: 0,
        name: b.name,
        sub: `${b.homeClub ?? "—"} · Pro`,
        initials: initialer(b.name),
        avatarBg: avatarBg(b.name),
        hcp:
          b.hcp != null
            ? (b.hcp >= 0 ? "+" : "") + b.hcp.toFixed(1).replace(".", ",")
            : "—",
        sg,
        // TODO: hent økt-volum fra TrainingPlanSession-logg
        sessions: b.rounds.length,
        sessionsPct: Math.min(100, b.rounds.length * 14),
        me: b.id === user.id,
      };
    })
    .filter((r) => r.sg != null)
    .sort((a, b) => (b.sg ?? -99) - (a.sg ?? -99))
    .slice(0, 25)
    .map((r, i) => ({
      ...r,
      rank: i + 1,
      medal:
        i === 0 ? ("gold" as const) : i === 1 ? ("silver" as const) : i === 2 ? ("bronze" as const) : undefined,
    }));

  const meg = rangering.find((r) => r.me);
  const fornavn = user.name.split(" ")[0];
  const total = rangering.length;
  const minRank = meg?.rank ?? null;

  return (
    <div className="space-y-6">
      <Head fornavn={fornavn} minRank={minRank} total={total} tab={tab} />
      {meg && <YourRank meg={meg} fornavn={user.name} hcp={meg.hcp} total={total} />}
      <Filters />
      {rangering.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <Trophy className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-4 font-display text-base font-semibold text-foreground">
            Ingen rangering ennå
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Når flere Pro-brukere har registrert SG-data dukker rangeringen opp her.
          </p>
        </div>
      ) : (
        <>
          <Table rows={rangering} />
          <Pagination total={total} vist={rangering.length} />
        </>
      )}
    </div>
  );
}

function Head({
  fornavn,
  minRank,
  total,
  tab,
}: {
  fornavn: string;
  minRank: number | null;
  total: number;
  tab: Tab;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Mål · Leaderboard · siste 30 dager
        </div>
        <h1 className="mt-2 font-display text-4xl italic leading-[1.1] tracking-tight">
          <em className="font-medium italic">
            {minRank != null
              ? `#${minRank} av ${total} i klubben, ${fornavn}.`
              : `Hvordan står du, ${fornavn}?`}
          </em>
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Pro · siste 30 dager</span>
          <Dot />
          {/* TODO: ukentlig delta fra forrige snapshot */}
          <span>Neste oppdatering søndag 23:59</span>
        </div>
      </div>
      <div className="flex gap-1 border-b border-border">
        {(
          [
            { key: "venner", name: "Venner" },
            { key: "klubb", name: "Klubb" },
            { key: "globalt", name: "Globalt", pro: true },
          ] as { key: Tab; name: string; pro?: boolean }[]
        ).map((t) => {
          const active = t.key === tab;
          return (
            <Link
              key={t.key}
              href={`/portal/mal/leaderboard?tab=${t.key}`}
              className={`relative inline-flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.name}
              {t.pro && <Lock className="h-4 w-4 text-muted-foreground" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function YourRank({
  meg,
  fornavn,
  hcp,
  total,
}: {
  meg: Rad;
  fornavn: string;
  hcp: string;
  total: number;
}) {
  return (
    <div
      className="relative grid grid-cols-[auto_auto_1fr_auto] items-center gap-6 overflow-hidden rounded-lg px-8 py-6 text-card"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--foreground)) 0%, hsl(var(--card)) 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-56"
        style={{
          background:
            "radial-gradient(circle at 80% 50%, rgba(209,248,67,0.18), transparent 60%)",
        }}
      />
      <div className="relative z-10 font-mono text-3xl sm:text-5xl md:text-6xl font-medium leading-none tracking-tight text-accent">
        #{meg.rank}
        <span className="ml-2 text-2xl font-normal text-card/40">/ {total}</span>
      </div>
      <div className="relative z-10 grid h-16 w-16 place-items-center rounded-full border-2 border-card bg-accent font-display text-xl font-bold text-accent-foreground">
        {meg.initials}
      </div>
      <div className="relative z-10">
        <strong className="block font-display text-lg font-semibold">
          {fornavn}
        </strong>
        <span className="font-mono text-xs text-card/60">
          HCP {hcp} · {meg.sub}
        </span>
      </div>
      <div className="relative z-10 flex gap-6">
        {/* TODO: delta vs forrige uke */}
        <RankDelta label="Snitt SG" value={fmtSg(meg.sg)} tone="up" />
        <RankDelta label="Runder" value={String(meg.sessions)} />
      </div>
    </div>
  );
}

function fmtSg(sg: number | null) {
  if (sg == null) return "—";
  return (sg >= 0 ? "+" : "") + sg.toFixed(1).replace(".", ",");
}

function RankDelta({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up";
}) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-card/50">
        {label}
      </span>
      <strong
        className={`mt-1 font-mono text-lg font-medium leading-none ${
          tone === "up" ? "text-accent" : "text-card"
        }`}
      >
        {value}
      </strong>
    </div>
  );
}

function Filters() {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-card px-4 py-4">
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Periode
      </span>
      <Chip active>30 dager</Chip>
      <Chip>Sesong</Chip>
      <div className="h-4 w-px bg-border" />
      <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        Metric
      </span>
      <Chip active>Snitt SG</Chip>
      <Chip>Runder</Chip>
      <div className="h-4 w-px bg-border" />
      <div className="inline-flex max-w-[200px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-4 py-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Søk spiller …"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}

function Chip({
  active,
  children,
}: {
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={!active}
      title={active ? undefined : "Kommer i v2"}
      className={`rounded-full px-4 py-1 text-xs font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-muted-foreground opacity-60"
      }`}
    >
      {children}
    </button>
  );
}

function Table({ rows }: { rows: Rad[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="grid items-center gap-4 border-b border-border bg-secondary px-6 py-4 text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground"
        style={{ gridTemplateColumns: "56px 1.6fr 70px 100px 80px 130px 50px" }}
      >
        <div className="inline-flex cursor-pointer items-center gap-1 text-foreground">
          Rang
          <ChevronDown className="h-3 w-3" />
        </div>
        <div>Spiller</div>
        <div>HCP</div>
        <div>Snitt SG</div>
        <div>Runder</div>
        <div>Badges</div>
        <div />
      </div>
      {rows.map((r) => (
        <RowEl key={r.id} r={r} />
      ))}
    </div>
  );
}

function RowEl({ r }: { r: Rad }) {
  const medalColor =
    r.medal === "gold"
      ? "text-primary"
      : r.medal === "silver"
        ? "text-muted-foreground"
        : r.medal === "bronze"
          ? "text-accent-foreground"
          : "";
  return (
    <div
      className={`relative grid cursor-pointer items-center gap-4 border-b border-border px-6 py-4 transition-colors last:border-b-0 ${
        r.me ? "bg-accent/20 hover:bg-accent/30" : "hover:bg-secondary"
      }`}
      style={{ gridTemplateColumns: "56px 1.6fr 70px 100px 80px 130px 50px" }}
    >
      {r.me && <span className="absolute bottom-0 left-0 top-0 w-1 bg-accent" />}
      <div className="inline-flex items-center gap-2 font-mono text-lg font-medium tabular-nums text-foreground">
        {r.rank}
        {r.medal && (
          <Trophy className={`h-5 w-5 ${medalColor}`} strokeWidth={1.5} />
        )}
      </div>
      <div className="flex min-w-0 items-center gap-4">
        <div
          className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full font-display text-sm font-semibold text-card"
          style={{ background: r.avatarBg }}
        >
          {r.initials}
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-sm font-semibold text-foreground">
            {r.name}
            {r.me && (
              <span className="ml-2 inline-block rounded-full bg-accent px-2 py-0.5 align-middle font-mono text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                Deg
              </span>
            )}
          </strong>
          <span className="font-mono text-xs text-muted-foreground">
            {r.sub}
          </span>
        </div>
      </div>
      <div className="font-mono text-sm tabular-nums text-foreground">{r.hcp}</div>
      <div
        className={`font-mono text-sm font-medium tabular-nums ${
          (r.sg ?? 0) >= 0 ? "text-primary" : "text-destructive"
        }`}
      >
        {fmtSg(r.sg)}
      </div>
      <div className="flex items-center gap-2 font-mono text-sm tabular-nums">
        {r.sessions}
        <div className="h-1 max-w-[50px] flex-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${r.sessionsPct}%` }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        {/* TODO: badges fra Achievement-tabellen */}
        <Badge type="streak" />
        <Badge type="test" />
        <Badge type="momentum" />
      </div>
      <Link
        href={`/portal/coach/${r.id}`}
        aria-label={`Vis ${r.name}`}
        className="grid h-8 w-8 place-items-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function Badge({ type }: { type: "streak" | "test" | "momentum" }) {
  const styles = {
    streak: {
      icon: <Flame className="h-3 w-3" strokeWidth={1.75} />,
      cls: "bg-accent/40 text-accent-foreground",
    },
    test: {
      icon: <Target className="h-3 w-3" strokeWidth={1.75} />,
      cls: "bg-primary/10 text-primary",
    },
    momentum: {
      icon: <TrendingUp className="h-3 w-3" strokeWidth={1.75} />,
      cls: "bg-secondary text-foreground",
    },
  };
  return (
    <div className={`grid h-6 w-6 place-items-center rounded-sm ${styles[type].cls}`}>
      {styles[type].icon}
    </div>
  );
}

function Pagination({ total, vist }: { total: number; vist: number }) {
  return (
    <div className="flex items-center justify-between px-2 py-4 text-xs text-muted-foreground">
      <span>
        Viser 1–{vist} av {total} medlemmer
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled
          title="Kommer i v2"
          className="rounded-md px-4 py-2 text-xs font-medium opacity-50"
        >
          ← Forrige
        </button>
        <button
          type="button"
          disabled
          title="Kommer i v2"
          className="rounded-md border border-border bg-card px-4 py-2 text-xs font-medium opacity-50"
        >
          Vis flere →
        </button>
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
  );
}
