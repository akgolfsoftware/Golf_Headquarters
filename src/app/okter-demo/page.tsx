/**
 * PILOT — CoachHQ Økter
 * Bygd fra wireframe/design-files-v2/screens/05-okter.html
 * URL: /okter-demo
 *
 * Uke-kalender med pyramide-stripes per økt.
 * Mock-data for uke 19, 11.–17. mai 2026.
 */
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  List,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

type Tier = "fys" | "tek" | "slag" | "spill" | "turn";

type StripeBlock = { tier: Tier; pct: number };

type Session = {
  day: number; // 0 = mon
  startMin: number; // minutes from 06:00
  duration: number; // minutes
  time: string;
  title: string;
  meta: string;
  stripes: StripeBlock[];
  live?: boolean;
};

const TIER_HEX: Record<Tier, string> = {
  fys: "#005840",
  tek: "#1A7D56",
  slag: "#D1F843",
  spill: "#B8852A",
  turn: "#5E5C57",
};

const TIER_LABEL: Record<Tier, string> = {
  fys: "FYS",
  tek: "TEK",
  slag: "SLAG",
  spill: "SPILL",
  turn: "TURN",
};

const DAYS = [
  { label: "Man", date: 11, count: "3 økter" },
  { label: "Tir", date: 12, count: "3 økter" },
  { label: "Ons", date: 13, count: "3 økter · 1 live", today: true },
  { label: "Tor", date: 14, count: "2 økter" },
  { label: "Fre", date: 15, count: "3 økter" },
  { label: "Lør", date: 16, count: "2 økter" },
  { label: "Søn", date: 17, count: "2 økter" },
];

// 06:00 = 0 min, hver time = 32 px → 0,53 px/min
const PX_PER_MIN = 32 / 60;

const SESSIONS: Session[] = [
  // Man
  {
    day: 0,
    startMin: 120,
    duration: 90,
    time: "08:00–09:30",
    title: "WANG Toppidrett",
    meta: "Range · 8 stk · 6 øvelser",
    stripes: [
      { tier: "tek", pct: 50 },
      { tier: "slag", pct: 30 },
      { tier: "fys", pct: 20 },
    ],
  },
  {
    day: 0,
    startMin: 360,
    duration: 60,
    time: "12:00–13:00",
    title: "FYS gruppe",
    meta: "Studio 4 · 4 stk",
    stripes: [{ tier: "fys", pct: 100 }],
  },
  {
    day: 0,
    startMin: 660,
    duration: 60,
    time: "17:00–18:00",
    title: "1:1 Markus R",
    meta: "Studio 2 · TEK + SLAG",
    stripes: [
      { tier: "tek", pct: 60 },
      { tier: "slag", pct: 40 },
    ],
  },
  // Tir
  {
    day: 1,
    startMin: 180,
    duration: 60,
    time: "09:00–10:00",
    title: "1:1 Henrik N",
    meta: "Bås 4 · putting",
    stripes: [
      { tier: "slag", pct: 70 },
      { tier: "tek", pct: 30 },
    ],
  },
  {
    day: 1,
    startMin: 420,
    duration: 90,
    time: "13:00–14:30",
    title: "1:1 Emma S",
    meta: "Bossum · banespill",
    stripes: [
      { tier: "spill", pct: 50 },
      { tier: "tek", pct: 30 },
      { tier: "slag", pct: 20 },
    ],
  },
  {
    day: 1,
    startMin: 720,
    duration: 60,
    time: "18:00–19:00",
    title: "FYS junior",
    meta: "5 stk",
    stripes: [{ tier: "fys", pct: 100 }],
  },
  // Ons (today)
  {
    day: 2,
    startMin: 120,
    duration: 90,
    time: "08:00–09:30",
    title: "WANG TEK-fokus",
    meta: "Range · 8 stk",
    stripes: [
      { tier: "tek", pct: 60 },
      { tier: "slag", pct: 25 },
      { tier: "spill", pct: 15 },
    ],
  },
  {
    day: 2,
    startMin: 435,
    duration: 60,
    time: "13:15–14:15",
    title: "1:1 Markus R",
    meta: "Studio 1 · 4 av 6 øv",
    stripes: [{ tier: "tek", pct: 100 }],
    live: true,
  },
  {
    day: 2,
    startMin: 660,
    duration: 60,
    time: "17:00–18:00",
    title: "1:1 Mads R",
    meta: "Bossum · oppfølging",
    stripes: [
      { tier: "spill", pct: 60 },
      { tier: "slag", pct: 40 },
    ],
  },
  // Tor
  {
    day: 3,
    startMin: 180,
    duration: 90,
    time: "09:00–10:30",
    title: "FYS gruppe Pro",
    meta: "Studio 4 · 5 stk",
    stripes: [{ tier: "fys", pct: 100 }],
  },
  {
    day: 3,
    startMin: 540,
    duration: 60,
    time: "15:00–16:00",
    title: "1:1 Lina H",
    meta: "Turnerings-prep",
    stripes: [
      { tier: "turn", pct: 60 },
      { tier: "spill", pct: 40 },
    ],
  },
  // Fre
  {
    day: 4,
    startMin: 120,
    duration: 60,
    time: "08:00–09:00",
    title: "1:1 Markus R",
    meta: "Studio 2 · siste før helg",
    stripes: [
      { tier: "tek", pct: 60 },
      { tier: "slag", pct: 40 },
    ],
  },
  {
    day: 4,
    startMin: 420,
    duration: 90,
    time: "13:00–14:30",
    title: "U16 SLAG",
    meta: "Range · 8 stk",
    stripes: [
      { tier: "slag", pct: 70 },
      { tier: "tek", pct: 30 },
    ],
  },
  {
    day: 4,
    startMin: 720,
    duration: 60,
    time: "18:00–19:00",
    title: "FYS · alle",
    meta: "Studio 4",
    stripes: [{ tier: "fys", pct: 100 }],
  },
  // Lør
  {
    day: 5,
    startMin: 120,
    duration: 120,
    time: "08:00–10:00",
    title: "Junior-cup prep",
    meta: "GFGK · 12 stk",
    stripes: [
      { tier: "turn", pct: 80 },
      { tier: "spill", pct: 20 },
    ],
  },
  {
    day: 5,
    startMin: 540,
    duration: 60,
    time: "15:00–16:00",
    title: "1:1 Emma S",
    meta: "Bossum",
    stripes: [
      { tier: "spill", pct: 50 },
      { tier: "tek", pct: 30 },
      { tier: "slag", pct: 20 },
    ],
  },
  // Søn
  {
    day: 6,
    startMin: 240,
    duration: 90,
    time: "10:00–11:30",
    title: "Familie-økt",
    meta: "Range · 4 stk",
    stripes: [
      { tier: "spill", pct: 60 },
      { tier: "slag", pct: 40 },
    ],
  },
  {
    day: 6,
    startMin: 540,
    duration: 60,
    time: "15:00–16:00",
    title: "FYS · selvstr.",
    meta: "Markus R",
    stripes: [{ tier: "fys", pct: 100 }],
  },
];

const HOURS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function OkterDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <Header />
      <KpiStrip />
      <FilterBar />
      <WeekNav />
      <Calendar />
      <Legend />
    </div>
  );
}

function Header() {
  return (
    <header className="mb-6 flex items-end justify-between gap-6">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
          Coach HQ <span className="mx-2 text-muted-foreground/60">/</span> Økter
        </div>
        <h1 className="mt-2 font-display text-[30px] font-normal italic leading-[1.1] tracking-tight">
          Atten økter denne uka.
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex h-10 items-center gap-0.5 rounded-md border border-border bg-card p-1">
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-secondary px-3 text-[13px] font-medium text-foreground">
            <CalendarIcon size={14} strokeWidth={1.5} />
            Uke-kalender
          </button>
          <button className="inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-[13px] font-medium text-muted-foreground hover:text-foreground">
            <List size={14} strokeWidth={1.5} />
            Liste
          </button>
        </div>
        <button className="inline-flex h-10 items-center gap-1.5 rounded-md bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90">
          <Plus size={14} strokeWidth={1.5} />
          Ny økt
        </button>
      </div>
    </header>
  );
}

function KpiStrip() {
  return (
    <div className="mb-4 grid grid-cols-4 gap-4">
      <Kpi label="Økter denne uka" value="18" delta="+3 vs forrige uke" />
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          Snitt-pyramide
        </div>
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[22px] font-medium tabular-nums">
            TEK <span style={{ color: TIER_HEX.tek }}>32 %</span>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">5 fokus</span>
        </div>
        <div className="mt-2 flex h-2 overflow-hidden rounded">
          <div style={{ background: TIER_HEX.tek, width: "32%" }} />
          <div style={{ background: TIER_HEX.slag, width: "24%" }} />
          <div style={{ background: TIER_HEX.fys, width: "18%" }} />
          <div style={{ background: TIER_HEX.spill, width: "14%" }} />
          <div style={{ background: TIER_HEX.turn, width: "12%" }} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] text-muted-foreground">
          {(["tek", "slag", "fys", "spill", "turn"] as Tier[]).map((t) => (
            <span key={t} className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-2.5 rounded-sm"
                style={{ background: TIER_HEX[t] }}
              />
              {TIER_LABEL[t]}
            </span>
          ))}
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
          Live nå
        </div>
        <div className="flex items-center gap-2.5">
          <div className="font-mono text-[30px] font-medium tabular-nums leading-none">
            1
          </div>
          <LiveDot />
        </div>
        <div className="mt-2 font-mono text-[12px] text-destructive">
          Anders K + Markus R
        </div>
      </div>
      <Kpi label="Forfaller" value="2" delta="Ikke gjennomført" warn />
    </div>
  );
}

function Kpi({
  label,
  value,
  delta,
  warn = false,
}: {
  label: string;
  value: string;
  delta: string;
  warn?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="font-mono text-[30px] font-medium leading-none tabular-nums">
        {value}
      </div>
      <div
        className={`mt-2 font-mono text-[12px] ${warn ? "text-[#B8852A]" : "text-[#1A7D56]"}`}
      >
        {delta}
      </div>
    </div>
  );
}

function LiveDot() {
  return (
    <span className="relative inline-flex h-2 w-2">
      <span className="absolute inset-0 animate-ping rounded-full bg-destructive opacity-50" />
      <span className="relative inline-block h-2 w-2 rounded-full bg-destructive" />
    </span>
  );
}

function FilterBar() {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3">
      <div className="flex h-10 min-w-[280px] flex-1 items-center gap-2.5 rounded-md border border-border bg-background px-3.5 text-muted-foreground">
        <Search size={16} strokeWidth={1.5} />
        <input
          type="text"
          placeholder="Søk spiller, gruppe eller dato"
          className="flex-1 bg-transparent text-[14px] text-foreground outline-none"
        />
        <span className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
          ⌘K
        </span>
      </div>
      <Chip tier="fys">FYS · 3</Chip>
      <Chip tier="tek" active>
        TEK · 7
      </Chip>
      <Chip tier="slag">SLAG · 5</Chip>
      <Chip tier="spill">SPILL · 2</Chip>
      <Chip>1:1</Chip>
      <Chip>Gruppe</Chip>
      <Chip>Coach: Anders K</Chip>
    </div>
  );
}

function Chip({
  children,
  tier,
  active = false,
}: {
  children: React.ReactNode;
  tier?: Tier;
  active?: boolean;
}) {
  if (active && tier) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-white"
        style={{ background: TIER_HEX[tier] }}
      >
        {children}
      </span>
    );
  }
  if (tier) {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium"
        style={{
          background: `${TIER_HEX[tier]}14`,
          color: TIER_HEX[tier],
          borderColor: `${TIER_HEX[tier]}33`,
        }}
      >
        {children}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[13px] text-muted-foreground hover:bg-secondary">
      {children}
    </span>
  );
}

function WeekNav() {
  return (
    <div className="mb-4 flex items-center gap-3.5 rounded-lg border border-border bg-card px-4 py-3">
      <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-foreground hover:bg-secondary">
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>
      <button className="h-8 rounded-md border border-border bg-card px-3.5 text-[12px] font-medium hover:bg-secondary">
        I dag
      </button>
      <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-foreground hover:bg-secondary">
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
      <span className="font-display text-[18px] font-semibold tracking-tight">
        Uke 19{" "}
        <span className="ml-1 font-sans text-[13px] font-normal text-muted-foreground">
          · 11.–17. mai 2026
        </span>
      </span>
      <div className="ml-auto flex items-center gap-2">
        <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive bg-destructive/10 px-2.5 font-mono text-[12px] font-semibold text-destructive">
          <LiveDot />1 LIVE NÅ
        </span>
        <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12px] font-medium hover:bg-secondary">
          <SlidersHorizontal size={12} strokeWidth={1.5} />
          Pyramide-vekt
        </button>
      </div>
    </div>
  );
}

function Calendar() {
  const totalHeight = (HOURS.length - 1) * 32; // 14 timer × 32 px

  // Now-line: 13:42 → 7t 42min etter 06:00 = 462 min × PX_PER_MIN
  const nowTop = 462 * PX_PER_MIN;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div
        className="grid"
        style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
      >
        <div className="h-[60px] border-b border-r border-border/50 bg-background" />
        {DAYS.map((d) => (
          <div
            key={d.date}
            className={`h-[60px] border-b border-r border-border/50 px-3 py-2.5 ${
              d.today
                ? "bg-gradient-to-b from-accent/30 to-background"
                : "bg-background"
            }`}
          >
            <div className="font-mono text-[11px] font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {d.label}
            </div>
            <div
              className={`mt-0.5 font-mono text-[18px] font-medium leading-none ${d.today ? "text-primary" : "text-foreground"}`}
            >
              {d.date}
            </div>
            <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">
              {d.count}
            </div>
          </div>
        ))}

        {/* Time gutter */}
        <div
          className="relative border-r border-border/50 bg-background"
          style={{ height: totalHeight }}
        >
          {HOURS.map((h, i) => (
            <span
              key={h}
              className="absolute right-0 -translate-y-1.5 pr-2 text-right font-mono text-[10px] text-muted-foreground"
              style={{ top: i * 32 }}
            >
              {String(h).padStart(2, "0")}:00
            </span>
          ))}
        </div>

        {DAYS.map((day, dIdx) => (
          <div
            key={day.date}
            className={`relative border-r border-border/50 ${day.today ? "bg-accent/[0.04]" : ""}`}
            style={{
              height: totalHeight,
              backgroundImage:
                "repeating-linear-gradient(to bottom,transparent 0,transparent 31px,rgba(229,227,221,0.5) 31px,rgba(229,227,221,0.5) 32px)",
            }}
          >
            {SESSIONS.filter((s) => s.day === dIdx).map((s, i) => (
              <SessionBlock key={i} s={s} />
            ))}
            {day.today && (
              <div
                className="absolute left-0 right-0 z-10 border-t-2 border-destructive"
                style={{ top: nowTop }}
              >
                <span
                  className="absolute -left-1.5 -top-1.5 h-2 w-2 rounded-full bg-destructive"
                  style={{ boxShadow: "0 0 0 3px rgba(163,45,45,0.2)" }}
                />
                <span className="absolute right-1.5 -top-5 rounded-md bg-destructive px-1.5 py-0.5 font-mono text-[10px] font-semibold text-white">
                  13:42 LIVE
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function SessionBlock({ s }: { s: Session }) {
  const top = s.startMin * PX_PER_MIN;
  const height = s.duration * PX_PER_MIN;

  return (
    <div
      className={`absolute left-1.5 right-1.5 flex overflow-hidden rounded-md border bg-card shadow-[0_1px_2px_rgba(15,31,24,0.06)] ${
        s.live
          ? "border-destructive"
          : "border-border hover:border-primary/30"
      }`}
      style={{
        top,
        height,
        ...(s.live
          ? {
              background:
                "linear-gradient(90deg,rgba(163,45,45,0.05) 0%,#FFFFFF 60%)",
            }
          : {}),
      }}
    >
      <div className="flex w-1.5 shrink-0 flex-col">
        {s.stripes.map((st, i) => (
          <div
            key={i}
            style={{
              background: TIER_HEX[st.tier],
              height: `${st.pct}%`,
            }}
          />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden p-2">
        <span className="font-mono text-[10px] text-muted-foreground">
          {s.time}
        </span>
        <span className="truncate text-[12px] font-semibold leading-tight">
          {s.live && (
            <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-destructive align-middle" />
          )}
          {s.title}
        </span>
        <span className="truncate text-[10px] text-muted-foreground">
          {s.meta}
        </span>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-3 flex items-center gap-4 rounded-lg border border-border bg-background px-4 py-3 text-[12px] text-muted-foreground">
      {(["fys", "tek", "slag", "spill", "turn"] as Tier[]).map((t) => (
        <span key={t} className="inline-flex items-center gap-1.5">
          <span
            className="inline-block h-3.5 w-3.5 rounded-sm"
            style={{ background: TIER_HEX[t] }}
          />
          {TIER_LABEL[t]}
        </span>
      ))}
      <span className="ml-auto font-mono text-[11px]">
        Stripene viser pyramide-fordeling · klikk for detaljer
      </span>
    </div>
  );
}
