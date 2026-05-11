/**
 * PILOT — PlayerHQ Leaderboard
 * Bygd direkte fra wireframe/design-files-v2/playerhq-A/03-mal-leaderboard.html
 * URL: /leaderboard-demo
 *
 * Mock-data: GFGK uke 19, 2026. Markus #7 av 24.
 * Pro-tier rendres med full visning. "Globalt"-tab er Pro-låst — Free-brukere
 * ser Lock-overlay på den tab-en.
 */

import {
  Search,
  Trophy,
  Award,
  ChevronDown,
  ArrowRight,
  Flame,
  Target,
  TrendingUp,
  Lock,
} from "lucide-react";

export default function LeaderboardDemo() {
  return (
    <div className="min-h-screen bg-[var(--color-card,#FFFFFF)] text-foreground p-8">
      <Head />
      <YourRank />
      <Filters />
      <Table />
      <Pagination />
    </div>
  );
}

function Head() {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-6">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
          Mål · Leaderboard · Uke 19 · 5.–11. mai 2026
        </div>
        <h1 className="mt-2.5 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
          <em className="font-medium italic">#7 av 24 i klubben, Markus.</em>
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2.5 text-[13px] text-muted-foreground">
          <span>GFGK · ukens rangering</span>
          <Dot />
          <span
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium"
            style={{
              background: "rgba(26,125,86,0.10)",
              color: "var(--status-success,#1A7D56)",
            }}
          >
            ↑ +2 plasseringer fra uke 18
          </span>
          <Dot />
          <span>Neste oppdatering søndag 23:59</span>
        </div>
      </div>
      <div className="flex gap-1 border-b border-border">
        {[
          { name: "Venner", count: 8 },
          { name: "Klubb", count: 24, active: true },
          { name: "Globalt", count: 100, pro: true },
        ].map((t) => (
          <button
            key={t.name}
            className={`relative inline-flex items-center gap-1.5 px-3.5 py-2.5 text-[13px] font-medium transition-colors ${
              t.active
                ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.name}
            <span className="rounded-full bg-secondary px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {t.count}
            </span>
            {t.pro && <Lock className="h-3 w-3 text-muted-foreground" />}
          </button>
        ))}
      </div>
    </div>
  );
}

function YourRank() {
  return (
    <div
      className="relative mb-6 grid grid-cols-[auto_auto_1fr_auto] items-center gap-6 overflow-hidden rounded-lg px-7 py-5 text-white"
      style={{
        background: "linear-gradient(135deg, #0A1F18 0%, #102C22 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-56"
        style={{
          background:
            "radial-gradient(circle at 80% 50%, rgba(209,248,67,0.18), transparent 60%)",
        }}
      />
      <div className="relative z-10 font-mono text-[64px] font-medium leading-none tracking-[-0.04em] text-accent">
        #7
        <span className="ml-1 text-[30px] font-normal text-white/40">/ 24</span>
      </div>
      <div className="relative z-10 grid h-14 w-14 place-items-center rounded-full bg-accent font-display text-[20px] font-bold text-accent-foreground border-[3px] border-white">
        MP
      </div>
      <div className="relative z-10">
        <strong className="block font-display text-[18px] font-semibold">
          Markus Roinås Pedersen
        </strong>
        <span className="font-mono text-[12px] text-white/60">
          HCP 12,4 · Junior · medlem siden 2022
        </span>
      </div>
      <div className="relative z-10 flex gap-5">
        <RankDelta label="Δ Uke" value="↑ 2" tone="up" />
        <RankDelta label="Ukens SG" value="+0,8" />
        <RankDelta label="Økter" value="9" />
        <RankDelta label="Streak" value="14 dg" />
        <button className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          Se mine stats
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
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
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-white/50">
        {label}
      </span>
      <strong
        className={`mt-1 font-mono text-[18px] font-medium leading-none -tracking-tight ${tone === "up" ? "text-accent" : "text-white"}`}
      >
        {value}
      </strong>
    </div>
  );
}

function Filters() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-border bg-card px-4 py-4">
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Periode
      </span>
      <Chip active>Denne uka</Chip>
      <Chip>Måned</Chip>
      <Chip>Sesong</Chip>
      <div className="h-5 w-px bg-border" />
      <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Metric
      </span>
      <Chip active>Ukens SG</Chip>
      <Chip>Økter</Chip>
      <Chip>Streak</Chip>
      <Chip>Tester</Chip>
      <Chip>Badges</Chip>
      <div className="h-5 w-px bg-border" />
      <div className="flex max-w-[200px] flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
        <Search className="h-3.5 w-3.5 text-muted-foreground" />
        <input
          placeholder="Søk spiller …"
          className="flex-1 bg-transparent text-[13px] outline-none"
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
      className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : "border border-border bg-card text-muted-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

type Row = {
  rank: number;
  delta?: { value: string; tone: "up" | "down" };
  medal?: "gold" | "silver" | "bronze";
  initials: string;
  avatarBg: string;
  name: string;
  sub: string;
  hcp: string;
  sg: string;
  sgTone: "pos" | "neg";
  sessions: number;
  sessionsPct: number;
  badges: ("streak" | "test" | "momentum")[];
  me?: boolean;
};

const rows: Row[] = [
  {
    rank: 1,
    medal: "gold",
    initials: "EL",
    avatarBg: "#1A7D56",
    name: "Emil Larssen",
    sub: "GFGK · Senior",
    hcp: "+0,8",
    sg: "+2,4",
    sgTone: "pos",
    sessions: 14,
    sessionsPct: 100,
    badges: ["streak", "test", "momentum"],
  },
  {
    rank: 2,
    medal: "silver",
    initials: "SH",
    avatarBg: "#005840",
    name: "Sofie Halvorsen",
    sub: "GFGK · Dame",
    hcp: "+1,9",
    sg: "+1,8",
    sgTone: "pos",
    sessions: 12,
    sessionsPct: 85,
    badges: ["streak", "momentum"],
  },
  {
    rank: 3,
    medal: "bronze",
    initials: "JV",
    avatarBg: "#B8852A",
    name: "Johan Vedeler",
    sub: "GFGK · Junior",
    hcp: "+3,2",
    sg: "+1,5",
    sgTone: "pos",
    sessions: 11,
    sessionsPct: 78,
    badges: ["test"],
  },
  {
    rank: 4,
    delta: { value: "↑1", tone: "up" },
    initials: "KH",
    avatarBg: "#4A6B5C",
    name: "Kari Hansen",
    sub: "GFGK · Senior",
    hcp: "+4,1",
    sg: "+1,2",
    sgTone: "pos",
    sessions: 10,
    sessionsPct: 71,
    badges: ["momentum"],
  },
  {
    rank: 5,
    delta: { value: "↓2", tone: "down" },
    initials: "TR",
    avatarBg: "#7A6B4A",
    name: "Tobias Rønning",
    sub: "GFGK · Junior",
    hcp: "+5,4",
    sg: "+1,1",
    sgTone: "pos",
    sessions: 8,
    sessionsPct: 57,
    badges: ["streak"],
  },
  {
    rank: 6,
    delta: { value: "↑1", tone: "up" },
    initials: "LM",
    avatarBg: "#6B4A6B",
    name: "Lise Moe",
    sub: "GFGK · Dame",
    hcp: "+9,8",
    sg: "+0,9",
    sgTone: "pos",
    sessions: 10,
    sessionsPct: 71,
    badges: ["test", "momentum"],
  },
  {
    rank: 7,
    delta: { value: "↑2", tone: "up" },
    initials: "MP",
    avatarBg: "var(--brand-primary, #005840)",
    name: "Markus Pedersen",
    sub: "GFGK · Junior · 14-dg streak",
    hcp: "12,4",
    sg: "+0,8",
    sgTone: "pos",
    sessions: 9,
    sessionsPct: 64,
    badges: ["streak", "test", "momentum"],
    me: true,
  },
  {
    rank: 8,
    delta: { value: "↓3", tone: "down" },
    initials: "SK",
    avatarBg: "#4A6B7A",
    name: "Stein Kvam",
    sub: "GFGK · Senior",
    hcp: "+13,6",
    sg: "+0,6",
    sgTone: "pos",
    sessions: 7,
    sessionsPct: 50,
    badges: [],
  },
  {
    rank: 9,
    initials: "AB",
    avatarBg: "#6B5C4A",
    name: "Anna Berg",
    sub: "GFGK · Junior",
    hcp: "+15,2",
    sg: "+0,4",
    sgTone: "pos",
    sessions: 8,
    sessionsPct: 57,
    badges: ["test"],
  },
  {
    rank: 10,
    delta: { value: "↑4", tone: "up" },
    initials: "PN",
    avatarBg: "#4A5C6B",
    name: "Petter Nilsen",
    sub: "GFGK · Junior",
    hcp: "+16,8",
    sg: "−0,1",
    sgTone: "neg",
    sessions: 11,
    sessionsPct: 78,
    badges: ["streak"],
  },
  {
    rank: 11,
    initials: "IS",
    avatarBg: "#5C4A6B",
    name: "Ida Solberg",
    sub: "GFGK · Dame",
    hcp: "+18,4",
    sg: "−0,3",
    sgTone: "neg",
    sessions: 6,
    sessionsPct: 43,
    badges: [],
  },
  {
    rank: 12,
    delta: { value: "↓1", tone: "down" },
    initials: "OS",
    avatarBg: "#6B6B4A",
    name: "Ola Strand",
    sub: "GFGK · Senior",
    hcp: "+22,0",
    sg: "−0,5",
    sgTone: "neg",
    sessions: 5,
    sessionsPct: 35,
    badges: [],
  },
];

function Table() {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="grid items-center gap-4 border-b border-border bg-secondary px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
        style={{
          gridTemplateColumns: "56px 1.6fr 70px 100px 80px 130px 50px",
        }}
      >
        <div className="inline-flex cursor-pointer items-center gap-1 text-foreground">
          Rang
          <ChevronDown className="h-3 w-3" />
        </div>
        <div>Spiller</div>
        <div>HCP</div>
        <div>Ukens SG</div>
        <div>Økter</div>
        <div>Badges</div>
        <div />
      </div>
      {rows.map((r) => (
        <RowEl key={r.rank} r={r} />
      ))}
    </div>
  );
}

function RowEl({ r }: { r: Row }) {
  const medalColor =
    r.medal === "gold"
      ? "text-[#D4A437]"
      : r.medal === "silver"
        ? "text-[#A8A8A8]"
        : r.medal === "bronze"
          ? "text-[#B87333]"
          : "";
  return (
    <div
      className={`relative grid cursor-pointer items-center gap-4 border-b border-border px-6 py-3.5 transition-colors last:border-b-0 ${
        r.me
          ? "bg-accent/20 hover:bg-accent/30"
          : "hover:bg-secondary"
      }`}
      style={{
        gridTemplateColumns: "56px 1.6fr 70px 100px 80px 130px 50px",
      }}
    >
      {r.me && (
        <span className="absolute bottom-0 left-0 top-0 w-[3px] bg-accent" />
      )}
      <div className="flex items-center gap-1.5 font-mono text-[18px] font-medium tabular-nums text-foreground">
        {r.rank}
        {r.medal && (
          <Trophy className={`h-[22px] w-[22px] ${medalColor}`} strokeWidth={1.5} />
        )}
        {r.delta && (
          <span
            className={`text-[10px] font-semibold ${
              r.delta.tone === "up"
                ? "text-[var(--status-success,#1A7D56)]"
                : "text-destructive"
            }`}
          >
            {r.delta.value}
          </span>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-3">
        <div
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-white font-display text-[13px] font-semibold"
          style={{ background: r.avatarBg, color: r.me ? "#D1F843" : "#fff" }}
        >
          {r.initials}
        </div>
        <div className="min-w-0">
          <strong className="block truncate text-[14px] font-semibold">
            {r.name}
            {r.me && (
              <span className="ml-1.5 inline-block rounded-full bg-accent px-1.5 py-0.5 align-middle text-[9px] font-bold uppercase tracking-wider text-accent-foreground">
                Deg
              </span>
            )}
          </strong>
          <span className="font-mono text-[11px] text-muted-foreground">
            {r.sub}
          </span>
        </div>
      </div>
      <div className="font-mono text-[13px] tabular-nums text-foreground">{r.hcp}</div>
      <div
        className={`font-mono text-[14px] font-medium tabular-nums ${
          r.sgTone === "pos"
            ? "text-[var(--status-success,#1A7D56)]"
            : "text-destructive"
        }`}
      >
        {r.sg}
      </div>
      <div className="flex items-center gap-2 font-mono text-[13px] tabular-nums">
        {r.sessions}
        <div className="h-1 max-w-[50px] flex-1 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${r.sessionsPct}%` }}
          />
        </div>
      </div>
      <div className="flex gap-1.5">
        {r.badges.map((b) => (
          <Badge key={b} type={b} />
        ))}
      </div>
      <button className="grid h-7 w-7 place-items-center rounded-sm text-muted-foreground hover:bg-secondary hover:text-foreground">
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Badge({ type }: { type: "streak" | "test" | "momentum" }) {
  const styles = {
    streak: {
      icon: <Flame className="h-3 w-3" strokeWidth={1.75} />,
      cls: "bg-[rgba(184,133,42,0.16)] text-[var(--status-warning,#B8852A)]",
    },
    test: {
      icon: <Target className="h-3 w-3" strokeWidth={1.75} />,
      cls: "bg-primary/10 text-primary",
    },
    momentum: {
      icon: <TrendingUp className="h-3 w-3" strokeWidth={1.75} />,
      cls: "bg-accent/40 text-accent-foreground",
    },
  };
  return (
    <div
      className={`grid h-6 w-6 place-items-center rounded-sm ${styles[type].cls}`}
    >
      {styles[type].icon}
    </div>
  );
}

function Pagination() {
  return (
    <div className="mt-4 flex items-center justify-between px-1 py-3.5 text-[12px] text-muted-foreground">
      <span>Viser 1–12 av 24 medlemmer</span>
      <div className="flex gap-2">
        <button className="rounded-md px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">
          ← Forrige
        </button>
        <button className="rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium hover:bg-secondary">
          Vis flere →
        </button>
      </div>
    </div>
  );
}

function Dot() {
  return (
    <span
      className="inline-block h-1 w-1 rounded-full"
      style={{ background: "var(--ink-disabled, #C4C0B8)" }}
    />
  );
}
