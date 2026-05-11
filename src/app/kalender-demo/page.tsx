/**
 * PILOT — CoachHQ Kalender · uke 21
 * Bygd direkte fra wireframe/design-files-v2/01-kalender-uke.html
 * URL: /kalender-demo
 *
 * Mock-data for uke 21 (19.–25. mai 2026), coach: Anders Kristiansen.
 * Spillere: Markus, Henrik, Anna, Mads, Lise, Joachim.
 */

import {
  ChevronLeft,
  ChevronRight,
  Download,
  Plus,
  SlidersHorizontal,
  X,
  RefreshCw,
} from "lucide-react";

const TIMES = [
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00",
];

// 1 time = 56px. 06:00 = 0px. event.top = (hour - 6) * 56.
// Eksempel: 09:00 = 168px.

type EventType = "coaching" | "group" | "booking" | "tournament" | "blocked" | "external";
type Pyr = "fys" | "tek" | "slag" | "spill" | "turn";

interface EventItem {
  type: EventType;
  top: number;
  height: number;
  time: string;
  title: string;
  sub?: string;
  pyr?: Pyr[];
  conflict?: boolean;
  conflictNote?: string;
  avatars?: { initials: string; tone?: string }[];
  bigTitle?: boolean;
}

const PYR_COLOR: Record<Pyr, string> = {
  fys: "var(--color-pyr-fys, #005840)",
  tek: "var(--color-pyr-tek, #1A7D56)",
  slag: "var(--color-pyr-slag, #D1F843)",
  spill: "var(--color-pyr-spill, #B8852A)",
  turn: "var(--color-pyr-turn, #5E5C57)",
};

// MONDAY 19. mai (i dag)
const MON: EventItem[] = [
  { type: "blocked", top: 56, height: 56, time: "07:00 – 08:00", title: "Vedlikehold · Studio 1" },
  {
    type: "coaching", top: 168, height: 56, time: "09:00 – 10:00",
    title: "Henrik Nilsen · TEK pitch", sub: "Studio 1 · 1:1", pyr: ["tek", "slag"],
  },
  {
    type: "group", top: 280, height: 84, time: "11:00 – 12:30",
    title: "WANG Toppidrett · gruppeøkt", sub: "GFGK Range · 8 spillere · FYS/TEK",
    pyr: ["fys", "tek", "slag"],
  },
  {
    type: "coaching", top: 448, height: 56, time: "14:00 – 15:00", conflict: true,
    conflictNote: "konflikt",
    title: "Markus Roinås P · SPILL", sub: "Studio 2 · 1:1 · dobbeltbooket",
    pyr: ["slag", "spill"],
  },
  {
    type: "booking", top: 532, height: 42, time: "15:30 – 16:15",
    title: "Joachim Tangen · TrackMan", sub: "GFGK · booking",
  },
  {
    type: "coaching", top: 616, height: 56, time: "16:00 – 17:00",
    title: "Lise Sandberg · putte-økt", sub: "WANG-hallen · 1:1", pyr: ["tek"],
  },
  {
    type: "external", top: 784, height: 56, time: "19:00 – 20:00",
    title: "Familiemiddag", sub: "Google · privat",
  },
];

// TUESDAY 20. mai
const TUE: EventItem[] = [
  { type: "coaching", top: 112, height: 56, time: "08:00 – 09:00", title: "Anna Karlsen · jern", sub: "Studio 1", pyr: ["tek"] },
  { type: "booking", top: 224, height: 42, time: "10:00 – 10:45", title: "Joachim T · sim", sub: "Mulligan" },
  { type: "coaching", top: 336, height: 56, time: "12:00 – 13:00", title: "Mads Rønning · driver", sub: "GFGK · 1:1", pyr: ["slag"] },
  { type: "group", top: 448, height: 84, time: "14:00 – 15:30", title: "Elite-laget", sub: "5 spillere · WANG", pyr: ["tek", "fys"] },
  { type: "coaching", top: 560, height: 56, time: "16:00 – 17:00", title: "Lise Sandberg · TEK", sub: "Studio 2", pyr: ["tek", "slag"] },
  { type: "coaching", top: 672, height: 56, time: "18:00 – 19:00", title: "Henrik Nilsen · FYS", sub: "GFGK gym", pyr: ["fys"] },
  { type: "external", top: 784, height: 56, time: "19:00 – 20:00", title: "Trener-møte", sub: "Google" },
];

// WEDNESDAY 21. mai
const WED: EventItem[] = [
  { type: "coaching", top: 56, height: 56, time: "07:00 – 08:00", title: "Markus R · morgen", sub: "Studio 1", pyr: ["tek"] },
  { type: "coaching", top: 168, height: 84, time: "09:00 – 10:30", title: "Anna Karlsen · spillsim", sub: "Mulligan · 1:1", pyr: ["slag", "spill"] },
  { type: "group", top: 280, height: 84, time: "11:00 – 12:30", title: "GFGK Junior", sub: "12 spillere · Range", pyr: ["fys", "tek"] },
  { type: "booking", top: 392, height: 56, time: "13:00 – 14:00", title: "TrackMan-leie", sub: "Ekstern · 1 600 kr" },
  { type: "coaching", top: 504, height: 56, time: "15:00 – 16:00", title: "Joachim T · jern", sub: "GFGK", pyr: ["tek"] },
  { type: "coaching", top: 616, height: 56, time: "17:00 – 18:00", title: "Mads Rønning", sub: "Studio 2", pyr: ["slag"] },
  { type: "coaching", top: 700, height: 56, time: "18:30 – 19:30", title: "Lise Sandberg", sub: "WANG", pyr: ["tek"] },
  { type: "blocked", top: 812, height: 56, time: "20:30 – 21:30", title: "Sperret" },
];

// THURSDAY 22. mai (full-dag turnering)
const THU: EventItem[] = [
  {
    type: "tournament", top: 168, height: 224, time: "09:00 – 16:00 · hele dagen",
    title: "NGF TrackMan-test", sub: "Elite + A-lag · GFGK Range", bigTitle: true,
    avatars: [
      { initials: "MP" }, { initials: "HN" }, { initials: "MR" }, { initials: "AK" }, { initials: "+8" },
    ],
  },
  { type: "coaching", top: 448, height: 56, time: "17:00 – 18:00", title: "Henrik Nilsen", sub: "Studio 1", pyr: ["tek"] },
  { type: "coaching", top: 560, height: 56, time: "19:00 – 20:00", title: "Anna Karlsen · FYS", sub: "GFGK gym", pyr: ["fys"] },
];

// FRIDAY 23. mai
const FRI: EventItem[] = [
  { type: "coaching", top: 112, height: 56, time: "08:00 – 09:00", title: "Markus R", sub: "Studio 1", pyr: ["tek"] },
  { type: "booking", top: 224, height: 56, time: "10:00 – 11:00", title: "Sim-leie · Bossum", sub: "2 spillere · 800 kr" },
  { type: "coaching", top: 336, height: 56, time: "12:00 – 13:00", title: "Henrik Nilsen", sub: "GFGK", pyr: ["slag"] },
  { type: "group", top: 448, height: 56, time: "14:00 – 15:00", title: "Akademi · TEK", sub: "6 spillere · WANG", pyr: ["tek", "slag"] },
  { type: "coaching", top: 560, height: 56, time: "16:00 – 17:00", title: "Lise Sandberg", sub: "Studio 2", pyr: ["spill"] },
  { type: "coaching", top: 672, height: 56, time: "18:00 – 19:00", title: "Mads Rønning", sub: "GFGK", pyr: ["tek"] },
];

// SATURDAY 24. mai (helg)
const SAT: EventItem[] = [
  {
    type: "group", top: 224, height: 112, time: "10:00 – 12:00",
    title: "Junior-camp 1 av 2", sub: "14 spillere · Range",
    pyr: ["fys", "tek", "slag"],
    avatars: [{ initials: "MR" }, { initials: "EK" }, { initials: "SB" }, { initials: "+11" }],
  },
  { type: "coaching", top: 392, height: 56, time: "13:00 – 14:00", title: "Anna Karlsen", sub: "Studio 1", pyr: ["tek"] },
  { type: "external", top: 504, height: 56, time: "15:00 – 16:00", title: "Tannlege", sub: "Google · privat" },
];

// SUNDAY 25. mai (helg)
const SUN: EventItem[] = [
  {
    type: "blocked", top: 0, height: 952, time: "Hele dagen",
    title: "Pinsedag · stengt", sub: "Helligdag — ingen økter",
  },
];

const DAYS = [
  { dow: "Mandag", date: 19, count: 6, today: true, weekend: false, events: MON },
  { dow: "Tirsdag", date: 20, count: 7, today: false, weekend: false, events: TUE },
  { dow: "Onsdag", date: 21, count: 8, today: false, weekend: false, events: WED },
  { dow: "Torsdag", date: 22, count: 5, today: false, weekend: false, events: THU },
  { dow: "Fredag", date: 23, count: 6, today: false, weekend: false, events: FRI },
  { dow: "Lørdag", date: 24, count: 4, today: false, weekend: true, events: SAT },
  { dow: "Søndag", date: 25, count: 2, today: false, weekend: true, events: SUN },
];

export default function KalenderDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Page header */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
            /admin/kalender
          </span>
          <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
            Kalender <em className="font-medium italic text-muted-foreground">· uke 21</em>
          </h1>
          <p className="mt-1.5 font-display italic text-[15px] text-muted-foreground">
            Uke 21. 38 events på timeplanen.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            <Download className="h-4 w-4" /> Eksporter
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-[13px] font-medium text-accent-foreground transition-opacity hover:opacity-90">
            <Plus className="h-4 w-4" /> Ny økt
          </button>
        </div>
      </header>

      {/* KPI strip */}
      <section className="mb-4 grid gap-3" style={{ gridTemplateColumns: "1.3fr 1fr 1fr 1fr" }}>
        <div className="rounded-lg bg-foreground p-4 text-[var(--surface,#FAFAF7)]">
          <div className="font-mono text-[10px] uppercase tracking-[0.10em]" style={{ color: "rgba(255,255,255,0.6)" }}>
            I dag · mandag 19. mai
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <div className="font-mono text-[28px] font-medium tabular-nums leading-none">
              6 <small className="text-[14px]" style={{ color: "rgba(255,255,255,0.7)" }}>events</small>
            </div>
          </div>
          <div className="mt-2.5 flex gap-2.5 text-[12px]" style={{ color: "rgba(255,255,255,0.7)" }}>
            <span><b className="font-mono font-medium text-accent">3</b> coaching</span>
            <span><b className="font-mono font-medium text-accent">2</b> bookinger</span>
            <span><b className="font-mono font-medium text-accent">1</b> gruppe</span>
          </div>
        </div>
        <Kpi label="Events denne uka" value="38" meta="+4 vs forrige" metaTone="success" />
        <Kpi label="Fri-tid i kveld" value="2t" valueSmall=" 30m" meta="Etter 18:30" />
        <Kpi label="Konflikter" value="1" valueTone="danger" metaPill="Markus R · 14:00" />
      </section>

      {/* Calendar toolbar */}
      <div className="mb-4 flex items-center gap-4 rounded-xl border border-border bg-card px-4.5 py-3.5">
        <div className="inline-flex items-center gap-1 rounded-[10px] border border-border bg-secondary p-[3px]">
          <button className="grid h-7 w-[30px] place-items-center rounded-[7px] text-muted-foreground transition-colors hover:bg-card hover:text-foreground" aria-label="Forrige uke">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button className="rounded-[7px] px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-card">
            I dag
          </button>
          <button className="grid h-7 w-[30px] place-items-center rounded-[7px] text-muted-foreground transition-colors hover:bg-card hover:text-foreground" aria-label="Neste uke">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-col gap-px">
          <div className="flex items-baseline gap-2.5">
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
              Uke 21
            </span>
            <span className="font-display text-[18px] font-semibold tracking-tight">
              19.–25. mai 2026
            </span>
          </div>
          <div className="font-mono text-[12px] text-muted-foreground">v21 · uke 21/52 · 38 events</div>
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-px rounded-md border border-border bg-secondary p-0.5 text-[12px]">
            {["Dag", "Uke", "Måned", "Agenda"].map((seg) => (
              <button
                key={seg}
                className={`rounded-[6px] px-2.5 py-1.5 transition-colors ${
                  seg === "Uke"
                    ? "bg-card font-medium text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {seg}
              </button>
            ))}
          </div>
          <div className="h-6 w-px bg-border" />
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filtre
          </button>
        </div>
      </div>

      {/* Chip row */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Chip active>Alle typer <Count>38</Count></Chip>
        <Chip>Coaching <Count>18</Count></Chip>
        <Chip>Gruppe <Count>6</Count></Chip>
        <Chip>Booking <Count>9</Count></Chip>
        <Chip>Turnering <Count>2</Count></Chip>
        <Chip>Privat <Count>3</Count></Chip>
        <span className="mx-1 h-5 w-px bg-border" />
        <Chip closeable>Coach: Anders</Chip>
      </div>

      {/* Main grid: kalender + drawer */}
      <div className="grid items-start gap-6" style={{ gridTemplateColumns: "1fr 304px" }}>
        {/* Week card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div
            className="relative grid"
            style={{ gridTemplateColumns: "64px repeat(7, 1fr)" }}
          >
            {/* Header row */}
            <div className="sticky top-0 z-[4] border-b border-border bg-card px-3 pt-3.5 pb-3" style={{ borderRight: "1px solid var(--color-line-soft, var(--border))" }} />
            {DAYS.map((d, i) => (
              <div
                key={d.dow}
                className={`sticky top-0 z-[4] flex flex-col gap-0.5 border-b border-border px-3 pt-3.5 pb-3 ${
                  d.today ? "bg-accent" : d.weekend ? "bg-secondary" : "bg-card"
                }`}
                style={{ borderRight: i < 6 ? "1px solid var(--color-line-soft, var(--border))" : undefined }}
              >
                <span
                  className={`font-mono text-[11px] font-semibold uppercase tracking-[0.06em] ${
                    d.today ? "text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  {d.dow}
                </span>
                <span
                  className={`font-display text-[22px] font-semibold leading-none tracking-tight ${
                    d.today ? "inline-flex items-center gap-1.5 text-accent-foreground" : "text-foreground"
                  }`}
                >
                  {d.date}
                  {d.date === 19 && (
                    <small className="ml-1 font-mono text-[10px] font-normal text-muted-foreground">mai</small>
                  )}
                  {d.today && <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary" />}
                </span>
                <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">{d.count} events</span>
              </div>
            ))}

            {/* Time column */}
            <div className="border-r border-border bg-card">
              {TIMES.map((t, i) => (
                <div
                  key={t}
                  className={`relative h-14 border-b pr-2 pt-1 text-right font-mono text-[11px] ${
                    i % 2 === 1 ? "text-[var(--color-ink-disabled,#C4C0B8)]" : "text-muted-foreground"
                  }`}
                  style={{ borderColor: "var(--color-line-soft, var(--border))" }}
                >
                  {t}
                </div>
              ))}
            </div>

            {/* Day columns */}
            {DAYS.map((d, idx) => (
              <DayColumn key={d.dow} day={d} isLast={idx === DAYS.length - 1} />
            ))}
          </div>
        </div>

        {/* Right drawer */}
        <aside className="sticky top-6 flex flex-col gap-4">
          <MiniCalCard />
          <CalendarTogglesCard />
          <SyncCard />
          <PyramideLegendCard />
        </aside>
      </div>

      <footer className="mt-10 flex justify-between border-t border-border pt-6 text-[12px] text-muted-foreground">
        <span>AK Golf Platform · CoachHQ · /admin/kalender</span>
        <span className="font-mono">Uke 21/52 · v2.4.1 · 19. mai 2026 14:35</span>
      </footer>
    </div>
  );
}

/* ---------------- Components ---------------- */

function Kpi({
  label, value, valueSmall, meta, metaTone, metaPill, valueTone,
}: {
  label: string;
  value: string;
  valueSmall?: string;
  meta?: string;
  metaTone?: "success" | "muted";
  metaPill?: string;
  valueTone?: "danger";
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">{label}</div>
      <div
        className={`mt-2 font-mono text-[28px] font-medium tabular-nums leading-none ${
          valueTone === "danger" ? "text-[var(--color-status-danger,#A32D2D)]" : "text-foreground"
        }`}
      >
        {value}
        {valueSmall && <small className="ml-0.5 text-[14px] text-muted-foreground">{valueSmall}</small>}
      </div>
      <div className="mt-2.5 text-[12px] text-muted-foreground">
        {metaPill ? (
          <span
            className="inline-flex h-5 items-center rounded-full bg-[#FAD9D9] px-2 text-[11px] font-medium"
            style={{ color: "var(--color-status-danger, #A32D2D)" }}
          >
            {metaPill}
          </span>
        ) : meta ? (
          <span className={metaTone === "success" ? "text-[var(--status-success,#1A7D56)]" : "text-muted-foreground"}>
            {meta}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function Chip({
  children, active, closeable,
}: { children: React.ReactNode; active?: boolean; closeable?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] font-medium transition-colors ${
        active
          ? "border-foreground bg-foreground text-[var(--surface,#FAFAF7)]"
          : "border-border bg-card text-foreground hover:bg-secondary"
      }`}
    >
      {children}
      {closeable && <X className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100" />}
    </span>
  );
}

function Count({ children }: { children: React.ReactNode }) {
  return (
    <span className="ml-0.5 font-mono text-[11px] opacity-60">{children}</span>
  );
}

function DayColumn({ day, isLast }: { day: typeof DAYS[number]; isLast: boolean }) {
  return (
    <div
      className={`relative ${day.today ? "" : day.weekend ? "bg-secondary" : "bg-card"}`}
      style={{
        backgroundColor: day.today ? "rgba(209,248,67,0.05)" : undefined,
        borderRight: isLast ? undefined : "1px solid var(--color-line-soft, var(--border))",
      }}
    >
      {/* Hourly slots */}
      {TIMES.map((_, i) => (
        <div
          key={i}
          className="h-14"
          style={{
            borderBottom: i % 2 === 1
              ? "1px dashed var(--color-line-soft, var(--border))"
              : "1px solid var(--color-line-soft, var(--border))",
          }}
        />
      ))}

      {/* Events */}
      {day.events.map((ev, i) => (
        <EventCard key={i} ev={ev} />
      ))}

      {/* Now-line on today */}
      {day.today && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-[3] h-0.5"
          style={{ top: 482, background: "var(--color-status-danger, #A32D2D)" }}
        >
          <span
            className="absolute -left-1 -top-1 h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--color-status-danger, #A32D2D)" }}
          />
          <span
            className="absolute -top-2 rounded font-mono text-[10px] font-semibold"
            style={{
              left: -54,
              padding: "2px 4px",
              background: "var(--card)",
              color: "var(--color-status-danger, #A32D2D)",
            }}
          >
            14:35
          </span>
        </div>
      )}
    </div>
  );
}

function EventCard({ ev }: { ev: EventItem }) {
  const isTournament = ev.type === "tournament";
  const isBlocked = ev.type === "blocked";
  const isExternal = ev.type === "external";

  let bg = "var(--card)";
  let border = "1px solid var(--border)";
  let textColor = "var(--foreground)";
  let timeColor = "var(--muted-foreground)";
  let subColor = "var(--muted-foreground)";

  if (ev.type === "coaching") {
    bg = "var(--color-accent-soft, rgba(209,248,67,0.18))";
    border = "1px solid rgba(184, 200, 90, 0.4)";
  } else if (ev.type === "group") {
    bg = "var(--color-brand-primary-soft, rgba(0,88,64,0.08))";
    border = "1px solid rgba(0, 88, 64, 0.18)";
  } else if (ev.type === "booking") {
    bg = "#FFF6E5";
    border = "1px solid rgba(184, 133, 42, 0.25)";
  } else if (ev.type === "tournament") {
    bg = "var(--foreground)";
    border = "1px solid var(--foreground)";
    textColor = "var(--surface, #FAFAF7)";
    timeColor = "rgba(255,255,255,0.65)";
    subColor = "rgba(255,255,255,0.7)";
  } else if (ev.type === "blocked") {
    bg = "repeating-linear-gradient(135deg, var(--secondary) 0 6px, var(--card) 6px 12px)";
    border = "1px solid var(--border)";
  } else if (ev.type === "external") {
    bg = "var(--card)";
    border = "1px dashed var(--muted-foreground)";
    textColor = "var(--muted-foreground)";
  }

  const ringStyle = ev.conflict
    ? { boxShadow: "0 0 0 2px var(--color-status-danger, #A32D2D)" }
    : { boxShadow: "0 1px 2px rgba(15,31,24,0.04)" };

  // Left accent bar (4px)
  let leftBar: React.ReactNode = null;
  if (ev.type === "booking") {
    leftBar = (
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: "var(--color-pyr-spill, #B8852A)" }}
      />
    );
  } else if (isTournament) {
    leftBar = (
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: "var(--color-accent, #D1F843)" }}
      />
    );
  } else if (isBlocked) {
    leftBar = (
      <span
        className="absolute left-0 top-0 bottom-0 w-1"
        style={{ background: "var(--muted-foreground)" }}
      />
    );
  } else if (ev.pyr && ev.pyr.length > 0) {
    leftBar = (
      <span className="absolute left-0 top-0 bottom-0 flex w-1 flex-col">
        {ev.pyr.map((p, i) => (
          <span key={i} className="flex-1" style={{ background: PYR_COLOR[p] }} />
        ))}
      </span>
    );
  }

  return (
    <div
      className="absolute left-1.5 right-1.5 flex flex-col gap-0.5 overflow-hidden rounded-[10px] py-2 pl-3.5 pr-2.5 transition-shadow hover:shadow-md"
      style={{
        top: ev.top,
        height: ev.height,
        background: bg,
        border,
        color: textColor,
        ...ringStyle,
      }}
    >
      {leftBar}
      <div className="font-mono text-[11px] -tracking-[0.01em]" style={{ color: timeColor }}>
        {ev.time}
        {ev.conflict && ev.conflictNote && (
          <span style={{ color: "var(--color-status-danger, #A32D2D)" }}> · {ev.conflictNote}</span>
        )}
      </div>
      <div
        className={`font-semibold leading-[1.25] -tracking-[0.005em] ${
          ev.bigTitle ? "text-[14px]" : "text-[12.5px]"
        } ${isBlocked ? "font-medium italic" : ""}`}
        style={{
          color: isExternal
            ? "var(--muted-foreground)"
            : isBlocked
              ? "var(--muted-foreground)"
              : textColor,
        }}
      >
        {ev.title}
      </div>
      {ev.sub && (
        <div className="text-[11px] leading-[1.2]" style={{ color: subColor }}>
          {ev.sub}
        </div>
      )}
      {ev.avatars && ev.avatars.length > 0 && (
        <div className="mt-auto pt-2">
          <div className="flex -space-x-1.5">
            {ev.avatars.map((a, i) => (
              <span
                key={i}
                className={`grid h-6 w-6 place-items-center rounded-full border-2 font-mono text-[9px] font-semibold ${
                  a.initials.startsWith("+")
                    ? "bg-card text-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
                style={{ borderColor: isTournament ? "var(--foreground)" : "var(--card)" }}
              >
                {a.initials}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- Drawer cards ---------------- */

function MiniCalCard() {
  // Mai 2026 mini-cal. May 1 2026 = Fri.
  // Mandag-start layout. Forrige: 28, 29, 30 (april).
  const prev = [28, 29, 30];
  const days: number[] = Array.from({ length: 31 }, (_, i) => i + 1);
  const todayDate = 19;
  const selected = new Set([20, 21, 22, 23, 24, 25]);
  const hasEvents = new Set([
    1, 2, 5, 6, 7, 8, 9,
    11, 12, 13, 14, 15, 16,
    18, 19, 20, 21, 22, 23,
    25, 26, 27, 28, 29, 31,
  ]);

  return (
    <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
      <div className="mb-2.5 flex items-center justify-between">
        <h4 className="font-display text-[14px] font-semibold">Mai 2026</h4>
        <div className="flex gap-2">
          <button className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary">
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button className="grid h-6 w-6 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary">
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {["M", "T", "O", "T", "F", "L", "S"].map((d, i) => (
          <div key={i} className="py-1 text-center font-mono text-[10px] font-medium text-muted-foreground">
            {d}
          </div>
        ))}
        {prev.map((d) => (
          <div
            key={`p-${d}`}
            className="grid aspect-square place-items-center rounded-md font-mono text-[11px] text-[var(--color-ink-disabled,#C4C0B8)]"
          >
            {d}
          </div>
        ))}
        {days.map((d) => {
          const isToday = d === todayDate;
          const isSelected = selected.has(d);
          const dot = hasEvents.has(d);
          return (
            <div
              key={d}
              className={`relative grid aspect-square cursor-pointer place-items-center rounded-md font-mono text-[11px] transition-colors ${
                isToday
                  ? "bg-accent font-semibold text-accent-foreground shadow-[0_0_0_4px_rgba(209,248,67,0.25)]"
                  : isSelected
                    ? "bg-foreground font-semibold text-[var(--surface,#FAFAF7)]"
                    : "text-foreground hover:bg-secondary"
              }`}
            >
              {d}
              {dot && (
                <span
                  className="absolute bottom-0.5 h-[3px] w-[3px] rounded-full"
                  style={{
                    background: isToday
                      ? "var(--accent-foreground)"
                      : "var(--color-brand-primary, var(--primary))",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CalendarTogglesCard() {
  const rows: { swatch: React.CSSProperties; label: string; count: number; checked: boolean }[] = [
    {
      swatch: { background: "var(--color-accent-soft, rgba(209,248,67,0.18))", border: "1px solid rgba(184, 200, 90, 0.5)" },
      label: "Coaching · 1:1", count: 18, checked: true,
    },
    {
      swatch: { background: "var(--color-brand-primary-soft, rgba(0,88,64,0.08))", border: "1px solid rgba(0, 88, 64, 0.3)" },
      label: "Gruppe-økter", count: 6, checked: true,
    },
    {
      swatch: { background: "#FFF6E5", border: "1px solid rgba(184, 133, 42, 0.35)" },
      label: "Bookinger", count: 9, checked: true,
    },
    {
      swatch: { background: "var(--foreground)" },
      label: "Turneringer", count: 2, checked: true,
    },
    {
      swatch: { background: "var(--card)", border: "1px dashed var(--muted-foreground)" },
      label: "Google Calendar", count: 3, checked: true,
    },
    {
      swatch: { background: "repeating-linear-gradient(135deg, var(--secondary) 0 3px, var(--card) 3px 6px)", border: "1px solid var(--border)" },
      label: "Sperret", count: 3, checked: false,
    },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
      <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Vis kalendere
      </div>
      <div>
        {rows.map((r, i) => (
          <label
            key={r.label}
            className={`flex items-center gap-2.5 py-2 text-[13px] text-foreground ${
              i > 0 ? "border-t border-[var(--color-line-soft,var(--border))]" : ""
            }`}
          >
            <span
              className={`grid h-4 w-4 flex-shrink-0 place-items-center rounded-[5px] border-[1.5px] ${
                r.checked ? "border-foreground bg-foreground" : "border-border bg-card"
              }`}
            >
              {r.checked && (
                <span className="text-[10px] leading-none text-[var(--surface,#FAFAF7)]">✓</span>
              )}
            </span>
            <span className="h-2.5 w-2.5 flex-shrink-0 rounded-[3px]" style={r.swatch} />
            <span>{r.label}</span>
            <span className="ml-auto font-mono text-[11px] text-muted-foreground">{r.count}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function SyncCard() {
  return (
    <div
      className="rounded-2xl border border-border p-4"
      style={{ background: "var(--color-brand-primary-soft, rgba(0,88,64,0.08))" }}
    >
      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: "var(--status-success, #1A7D56)" }}
        />
        Sist synket · 14:28
      </div>
      <div className="mt-1.5 mb-0.5 font-display text-[15px] font-semibold">Google Calendar</div>
      <div className="mb-3 text-[12px] text-muted-foreground">3 eksterne events synket · 0 konflikter</div>
      <button className="inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] font-medium text-foreground transition-colors hover:bg-secondary">
        <RefreshCw className="h-3.5 w-3.5" /> Synk nå
      </button>
    </div>
  );
}

function PyramideLegendCard() {
  const items: { color: string; label: string; full?: boolean }[] = [
    { color: PYR_COLOR.fys, label: "FYS" },
    { color: PYR_COLOR.tek, label: "TEK" },
    { color: PYR_COLOR.slag, label: "SLAG" },
    { color: PYR_COLOR.spill, label: "SPILL" },
    { color: PYR_COLOR.turn, label: "TURN", full: true },
  ];
  return (
    <div className="rounded-2xl border border-border bg-card p-4.5 shadow-sm">
      <div className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Pyramide-stripe
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-center gap-2 text-[12px] text-muted-foreground"
            style={it.full ? { gridColumn: "1 / span 2" } : undefined}
          >
            <span className="inline-block h-4 w-2 rounded-sm" style={{ background: it.color }} />
            {it.label}
          </div>
        ))}
      </div>
      <div className="mt-2.5 text-[11px] leading-[1.4] text-muted-foreground">
        Stripe-segmenter viser fokus-fordeling per økt. Hover for detalj.
      </div>
    </div>
  );
}
