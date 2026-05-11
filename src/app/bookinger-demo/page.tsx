/**
 * CoachHQ — Bookinger (uke-kalender)
 * Bygd fra wireframe/design-files-v2/screens/04-bookinger.html (produksjons-frame 01)
 * URL: /bookinger-demo
 */

import { Search, Plus, Calendar as CalIcon, List, ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";

type EventKind = "coach" | "fac" | "gf" | "grp";

type CalEvent = {
  top: number;
  height: number;
  time: string;
  who: string;
  meta: string;
  kind: EventKind;
};

type Day = {
  short: string;
  date: string;
  count: string;
  today?: boolean;
  events: CalEvent[];
};

const days: Day[] = [
  {
    short: "Man",
    date: "11",
    count: "7 bk",
    events: [
      { top: 64, height: 60, time: "08:00–09:00", who: "GFGK team", meta: "Range · 6 spillere", kind: "grp" },
      { top: 160, height: 48, time: "11:00–12:00", who: "1:1 Markus R.", meta: "Mulligan Studio 2 · Anders K", kind: "coach" },
      { top: 288, height: 60, time: "15:00–16:00", who: "Studio 1", meta: "Emma Solberg", kind: "fac" },
      { top: 384, height: 48, time: "18:00–19:00", who: "1:1 Lina H.", meta: "Mulligan Studio 2 · Anders K", kind: "coach" },
    ],
  },
  {
    short: "Tir",
    date: "12",
    count: "6 bk",
    events: [
      { top: 96, height: 48, time: "09:00–10:00", who: "Studio 3", meta: "Joachim T.", kind: "fac" },
      { top: 224, height: 48, time: "13:00–14:00", who: "1:1 Henrik N.", meta: "Mulligan Studio 1 · Anders K", kind: "coach" },
      { top: 320, height: 108, time: "16:00–18:00", who: "18 hull · GFGK", meta: "Anna K + Mads R", kind: "gf" },
      { top: 448, height: 48, time: "20:00–21:00", who: "Studio 2", meta: "Lise S.", kind: "fac" },
    ],
  },
  {
    short: "Ons",
    date: "13",
    count: "8 bk · i dag",
    today: true,
    events: [
      { top: 96, height: 60, time: "09:00–10:00", who: "1:1 Henrik N.", meta: "Mulligan Studio 4 · Anders K", kind: "coach" },
      { top: 160, height: 60, time: "11:00–12:00", who: "Junior gruppe", meta: "Range · 5 stk", kind: "grp" },
      { top: 256, height: 48, time: "14:00–15:00", who: "Studio 1", meta: "Markus Roinås P.", kind: "fac" },
      { top: 352, height: 60, time: "17:00–18:00", who: "1:1 Mads R.", meta: "Mulligan Studio 2 · Anders K", kind: "coach" },
      { top: 480, height: 48, time: "21:00–22:00", who: "Studio 3", meta: "Jon D.", kind: "fac" },
    ],
  },
  {
    short: "Tor",
    date: "14",
    count: "7 bk",
    events: [
      { top: 64, height: 120, time: "08:00–10:00", who: "Bossum 9-hulls", meta: "Pro-grp · 4 stk", kind: "gf" },
      { top: 224, height: 48, time: "13:00–14:00", who: "Studio 4", meta: "Lina H.", kind: "fac" },
      { top: 288, height: 48, time: "15:00–16:00", who: "1:1 Emma S.", meta: "Mulligan Studio 1 · Anders K", kind: "coach" },
      { top: 384, height: 48, time: "18:00–19:00", who: "1:1 Anna K.", meta: "Mulligan Studio 2 · Anders K", kind: "coach" },
    ],
  },
  {
    short: "Fre",
    date: "15",
    count: "9 bk",
    events: [
      { top: 64, height: 48, time: "08:00–09:00", who: "1:1 Markus R.", meta: "Mulligan Studio 2 · Anders K", kind: "coach" },
      { top: 160, height: 48, time: "11:00–12:00", who: "Studio 1", meta: "Henrik N.", kind: "fac" },
      { top: 224, height: 60, time: "13:00–14:00", who: "U16 toppidrett", meta: "Range · 8 stk", kind: "grp" },
      { top: 320, height: 108, time: "16:00–18:00", who: "18 hull · GFGK", meta: "Joachim T. + 3", kind: "gf" },
      { top: 448, height: 48, time: "20:00–21:00", who: "Studio 4", meta: "Lise S.", kind: "fac" },
    ],
  },
  {
    short: "Lør",
    date: "16",
    count: "6 bk",
    events: [
      { top: 64, height: 120, time: "08:00–10:00", who: "Junior-cup", meta: "GFGK · 12 stk", kind: "gf" },
      { top: 224, height: 60, time: "13:00–14:00", who: "1:1 Lina H.", meta: "Mulligan Studio 1 · Anders K", kind: "coach" },
      { top: 320, height: 48, time: "16:00–17:00", who: "Studio 2", meta: "Emma S.", kind: "fac" },
    ],
  },
  {
    short: "Søn",
    date: "17",
    count: "4 bk",
    events: [
      { top: 128, height: 48, time: "10:00–11:00", who: "Studio 3", meta: "Jon Dahl", kind: "fac" },
      { top: 224, height: 60, time: "13:00–14:00", who: "Familie-økt", meta: "Range · 4 stk", kind: "grp" },
    ],
  },
];

const hours = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
];

export default function BookingerDemo() {
  return (
    <div className="min-h-screen bg-background p-8 text-foreground">
      {/* Header */}
      <header className="mb-6 flex items-start justify-between gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            Coach HQ · Bookinger
          </div>
          <h1 className="mt-2 font-display text-[36px] font-medium leading-[1.1] tracking-tight">
            <em className="italic text-primary">47 bookinger</em> denne uka.
          </h1>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex overflow-hidden rounded-md border border-border bg-card">
            <button className="inline-flex items-center gap-1.5 bg-foreground px-3 py-2 text-[12px] font-medium text-background">
              <LayoutGrid size={14} strokeWidth={1.5} />
              Uke-kalender
            </button>
            <button className="inline-flex items-center gap-1.5 border-l border-border px-3 py-2 text-[12px] font-medium text-muted-foreground hover:text-foreground">
              <List size={14} strokeWidth={1.5} />
              Liste
            </button>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-[12px] font-medium text-primary-foreground hover:opacity-90">
            <Plus size={14} strokeWidth={1.5} />
            Ny booking
          </button>
        </div>
      </header>

      {/* KPI strip */}
      <div className="mb-5 grid grid-cols-4 gap-3.5">
        <Kpi label="Bookinger denne uka" value="47" delta="+6 vs forrige uke" deltaTone="good" />
        <Kpi label="Belegg Mulligan 1–4" value="73 %" delta="+4 % vs forrige uke" deltaTone="good" />
        <Kpi label="Ledig kapasitet i kveld" value="6 t" delta="2 ledige slots 17–22" deltaTone="warn" />
        <Kpi label="Avlysninger siste 7d" value="3" delta="+1 vs forrige uke" deltaTone="bad" />
      </div>

      {/* Filter */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-[13px] text-muted-foreground">
          <Search size={14} strokeWidth={1.5} />
          <span className="flex-1">Søk spiller eller fasilitet</span>
          <span className="rounded-sm border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </span>
        </div>
        <Chip active>Alle typer <Count>47</Count></Chip>
        <Chip>Coaching <Count>18</Count></Chip>
        <Chip>Fasilitet <Count>14</Count></Chip>
        <Chip>Greenfee <Count>9</Count></Chip>
        <Chip>Gruppe <Count>6</Count></Chip>
        <span className="h-5 w-px bg-border" />
        <Chip>Mulligan · alle</Chip>
        <Chip>Coach: Anders K</Chip>
      </div>

      {/* Week navigation */}
      <div className="mb-3 flex items-center gap-3 rounded-md border border-border bg-card px-3 py-2">
        <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
          <ChevronLeft size={14} strokeWidth={1.5} />
        </button>
        <button className="rounded-md border border-border px-2.5 py-1 text-[12px] font-medium text-foreground hover:bg-secondary">
          I dag
        </button>
        <button className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground">
          <ChevronRight size={14} strokeWidth={1.5} />
        </button>
        <span className="font-display text-[14px] font-semibold text-foreground">
          Uke 19{" "}
          <span className="font-sans font-normal text-muted-foreground">· 11.–17. mai 2026</span>
        </span>
        <div className="ml-auto flex items-center gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-[12px] text-muted-foreground hover:text-foreground">
            <CalIcon size={13} strokeWidth={1.5} />
            13. mai
          </button>
          <button className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-[12px] text-muted-foreground hover:text-foreground">
            Vis: alle ressurser
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        {/* Day-header row */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
          <div className="border-r border-border bg-[var(--surface-alt,#F1EEE5)]" />
          {days.map((d) => (
            <div
              key={d.date}
              className={`flex flex-col items-center justify-center gap-0.5 border-r border-border py-2.5 last:border-r-0 ${
                d.today ? "bg-primary/5" : ""
              }`}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
                {d.short}
              </span>
              <span
                className={`font-display text-[20px] font-semibold leading-none ${
                  d.today ? "text-primary" : "text-foreground"
                }`}
              >
                {d.date}
              </span>
              <span className="font-mono text-[9px] tabular-nums text-muted-foreground">
                {d.count}
              </span>
            </div>
          ))}
        </div>

        {/* Time grid */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          <div className="relative border-r border-border bg-[var(--surface-alt,#F1EEE5)]" style={{ height: 608 }}>
            {hours.map((h, i) => (
              <span
                key={h}
                className="absolute right-2 font-mono text-[10px] tabular-nums text-muted-foreground"
                style={{ top: i * 32 - 6 }}
              >
                {h}
              </span>
            ))}
          </div>

          {days.map((d) => (
            <div
              key={d.date}
              className={`relative border-r border-border last:border-r-0 ${
                d.today ? "bg-primary/5" : ""
              }`}
              style={{ height: 608 }}
            >
              {/* Hour grid lines */}
              {hours.map((_, i) => (
                <div
                  key={i}
                  className="absolute left-0 right-0 border-t border-[var(--surface-alt,#F1EEE5)]"
                  style={{ top: i * 32 }}
                />
              ))}

              {/* Events */}
              {d.events.map((ev, i) => (
                <EventPill key={i} event={ev} />
              ))}

              {/* Now-line */}
              {d.today && (
                <div className="absolute left-0 right-0 z-10" style={{ top: 246 }}>
                  <div className="relative flex items-center">
                    <span className="absolute -left-2 inline-block h-2 w-2 rounded-full bg-[#A32D2D]" />
                    <span className="block h-px flex-1 bg-[#A32D2D]" />
                    <span className="absolute -top-2 right-1 rounded-sm bg-[#A32D2D] px-1 py-0.5 font-mono text-[9px] font-semibold text-white">
                      13:42
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center gap-4 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-4 py-2.5 text-[11px] text-muted-foreground">
          <Legend color="#D1F843" label="Coaching" />
          <Legend color="var(--color-primary,#005840)" label="Fasilitet" />
          <Legend color="#B8852A" label="Greenfee" />
          <Legend color="#1A7D56" label="Gruppe" />
          <span className="ml-auto font-mono text-[10px]">
            Klikk på pill for detaljer · Klikk i tom slot for å booke
          </span>
        </div>
      </div>
    </div>
  );
}

function EventPill({ event }: { event: CalEvent }) {
  const styles: Record<EventKind, string> = {
    coach: "bg-accent/40 border-l-[3px] border-l-accent text-foreground",
    fac: "bg-primary/12 border-l-[3px] border-l-primary text-primary",
    gf: "bg-[rgba(184,133,42,0.14)] border-l-[3px] border-l-[#B8852A] text-[#7d5814]",
    grp: "bg-[rgba(45,107,76,0.14)] border-l-[3px] border-l-[#1A7D56] text-[#1A7D56]",
  };
  return (
    <button
      className={`absolute left-1 right-1 flex flex-col gap-0.5 overflow-hidden rounded-md px-2 py-1.5 text-left text-[10.5px] leading-tight ${styles[event.kind]}`}
      style={{ top: event.top, height: event.height }}
    >
      <span className="font-mono text-[9px] tabular-nums opacity-80">{event.time}</span>
      <span className="font-medium text-foreground">{event.who}</span>
      <span className="font-mono text-[9px] tracking-[0.02em] text-muted-foreground">
        {event.meta}
      </span>
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  );
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
    <span className="font-mono text-[10px] font-semibold tabular-nums opacity-70">{children}</span>
  );
}

function Kpi({
  label,
  value,
  delta,
  deltaTone,
}: {
  label: string;
  value: string;
  delta: string;
  deltaTone?: "good" | "warn" | "bad";
}) {
  const tone =
    deltaTone === "good"
      ? "text-[#1A7D56]"
      : deltaTone === "warn"
        ? "text-[#B8852A]"
        : deltaTone === "bad"
          ? "text-[#A32D2D]"
          : "text-muted-foreground";
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-[32px] font-medium leading-none tracking-tight text-foreground">
        {value}
      </div>
      <div className={`font-mono text-[10px] tracking-[0.02em] ${tone}`}>{delta}</div>
    </div>
  );
}
