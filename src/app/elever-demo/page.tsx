/**
 * CoachHQ — Elever (spillerliste)
 * Bygd fra wireframe/design-files-v2/screens/01-elever.html (produksjons-frame 01)
 * URL: /elever-demo
 */

import {
  Search,
  Filter,
  Plus,
  Download,
  UserPlus,
  MessageCircle,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ListFilter,
} from "lucide-react";

type Status = "ok" | "warn" | "dan" | "ferie";
type Tier = "PRO" | "GRATIS";

type Player = {
  avatar: string;
  avBg: string;
  name: string;
  meta: string;
  hcp: string;
  delta: string;
  deltaGood: boolean;
  tier: Tier;
  pyr: number[];
  last: string;
  status: Status;
  statusLabel: string;
};

const players: Player[] = [
  {
    avatar: "MP",
    avBg: "#005840",
    name: "Markus Roinås Pedersen",
    meta: "U18 · WANG Toppidrett · 28 økter",
    hcp: "+2,4",
    delta: "−1,1",
    deltaGood: true,
    tier: "PRO",
    pyr: [20, 18, 14, 11, 8],
    last: "i går · 17:30",
    status: "ok",
    statusLabel: "På plan",
  },
  {
    avatar: "HN",
    avBg: "#1A7D56",
    name: "Henrik Nilsen",
    meta: "U21 · GFGK · 22 økter",
    hcp: "12,4",
    delta: "−0,3",
    deltaGood: true,
    tier: "PRO",
    pyr: [18, 14, 10, 7, 4],
    last: "i går · 14:00",
    status: "ok",
    statusLabel: "På plan",
  },
  {
    avatar: "AK",
    avBg: "#1A7D56",
    name: "Anna Karlsen",
    meta: "Senior · GFGK · 18 økter",
    hcp: "18,2",
    delta: "−0,8",
    deltaGood: true,
    tier: "PRO",
    pyr: [20, 17, 12, 8, 3],
    last: "2 t siden",
    status: "ok",
    statusLabel: "På plan",
  },
  {
    avatar: "MR",
    avBg: "#B8852A",
    name: "Mads Rønning",
    meta: "Senior · Borre GK · 14 økter",
    hcp: "9,8",
    delta: "+0,6",
    deltaGood: false,
    tier: "PRO",
    pyr: [20, 18, 16, 14, 10],
    last: "5 dgr",
    status: "warn",
    statusLabel: "Forsinket",
  },
  {
    avatar: "LS",
    avBg: "#A32D2D",
    name: "Lise Sandberg",
    meta: "Senior · GFGK · 6 økter",
    hcp: "22,5",
    delta: "+1,2",
    deltaGood: false,
    tier: "GRATIS",
    pyr: [14, 9, 6, 4, 2],
    last: "2 uker",
    status: "dan",
    statusLabel: "Inaktiv",
  },
  {
    avatar: "JD",
    avBg: "#5E5C57",
    name: "Jon Dahl",
    meta: "Senior · Borre GK · 11 økter",
    hcp: "14,0",
    delta: "−0,1",
    deltaGood: true,
    tier: "PRO",
    pyr: [18, 14, 11, 9, 5],
    last: "3 dgr",
    status: "ferie",
    statusLabel: "Ferie",
  },
  {
    avatar: "SB",
    avBg: "#3a5d8a",
    name: "Sigrid Berge",
    meta: "U18 · GFGK · 24 økter",
    hcp: "8,1",
    delta: "−0,5",
    deltaGood: true,
    tier: "PRO",
    pyr: [20, 19, 17, 13, 11],
    last: "i dag · 09:00",
    status: "ok",
    statusLabel: "På plan",
  },
  {
    avatar: "EH",
    avBg: "#7d4f9a",
    name: "Erik Haugen",
    meta: "Senior · Mulligan · 9 økter",
    hcp: "16,7",
    delta: "−0,2",
    deltaGood: true,
    tier: "GRATIS",
    pyr: [15, 11, 7, 5, 3],
    last: "4 dgr",
    status: "warn",
    statusLabel: "Forsinket",
  },
  {
    avatar: "KV",
    avBg: "#2c4a6b",
    name: "Kari Vik",
    meta: "Senior · Borre GK · 7 økter",
    hcp: "28,3",
    delta: "+0,4",
    deltaGood: false,
    tier: "GRATIS",
    pyr: [11, 7, 4, 3, 2],
    last: "8 dgr",
    status: "warn",
    statusLabel: "Forsinket",
  },
];

const followups: { initials: string; bg: string; name: string; desc: string; when: string }[] = [
  {
    initials: "LS",
    bg: "#A32D2D",
    name: "Lise Sandberg",
    desc: "Ingen registrerte økter på 14 dager. HCP +1,2 siden sist.",
    when: "14d",
  },
  {
    initials: "MR",
    bg: "#B8852A",
    name: "Mads Rønning",
    desc: "Hoppet over to puttinge-økter denne uka. SLAG-belastning lav.",
    when: "5d",
  },
  {
    initials: "EH",
    bg: "#7d4f9a",
    name: "Erik Haugen",
    desc: "Manuell flytt-forespørsel ikke besvart. Booking i morgen.",
    when: "4d",
  },
  {
    initials: "KV",
    bg: "#2c4a6b",
    name: "Kari Vik",
    desc: "Ny spiller, mangler intro-økt og treningsplan.",
    when: "8d",
  },
];

export default function EleverDemo() {
  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Coach HQ · Spillere
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            Førtito spillere. <em className="italic text-primary">Tre nye denne uka.</em>
          </h1>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
            <Download size={14} strokeWidth={1.5} />
            Eksport
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
            <UserPlus size={14} strokeWidth={1.5} />
            Inviter
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
            <Plus size={14} strokeWidth={1.5} />
            Ny spiller
          </button>
        </div>
      </header>

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-3.5">
        <KpiFeature label="Aktive spillere" value="42" delta="+3 denne måneden" />
        <Kpi label="Snitt-HCP" value="14,8" delta="−0,4 i mnd" deltaTone="good" deltaDown />
        <Kpi label="På plan" value="31" suffix="/ 42" delta="74 % compliance" />
        <Kpi label="Trenger oppfølging" value="6" valueTone="warning" delta="+2 vs sist uke" deltaTone="bad" />
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.5} />
          <span className="flex-1">Søk på navn, klubb, e-post…</span>
          <span className="rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </span>
        </div>
        <Chip active>Alle <Count>42</Count></Chip>
        <Chip>På plan <Count>31</Count></Chip>
        <Chip>Forsinket <Count>6</Count></Chip>
        <Chip>Inaktiv <Count>3</Count></Chip>
        <Chip>Ferie <Count>2</Count></Chip>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-muted-foreground hover:bg-secondary">
          <Filter size={14} strokeWidth={1.5} />
        </button>
      </div>

      {/* Body grid */}
      <div className="grid grid-cols-[1fr_340px] items-start gap-5">
        {/* Table */}
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border bg-[var(--surface-alt,#F1EEE5)] px-4 py-2.5 text-[12px]">
            <div className="flex items-center gap-2.5 text-muted-foreground">
              <span className="inline-block h-3.5 w-3.5 rounded-sm border border-border bg-card" />
              <span>
                Viser <b className="font-medium text-foreground">42 av 42</b> spillere
              </span>
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <button className="inline-flex items-center gap-1 text-[11px] hover:text-foreground">
                Sorter:{" "}
                <span className="font-medium text-foreground">HCP, høy til lav</span>
                <ChevronDown size={12} strokeWidth={1.5} />
              </button>
              <span className="h-4 w-px bg-border" />
              <button className="inline-flex items-center gap-1 text-[11px] hover:text-foreground">
                <ListFilter size={13} strokeWidth={1.5} />
                Kolonner
              </button>
            </div>
          </div>

          {/* Header row */}
          <div className="grid grid-cols-[32px_1.6fr_90px_70px_120px_110px_110px_80px] gap-3 border-b border-border px-4 py-2.5 font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <span />
            <span>Spiller</span>
            <span className="text-right">HCP</span>
            <span>Tier</span>
            <span>Pyramide-fokus</span>
            <span>Sist økt</span>
            <span>Status</span>
            <span className="text-right">Handling</span>
          </div>

          {players.map((p) => (
            <PlayerRow key={p.name} player={p} />
          ))}
        </div>

        {/* Side */}
        <aside className="flex flex-col gap-4">
          <section className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Trenger oppfølging
              </h3>
              <span className="rounded-full bg-[rgba(184,133,42,0.12)] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#7d5814]">
                6
              </span>
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
              Spillere som har sklidd unna programmet eller mangler kontakt &gt; 5 dager.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {followups.map((f) => (
                <div
                  key={f.name}
                  className="grid grid-cols-[28px_1fr_auto] items-start gap-2.5 rounded-md border border-border bg-background p-2.5"
                >
                  <div
                    className="grid h-7 w-7 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
                    style={{ background: f.bg }}
                  >
                    {f.initials}
                  </div>
                  <div className="text-[12px] leading-snug">
                    <div className="font-medium text-foreground">{f.name}</div>
                    <div className="text-[11px] text-muted-foreground">{f.desc}</div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground">{f.when}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border px-3 py-2 text-[12px] font-medium text-foreground hover:bg-secondary">
              Se alle 6
              <ArrowUpRight size={13} strokeWidth={1.5} />
            </button>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Tier-fordeling
              </h3>
              <span className="font-mono text-[10px] text-muted-foreground">42 totalt</span>
            </div>
            <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-border">
              <span className="bg-primary" style={{ width: "66%" }} />
              <span className="bg-muted-foreground" style={{ width: "34%" }} />
            </div>
            <div className="mt-3 flex flex-col gap-1.5 text-[12px]">
              <LegendRow color="var(--color-primary,#005840)" name="Pro" count="28" pct="66 %" />
              <LegendRow color="var(--color-muted-foreground,#5E5C57)" name="Gratis" count="14" pct="34 %" />
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[12px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                Compliance · 14 dager
              </h3>
              <span className="font-mono text-[10px] text-foreground">87 %</span>
            </div>
            <p className="mt-1.5 text-[12px] leading-snug text-muted-foreground">
              Andel registrerte økter pr. dag, hele porteføljen.
            </p>
            <div className="mt-3 grid grid-cols-14 gap-1" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
              {[3, 4, 2, 3, 4, 1, 0, 2, 3, 4, 3, 4, 2, 4].map((lvl, i) => (
                <span
                  key={i}
                  className={`aspect-square rounded-sm ${heatClass(lvl)} ${
                    i === 13 ? "ring-2 ring-accent ring-offset-1 ring-offset-card" : ""
                  }`}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center justify-between font-mono text-[10px] text-muted-foreground">
              <span>27. apr</span>
              <span className="font-medium text-foreground">i dag</span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function heatClass(lvl: number): string {
  const map: Record<number, string> = {
    0: "bg-[var(--surface-alt,#F1EEE5)] border border-border",
    1: "bg-[rgba(0,88,64,0.20)]",
    2: "bg-[rgba(0,88,64,0.40)]",
    3: "bg-[rgba(0,88,64,0.65)]",
    4: "bg-primary",
  };
  return map[lvl] ?? map[0];
}

function Chip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-medium ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-[10px] font-semibold tabular-nums opacity-70">
      {children}
    </span>
  );
}

function KpiFeature({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-transparent bg-gradient-to-br from-[#1A1916] to-[#2a2823] p-4 text-white">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-white/55">
        {label}
      </div>
      <div className="font-display text-[32px] font-medium leading-none tracking-tight">{value}</div>
      <div className="inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.02em] text-[#D1F843]">
        <ArrowUpRight size={11} strokeWidth={1.5} />
        {delta}
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  suffix,
  delta,
  deltaTone,
  deltaDown,
  valueTone,
}: {
  label: string;
  value: string;
  suffix?: string;
  delta: string;
  deltaTone?: "good" | "bad";
  deltaDown?: boolean;
  valueTone?: "warning";
}) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`font-display text-[32px] font-medium leading-none tracking-tight ${
          valueTone === "warning" ? "text-[#B8852A]" : "text-foreground"
        }`}
      >
        {value}
        {suffix && (
          <span className="ml-1.5 font-sans text-[14px] font-normal text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      <div
        className={`inline-flex items-center gap-1 font-mono text-[10px] tracking-[0.02em] ${
          deltaTone === "good"
            ? "text-[#1A7D56]"
            : deltaTone === "bad"
              ? "text-[#A32D2D]"
              : "text-muted-foreground"
        }`}
      >
        {deltaTone === "good" && deltaDown ? (
          <ArrowDownRight size={11} strokeWidth={1.5} />
        ) : deltaTone === "bad" ? (
          <ArrowUpRight size={11} strokeWidth={1.5} />
        ) : null}
        {delta}
      </div>
    </div>
  );
}

function PlayerRow({ player: p }: { player: Player }) {
  const tierStyle: Record<Tier, string> = {
    PRO: "bg-primary/10 text-primary",
    GRATIS: "bg-secondary text-muted-foreground",
  };
  const pillStyle: Record<Status, string> = {
    ok: "bg-[rgba(45,107,76,0.12)] text-[#1A7D56]",
    warn: "bg-[rgba(184,133,42,0.12)] text-[#7d5814]",
    dan: "bg-[rgba(176,68,68,0.10)] text-[#A32D2D]",
    ferie: "bg-secondary text-muted-foreground",
  };
  const pyrColors = ["#005840", "#1A7D56", "#D1F843", "#B8852A", "#5E5C57"];
  return (
    <div className="grid cursor-pointer grid-cols-[32px_1.6fr_90px_70px_120px_110px_110px_80px] items-center gap-3 border-b border-border px-4 py-3 text-[12px] last:border-b-0 hover:bg-[var(--surface-alt,#F1EEE5)]">
      <span className="inline-block h-3.5 w-3.5 rounded-sm border border-border bg-card" />
      <div className="flex items-center gap-2.5">
        <div
          className="grid h-8 w-8 place-items-center rounded-full font-mono text-[10px] font-semibold text-white"
          style={{ background: p.avBg }}
        >
          {p.avatar}
        </div>
        <div className="leading-tight">
          <div className="font-medium text-foreground">{p.name}</div>
          <div className="font-mono text-[10px] tracking-[0.02em] text-muted-foreground">
            {p.meta}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono text-[13px] font-semibold tabular-nums">{p.hcp}</div>
        <div
          className={`font-mono text-[10px] font-medium ${
            p.deltaGood ? "text-[#1A7D56]" : "text-[#A32D2D]"
          }`}
        >
          {p.delta}
        </div>
      </div>
      <div>
        <span
          className={`inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] ${tierStyle[p.tier]}`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              p.tier === "PRO" ? "bg-primary" : "bg-muted-foreground"
            }`}
          />
          {p.tier === "PRO" ? "Pro" : "Gratis"}
        </span>
      </div>
      <div className="flex items-end gap-1">
        {p.pyr.map((h, i) => (
          <span
            key={i}
            className="block w-2.5 rounded-[2px]"
            style={{ background: pyrColors[i], height: `${h}px` }}
          />
        ))}
      </div>
      <div className="font-mono text-[11px] tabular-nums text-muted-foreground">{p.last}</div>
      <div>
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${pillStyle[p.status]}`}
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              p.status === "ok"
                ? "bg-[#1A7D56]"
                : p.status === "warn"
                  ? "bg-[#B8852A]"
                  : p.status === "dan"
                    ? "bg-[#A32D2D]"
                    : "bg-muted-foreground"
            }`}
          />
          {p.statusLabel}
        </span>
      </div>
      <div className="flex justify-end gap-1">
        <button
          className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="Send melding"
        >
          <MessageCircle size={13} strokeWidth={1.5} />
        </button>
        <button
          className="grid h-7 w-7 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="Mer"
        >
          <MoreHorizontal size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

function LegendRow({
  color,
  name,
  count,
  pct,
}: {
  color: string;
  name: string;
  count: string;
  pct: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      <span className="flex-1 text-foreground">{name}</span>
      <span className="font-mono text-[11px] tabular-nums text-foreground">{count}</span>
      <span className="w-12 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
        {pct}
      </span>
    </div>
  );
}
