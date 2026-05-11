/**
 * PILOT — CoachHQ Lag-sammenligning · Q2 2026
 * Bygd direkte fra wireframe/design-files-v2/03-lag-snitt.html
 * URL: /lag-snitt-demo
 *
 * Mock-data. Bytt til Prisma-henting senere.
 */

import { Calendar, Download, X, Plus, RotateCcw, ArrowUpDown, Eye, ArrowUpRight } from "lucide-react";

type Row = {
  tier: "fys" | "tek" | "slag" | "spill" | "turn";
  name: string;
  sub: string;
  cells: { val: string; delta: string; deltaTone?: "up" | "down" | "flat"; width: number; selected?: boolean }[];
  avg: { val: string; width: number };
};

const PYR_COLOR: Record<Row["tier"], string> = {
  fys: "var(--color-pyr-fys, #005840)",
  tek: "var(--color-pyr-tek, #1A7D56)",
  slag: "var(--color-pyr-slag, #D1F843)",
  spill: "var(--color-pyr-spill, #B8852A)",
  turn: "var(--color-pyr-turn, #5E5C57)",
};

const ROWS: Row[] = [
  {
    tier: "fys",
    name: "FYS",
    sub: "fysisk fundament",
    cells: [
      { val: "18,2 %", delta: "−3,8", deltaTone: "flat", width: 45 },
      { val: "22,4 %", delta: "0", deltaTone: "flat", width: 56 },
      { val: "24,3 %", delta: "+1,9", deltaTone: "up", width: 61, selected: true },
      { val: "30,1 %", delta: "+7,7", deltaTone: "up", width: 75 },
      { val: "16,4 %", delta: "−6,0", deltaTone: "down", width: 41 },
    ],
    avg: { val: "22,4 %", width: 56 },
  },
  {
    tier: "tek",
    name: "TEK",
    sub: "teknikk · golfsving",
    cells: [
      { val: "32,1 %", delta: "+1,2", deltaTone: "up", width: 80 },
      { val: "28,2 %", delta: "−2,7", deltaTone: "down", width: 70 },
      { val: "26,4 %", delta: "−4,5", deltaTone: "down", width: 66, selected: true },
      { val: "32,0 %", delta: "+1,1", deltaTone: "up", width: 80 },
      { val: "38,2 %", delta: "+7,3", deltaTone: "up", width: 95 },
    ],
    avg: { val: "30,9 %", width: 77 },
  },
  {
    tier: "slag",
    name: "SLAG",
    sub: "slagprogresjon",
    cells: [
      { val: "24,0 %", delta: "+1,9", deltaTone: "up", width: 60 },
      { val: "22,2 %", delta: "0", deltaTone: "flat", width: 55 },
      { val: "20,1 %", delta: "−2,0", deltaTone: "down", width: 50, selected: true },
      { val: "18,4 %", delta: "−3,7", deltaTone: "down", width: 46 },
      { val: "24,1 %", delta: "+2,0", deltaTone: "up", width: 60 },
    ],
    avg: { val: "22,1 %", width: 55 },
  },
  {
    tier: "spill",
    name: "SPILL",
    sub: "banespill · scoring",
    cells: [
      { val: "13,8 %", delta: "−0,1", deltaTone: "flat", width: 35 },
      { val: "15,9 %", delta: "+2,0", deltaTone: "up", width: 40 },
      { val: "17,8 %", delta: "+3,9", deltaTone: "up", width: 44, selected: true },
      { val: "11,8 %", delta: "−2,1", deltaTone: "down", width: 30 },
      { val: "11,9 %", delta: "−2,0", deltaTone: "down", width: 30 },
    ],
    avg: { val: "13,9 %", width: 35 },
  },
  {
    tier: "turn",
    name: "TURN",
    sub: "turnering · konkurranse",
    cells: [
      { val: "11,9 %", delta: "+1,1", deltaTone: "up", width: 30 },
      { val: "11,3 %", delta: "+0,5", deltaTone: "up", width: 28 },
      { val: "11,4 %", delta: "+0,6", deltaTone: "up", width: 28, selected: true },
      { val: "7,7 %", delta: "−3,1", deltaTone: "down", width: 19 },
      { val: "9,4 %", delta: "−1,4", deltaTone: "down", width: 24 },
    ],
    avg: { val: "10,8 %", width: 27 },
  },
];

const GROUPS = [
  { name: "Elite", initials: ["MP", "HN", "MR"], more: 9, meta: "12 spillere · snitt HCP 4,2" },
  { name: "A-lag", initials: ["AK", "MP", "JT"], more: 10, meta: "13 spillere · snitt HCP 8,1" },
  { name: "WANG Toppidrett", initials: ["MR", "EK", "SB"], more: 9, meta: "12 spillere · snitt HCP 6,4" },
  { name: "GFGK Junior", initials: ["MR", "JT", "LS"], more: 9, meta: "12 spillere · snitt HCP 12,8" },
  { name: "Akademi", initials: ["JT", "LS", "EK"], more: 15, meta: "18 spillere · snitt HCP 18,4" },
];

export default function LagSnittDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-8 py-8 pb-12 lg:px-10">
        {/* Header */}
        <header className="mb-6 flex items-start justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
              /admin/lag-snitt
            </span>
            <h1 className="mt-2 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
              Lag-sammenligning
            </h1>
            <p className="mt-2 font-display text-[15px] italic text-muted-foreground">
              Q2 2026. Hvem leverer, hvem henger etter.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatPill>
                <span className="font-mono">6</span> grupper
              </StatPill>
              <StatPill>
                Periode: <span className="font-mono text-muted-foreground">jan – mai 2026</span>
              </StatPill>
              <StatPill>
                Sist oppdatert: <span className="text-muted-foreground">i dag · 09:12</span>
              </StatPill>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
              <Calendar className="h-4 w-4" />
              jan – mai 2026
            </button>
            <button className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
              <Download className="h-4 w-4" />
              Eksporter rapport
            </button>
          </div>
        </header>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 border-b border-border">
          {[
            { name: "Pyramide", count: "5×6", active: true },
            { name: "SG", count: "5×6" },
            { name: "Tester", count: "8 mål" },
            { name: "Plan-adherence", count: "%" },
            { name: "Demografi", count: "142" },
          ].map((tab) => (
            <button
              key={tab.name}
              className={`relative px-4 py-3 font-display text-[14px] font-medium transition-colors ${
                tab.active
                  ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-0.5 after:bg-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.name}
              <span className="ml-1.5 font-mono text-[11px] text-muted-foreground">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Compare bar */}
        <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-5 py-3">
          <span className="mr-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            Sammenligner
          </span>
          {["Elite", "A-lag", "WANG Toppidrett", "GFGK Junior", "Akademi"].map((g) => (
            <span
              key={g}
              className="inline-flex h-7 items-center gap-1.5 rounded-full bg-foreground pl-3 pr-1 text-[12px] font-medium text-background"
            >
              {g}
              <button className="grid h-4.5 w-4.5 place-items-center rounded-full bg-white/15">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full border border-dashed border-border px-3 text-[12px] text-muted-foreground">
            <Plus className="h-3.5 w-3.5" />
            Legg til gruppe
          </span>
          <span className="flex-1" />
          <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
            <RotateCcw className="h-3.5 w-3.5" />
            Nullstill
          </button>
        </div>

        {/* Matrix */}
        <div className="mb-6 rounded-lg border border-border bg-card px-7 py-6">
          <div className="mb-5 flex items-end justify-between gap-6">
            <div>
              <h2 className="font-display text-[20px] font-semibold leading-snug tracking-tight">
                Pyramide-fokus per gruppe
              </h2>
              <div className="mt-1 text-[12px] text-muted-foreground">
                Rader: fokus-område · kolonner: gruppe. Klikk en rad for drawer-detalj.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
                <ArrowUpDown className="h-3.5 w-3.5" />
                Sortering
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
                <Eye className="h-3.5 w-3.5" />
                Vis snitt-rad
              </button>
            </div>
          </div>

          {/* Header row */}
          <div
            className="grid overflow-hidden rounded-lg border border-border"
            style={{ gridTemplateColumns: "96px repeat(5, 1fr) 1fr" }}
          >
            <div className="border-b border-r border-border bg-secondary px-4 py-3" />
            {GROUPS.map((g) => (
              <div
                key={g.name}
                className="flex flex-col gap-2 border-b border-r border-border bg-secondary px-4 py-3"
              >
                <div className="font-display text-[14px] font-semibold leading-tight tracking-tight">
                  {g.name}
                </div>
                <div className="flex items-center gap-1">
                  {g.initials.map((i, idx) => (
                    <span
                      key={idx}
                      className="grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-muted text-[9px] font-semibold"
                      style={{ marginLeft: idx === 0 ? 0 : "-6px" }}
                    >
                      {i}
                    </span>
                  ))}
                  <span
                    className="grid h-6 w-6 place-items-center rounded-full border-2 border-card bg-muted text-[9px] font-semibold text-muted-foreground"
                    style={{ marginLeft: "-6px" }}
                  >
                    +{g.more}
                  </span>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground">{g.meta}</div>
              </div>
            ))}
            <div className="flex flex-col gap-2 border-b border-r border-border bg-foreground px-4 py-3">
              <div className="font-display text-[14px] font-semibold italic leading-tight tracking-tight text-background">
                Snitt
              </div>
              <div className="font-mono text-[10px] text-background/55">vektet · 67 aktive</div>
            </div>

            {/* Data rows */}
            {ROWS.map((row) => (
              <RowGroup key={row.tier} row={row} />
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between px-1 py-3">
            <div className="text-[12px] text-muted-foreground">
              <b className="font-semibold text-foreground">WANG Toppidrett</b> åpnet i drawer · klikk annen rad for å bytte
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
              Åpne WANG-detalj
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Three insight cards */}
        <div className="grid grid-cols-[1.2fr_1fr_1fr] gap-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Observasjon · WANG
            </div>
            <h3 className="mb-2 font-display text-[17px] font-semibold leading-snug tracking-tight">
              FYS-tunge sammenlignet med snitt — TEK ligger 4,5 pp under.
            </h3>
            <p className="mb-3 text-[13px] leading-relaxed text-muted-foreground">
              Hjemmebane-treningen handler om kondisjon før skole. Foreslå å flytte 2 økter/uke fra FYS til TEK-bloker for å hente igjen.
            </p>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground transition-opacity hover:opacity-90">
                Foreslå for coach
              </button>
              <button className="inline-flex items-center rounded-md px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-secondary">
                Lukk
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Toppspillere · WANG
            </div>
            <div className="flex flex-col gap-3">
              <TopPlayer initials="MR" name="Markus Roinås P." hcp="4,2" sg="+1,8" rank="topp 1" />
              <TopPlayer initials="EK" name="Eline Krogh" hcp="5,8" sg="+1,2" rank="topp 2" />
              <TopPlayer initials="SB" name="Sondre Berg" hcp="6,4" sg="+0,9" rank="topp 3" />
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              Periode-sammendrag
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Mini k="SG snitt" v="+0,84" sub="+0,32 vs Q1" valueTone="success" subTone="success" />
              <Mini k="HCP snitt" v="8,9" sub="−1,4 vs Q1" subTone="success" />
              <Mini k="Økter" v="412" sub="jan – mai" />
              <Mini k="Adherence" v="87 %" sub="+4 pp vs Q1" subTone="success" />
            </div>
          </div>
        </div>

        <footer className="mt-10 flex items-center justify-between border-t border-border pt-6 text-[12px] text-muted-foreground">
          <span>AK Golf Platform · CoachHQ · /admin/lag-snitt</span>
          <span className="font-mono">Q2 2026 · 142 spillere · sist beregnet 09:12</span>
        </footer>
      </div>
    </div>
  );
}

function RowGroup({ row }: { row: Row }) {
  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-r border-border bg-secondary px-4 py-3">
        <span className="h-7 w-2 rounded-sm" style={{ background: PYR_COLOR[row.tier] }} />
        <div className="flex flex-col">
          <span className="font-display text-[14px] font-semibold tracking-tight">{row.name}</span>
          <span className="text-[11px] font-normal text-muted-foreground">{row.sub}</span>
        </div>
      </div>
      {row.cells.map((c, i) => (
        <div
          key={i}
          className={`relative grid grid-cols-[1fr_auto] items-center gap-2 border-b border-r border-border bg-card px-4 py-3 hover:bg-secondary ${
            c.selected ? "bg-primary/5 shadow-[inset_3px_0_0_var(--color-primary)]" : ""
          }`}
        >
          <span
            className={`font-mono text-[17px] font-medium tabular-nums -tracking-tight ${
              c.selected ? "text-primary" : ""
            }`}
          >
            {c.val}
          </span>
          <span
            className={`font-mono text-[10.5px] ${
              c.deltaTone === "up"
                ? "text-[var(--color-pyr-tek,#1A7D56)]"
                : c.deltaTone === "down"
                  ? "text-destructive"
                  : "text-muted-foreground"
            }`}
          >
            {c.delta}
          </span>
          <span
            className="col-span-2 mt-2 h-[3px] self-end rounded-sm"
            style={{ background: PYR_COLOR[row.tier], width: `${c.width}%` }}
          />
        </div>
      ))}
      <div className="relative grid grid-cols-[1fr_auto] items-center gap-2 border-b border-r border-border bg-secondary px-4 py-3">
        <span className="font-mono text-[17px] font-medium tabular-nums -tracking-tight">{row.avg.val}</span>
        <span className="font-mono text-[10.5px] text-muted-foreground">snitt</span>
        <span
          className="col-span-2 mt-2 h-[3px] self-end rounded-sm opacity-40"
          style={{ background: "var(--color-muted-foreground)", width: `${row.avg.width}%` }}
        />
      </div>
    </>
  );
}

function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-3 py-1.5 text-[12px] text-foreground">
      {children}
    </span>
  );
}

function TopPlayer({
  initials,
  name,
  hcp,
  sg,
  rank,
}: {
  initials: string;
  name: string;
  hcp: string;
  sg: string;
  rank: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-muted font-display text-[12px] font-semibold">
        {initials}
      </span>
      <div className="flex-1">
        <div className="text-[13px] font-semibold">{name}</div>
        <div className="text-[11px] text-muted-foreground">
          HCP <span className="font-mono">{hcp}</span> · SG <span className="font-mono">{sg}</span>
        </div>
      </div>
      <span className="rounded-full bg-[#E5F1EA] px-2 py-0.5 text-[11px] font-medium text-[var(--color-pyr-tek,#1A7D56)]">
        {rank}
      </span>
    </div>
  );
}

function Mini({
  k,
  v,
  sub,
  valueTone,
  subTone,
}: {
  k: string;
  v: string;
  sub: string;
  valueTone?: "success";
  subTone?: "success";
}) {
  return (
    <div>
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {k}
      </div>
      <div
        className={`mt-1 font-mono text-[24px] font-medium leading-tight tabular-nums -tracking-tight ${
          valueTone === "success" ? "text-[var(--color-pyr-tek,#1A7D56)]" : ""
        }`}
      >
        {v}
      </div>
      <div
        className={`mt-1 text-[11px] ${
          subTone === "success" ? "text-[var(--color-pyr-tek,#1A7D56)]" : "text-muted-foreground"
        }`}
      >
        {sub}
      </div>
    </div>
  );
}
