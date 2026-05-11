/**
 * PILOT — CoachHQ Kalender · Maaned
 * Bygd direkte fra wireframe/design-files-v2/07-kalender-maaned.html
 * URL: /kalender-maaned-demo
 *
 * Mai 2026. Coach: Anders Kristiansen. Bytt til Prisma-henting senere.
 */

import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

type DayEvent = {
  time: string;
  label: string;
  tone: "own" | "others" | "group" | "block";
};

type Day = {
  num: number;
  outside?: boolean;
  weekend?: boolean;
  today?: boolean;
  util?: number; // 0-100, badge
  events?: DayEvent[];
  more?: number;
  ind?: ("on" | "warn" | "off")[];
};

type Week = { wk: number; current?: boolean; days: Day[] };

const weeks: Week[] = [
  {
    wk: 18,
    days: [
      { num: 27, outside: true },
      { num: 28, outside: true },
      { num: 29, outside: true },
      { num: 30, outside: true },
      {
        num: 1,
        util: 12,
        events: [{ time: "10", label: "off · helligdag", tone: "others" }],
        ind: ["off", "off", "off", "off"],
      },
      {
        num: 2,
        weekend: true,
        util: 42,
        events: [
          { time: "10", label: "Markus Roinås P.", tone: "own" },
          { time: "13", label: "GFGK Junior · ekstra", tone: "group" },
        ],
        ind: ["on", "on", "off", "off"],
      },
      {
        num: 3,
        weekend: true,
        util: 8,
        events: [{ time: "—", label: "fri", tone: "block" }],
        ind: ["off", "off", "off", "off"],
      },
    ],
  },
  {
    wk: 19,
    days: [
      {
        num: 4,
        util: 52,
        events: [
          { time: "08", label: "Eline Krogh", tone: "own" },
          { time: "10", label: "Sondre Berg", tone: "own" },
          { time: "14", label: "Stine · Studio 3", tone: "others" },
        ],
        more: 2,
        ind: ["on", "on", "on", "off"],
      },
      {
        num: 5,
        util: 48,
        events: [
          { time: "09", label: "Astrid Kvam", tone: "own" },
          { time: "16", label: "WANG · gruppe", tone: "group" },
          { time: "18", label: "Bjørn · Studio 2", tone: "others" },
        ],
        ind: ["on", "on", "off", "off"],
      },
      {
        num: 6,
        util: 78,
        events: [
          { time: "10", label: "Mathias Pedersen", tone: "own" },
          { time: "13", label: "Henrik Norvik", tone: "own" },
          { time: "17", label: "A-lag · slag", tone: "group" },
        ],
        more: 3,
        ind: ["on", "on", "on", "on"],
      },
      {
        num: 7,
        util: 62,
        events: [
          { time: "09", label: "Maja Tangen", tone: "own" },
          { time: "16", label: "Junior · putting", tone: "group" },
          { time: "19", label: "Bjørn · Studio 1", tone: "others" },
        ],
        ind: ["on", "on", "on", "off"],
      },
      {
        num: 8,
        util: 82,
        events: [
          { time: "08", label: "Jakob Tønsberg", tone: "own" },
          { time: "11", label: "Eline Krogh", tone: "own" },
          { time: "15", label: "Sondre Berg", tone: "own" },
        ],
        more: 4,
        ind: ["on", "on", "on", "on"],
      },
      {
        num: 9,
        weekend: true,
        util: 54,
        events: [{ time: "10", label: "KM Eklund · turnering", tone: "group" }],
        ind: ["on", "on", "off", "off"],
      },
      {
        num: 10,
        weekend: true,
        util: 22,
        events: [{ time: "10", label: "Maja Tangen · alt", tone: "own" }],
        ind: ["on", "off", "off", "off"],
      },
    ],
  },
  {
    wk: 20,
    current: true,
    days: [
      {
        num: 11,
        util: 72,
        events: [
          { time: "08", label: "Mathias Pedersen", tone: "own" },
          { time: "11", label: "Astrid Kvam", tone: "own" },
          { time: "17", label: "A-lag", tone: "group" },
        ],
        more: 3,
        ind: ["on", "on", "on", "on"],
      },
      {
        num: 12,
        util: 58,
        events: [
          { time: "09", label: "Eline Krogh", tone: "own" },
          { time: "14", label: "Sondre Berg", tone: "own" },
          { time: "18", label: "Stine · Studio 3", tone: "others" },
        ],
        ind: ["on", "on", "on", "off"],
      },
      {
        num: 13,
        util: 88,
        events: [
          { time: "07", label: "Markus Roinås P.", tone: "own" },
          { time: "10", label: "Henrik Norvik", tone: "own" },
          { time: "17", label: "WANG · ekstra", tone: "group" },
        ],
        more: 5,
        ind: ["on", "on", "on", "on"],
      },
      {
        num: 14,
        today: true,
        util: 82,
        events: [
          { time: "09", label: "Mathias Pedersen", tone: "own" },
          { time: "11", label: "Astrid Kvam", tone: "own" },
          { time: "15", label: "Junior · slag", tone: "group" },
          { time: "17", label: "A-lag · slag", tone: "own" },
        ],
        more: 2,
        ind: ["on", "on", "on", "on"],
      },
      {
        num: 15,
        util: 96,
        events: [
          { time: "08", label: "Jakob Tønsberg", tone: "own" },
          { time: "11", label: "Eline Krogh", tone: "own" },
          { time: "14", label: "KM · forberedelse", tone: "group" },
        ],
        more: 6,
        ind: ["on", "on", "on", "warn"],
      },
      {
        num: 16,
        weekend: true,
        util: 74,
        events: [
          { time: "09", label: "KM Eklund · dag 1", tone: "group" },
          { time: "15", label: "debrief A-lag", tone: "own" },
        ],
        ind: ["on", "on", "on", "off"],
      },
      {
        num: 17,
        weekend: true,
        util: 48,
        events: [{ time: "09", label: "KM Eklund · dag 2", tone: "group" }],
        ind: ["on", "on", "off", "off"],
      },
    ],
  },
  {
    wk: 21,
    days: [
      {
        num: 18,
        util: 42,
        events: [
          { time: "10", label: "Maja Tangen", tone: "own" },
          { time: "14", label: "Sondre Berg", tone: "own" },
        ],
        ind: ["on", "on", "off", "off"],
      },
      {
        num: 19,
        util: 56,
        events: [
          { time: "09", label: "Astrid Kvam", tone: "own" },
          { time: "12", label: "Bjørn · Studio 2", tone: "others" },
          { time: "16", label: "Akademi", tone: "group" },
        ],
        ind: ["on", "on", "off", "off"],
      },
      {
        num: 20,
        util: 68,
        events: [
          { time: "08", label: "Mathias Pedersen", tone: "own" },
          { time: "11", label: "Henrik Norvik", tone: "own" },
          { time: "17", label: "A-lag", tone: "group" },
        ],
        ind: ["on", "on", "on", "off"],
      },
      {
        num: 21,
        util: 52,
        events: [
          { time: "09", label: "Eline Krogh", tone: "own" },
          { time: "14", label: "Markus Roinås", tone: "own" },
        ],
        ind: ["on", "on", "off", "off"],
      },
      {
        num: 22,
        util: 78,
        events: [
          { time: "08", label: "Jakob Tønsberg", tone: "own" },
          { time: "11", label: "Sondre Berg", tone: "own" },
          { time: "16", label: "WANG", tone: "group" },
        ],
        more: 3,
        ind: ["on", "on", "on", "on"],
      },
      {
        num: 23,
        weekend: true,
        util: 28,
        events: [{ time: "10", label: "Per Fjellstad · fitting", tone: "own" }],
        ind: ["on", "off", "off", "off"],
      },
      {
        num: 24,
        weekend: true,
        util: 14,
        events: [{ time: "—", label: "fri", tone: "block" }],
        ind: ["off", "off", "off", "off"],
      },
    ],
  },
  {
    wk: 22,
    days: [
      {
        num: 25,
        util: 46,
        events: [
          { time: "10", label: "Maja Tangen", tone: "own" },
          { time: "14", label: "Eline Krogh", tone: "own" },
        ],
        ind: ["on", "on", "off", "off"],
      },
      {
        num: 26,
        util: 52,
        events: [
          { time: "09", label: "Astrid Kvam", tone: "own" },
          { time: "15", label: "Mathias Pedersen", tone: "own" },
          { time: "17", label: "Akademi", tone: "group" },
        ],
        ind: ["on", "on", "on", "off"],
      },
      {
        num: 27,
        util: 68,
        events: [
          { time: "08", label: "Henrik Norvik", tone: "own" },
          { time: "11", label: "Sondre Berg", tone: "own" },
          { time: "17", label: "A-lag", tone: "group" },
        ],
        ind: ["on", "on", "on", "off"],
      },
      {
        num: 28,
        util: 54,
        events: [
          { time: "09", label: "Markus Roinås", tone: "own" },
          { time: "12", label: "Stine · Studio 3", tone: "others" },
          { time: "15", label: "Eline Krogh", tone: "own" },
        ],
        ind: ["on", "on", "on", "off"],
      },
      {
        num: 29,
        util: 72,
        events: [
          { time: "08", label: "Jakob Tønsberg", tone: "own" },
          { time: "11", label: "Mathias Pedersen", tone: "own" },
          { time: "16", label: "WANG · slag", tone: "group" },
        ],
        more: 2,
        ind: ["on", "on", "on", "on"],
      },
      {
        num: 30,
        weekend: true,
        util: 42,
        events: [
          { time: "10", label: "Astrid Kvam", tone: "own" },
          { time: "14", label: "Junior · ekstra", tone: "group" },
        ],
        ind: ["on", "on", "off", "off"],
      },
      {
        num: 31,
        weekend: true,
        util: 18,
        events: [{ time: "—", label: "fri", tone: "block" }],
        ind: ["off", "off", "off", "off"],
      },
    ],
  },
];

export default function KalenderMaanedDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      {/* Page head */}
      <header className="mb-6 flex items-start justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.10em] text-muted-foreground">
            /admin/kalender · måned
          </span>
          <h1 className="mt-1 font-display text-[36px] font-bold leading-[1.1] tracking-tight">
            Kalender{" "}
            <em className="font-normal italic text-muted-foreground">· måned</em>
          </h1>
          <p className="mt-1 font-display text-[16px] italic text-muted-foreground">
            Zoom ut. Se hvor måneden tetner.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-border bg-secondary p-0.5">
            <button className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground">
              Uke
            </button>
            <button className="rounded-full bg-foreground px-3.5 py-1.5 text-[12px] font-medium text-background">
              Måned
            </button>
            <button className="rounded-full px-3.5 py-1.5 text-[12px] font-medium text-muted-foreground">
              År
            </button>
          </div>
          <button className="rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium hover:bg-secondary">
            I dag
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground hover:opacity-90">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Ny økt
          </button>
        </div>
      </header>

      <div className="grid grid-cols-[1fr_320px] items-start gap-6">
        {/* Month card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center border-b border-border px-6 py-4.5">
            <div>
              <h2 className="font-display text-[22px] font-semibold tracking-tight">
                Mai 2026
              </h2>
              <div className="mt-0.5 text-[12px] text-muted-foreground">
                142 økter planlagt · 87 % adherence-snitt · 4 fasiliteter aktive
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="inline-flex rounded-full border border-border bg-secondary p-0.5">
                <button className="rounded-full bg-foreground px-3 py-1.5 text-[12px] font-medium text-background">
                  Økter
                </button>
                <button className="rounded-full px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                  Belegg
                </button>
                <button className="rounded-full px-3 py-1.5 text-[12px] font-medium text-muted-foreground">
                  Inntekt
                </button>
              </div>
              <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary">
                <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
              </button>
              <button className="grid h-8 w-8 place-items-center rounded-md border border-border bg-card text-muted-foreground hover:bg-secondary">
                <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
              </button>
            </div>
          </div>

          {/* Weekday row */}
          <div className="grid grid-cols-[28px_repeat(7,1fr)] border-b border-border bg-secondary">
            <div className="py-2.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Uke
            </div>
            {["Man", "Tir", "Ons", "Tor", "Fre", "Lør", "Søn"].map((d) => (
              <div
                key={d}
                className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-[28px_repeat(7,1fr)] auto-rows-[132px]">
            {weeks.map((w) => (
              <WeekRow key={w.wk} week={w} />
            ))}
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="sticky top-6 flex flex-col gap-4">
          {/* Day detail (dark) */}
          <div className="rounded-2xl bg-foreground p-5 text-background">
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-background/50">
              Valgt dag
            </span>
            <h3 className="mt-1.5 font-display text-[22px] font-semibold tracking-tight">
              Torsdag 14. mai
            </h3>
            <div className="text-[12px] text-background/60">
              i dag · 5 økter · 82 % belegg
            </div>
            <div className="mt-4 flex flex-col gap-2.5 border-t border-white/10 pt-3.5">
              <ScheduleEv
                t="09:00"
                name="Mathias Pedersen"
                who="A-lag · 60 min · Studio 2"
                tag="aktiv"
              />
              <ScheduleEv
                t="11:00"
                name="Astrid Kvam"
                who="senior · 45 min · Bossum"
              />
              <ScheduleEv
                t="13:00"
                name="Foreldre-samtale · Lise"
                who="video · 20 min"
                tag="@deg"
              />
              <ScheduleEv
                t="15:00"
                name="Junior · slag-fundament"
                who="gruppe · 60 min · GFGK"
              />
              <ScheduleEv
                t="17:00"
                name="A-lag · slag"
                who="gruppe · 90 min · Studio 1+2"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Forklaring
            </div>
            <LegendRow
              swatch="bg-[rgba(0,88,64,0.10)] border-l-2 border-primary"
              label="Egne økter"
            />
            <LegendRow
              swatch="bg-secondary border-l-2 border-muted-foreground"
              label="Andre coacher"
            />
            <LegendRow
              swatch="bg-[rgba(209,248,67,0.30)] border-l-2 border-accent"
              label="Gruppe-økter"
            />
            <LegendRow
              swatch="bg-[repeating-linear-gradient(135deg,_var(--color-card)_0_3px,_var(--color-secondary)_3px_6px)]"
              label="Blokkert · fri"
            />
          </div>

          {/* Month stats */}
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Måneds-snitt · mai
            </div>
            <MiniStat k="Økter totalt" v="142" />
            <MiniStat k="Egne · solo" v="98" />
            <MiniStat k="Gruppe-økter" v="28" />
            <MiniStat k="Snitt-belegg" v="67 %" tone="up" />
            <MiniStat k="Overbookede dager" v="2" tone="warn" />
          </div>
        </aside>
      </div>

      <footer className="mt-10 flex justify-between border-t border-border pt-6 text-[12px] text-muted-foreground">
        <span>AK Golf Platform · CoachHQ · /admin/kalender · måned</span>
        <span className="font-mono">Mai 2026 · uke 18–22 · 142 økter</span>
      </footer>
    </div>
  );
}

function WeekRow({ week }: { week: Week }) {
  return (
    <>
      <div
        className={`flex items-start justify-center border-b border-r border-border pt-2 font-mono text-[10.5px] font-medium text-muted-foreground ${
          week.current ? "bg-accent/30" : "bg-secondary"
        }`}
      >
        {week.wk}
      </div>
      {week.days.map((d, i) => (
        <DayCell key={`${week.wk}-${i}`} day={d} />
      ))}
    </>
  );
}

function DayCell({ day }: { day: Day }) {
  const base =
    "flex cursor-pointer flex-col gap-1 overflow-hidden border-b border-r border-border px-2 py-2 pl-2.5 relative";
  const tone = day.outside
    ? "bg-[#FAFAF7] text-muted-foreground"
    : day.today
      ? "bg-accent/30"
      : day.weekend
        ? "bg-[rgba(232,232,224,0.35)]"
        : "bg-card hover:bg-secondary";
  return (
    <div className={`${base} ${tone}`}>
      <div className="flex items-center justify-between">
        {day.today ? (
          <span className="grid h-5.5 w-5.5 place-items-center rounded-full bg-foreground font-mono text-[11px] font-semibold text-background">
            {day.num}
          </span>
        ) : (
          <span
            className={`font-mono text-[12.5px] font-medium ${
              day.outside ? "text-muted-foreground" : "text-foreground"
            }`}
          >
            {day.num}
          </span>
        )}
        {day.util !== undefined && <UtilBadge value={day.util} />}
      </div>
      {day.events && day.events.length > 0 && (
        <div className="flex flex-col gap-0.5">
          {day.events.map((ev, i) => (
            <Pill key={i} {...ev} />
          ))}
        </div>
      )}
      {day.more !== undefined && day.more > 0 && (
        <div className="font-mono text-[10.5px] text-muted-foreground">
          +{day.more} til
        </div>
      )}
      {day.ind && (
        <div className="mt-auto flex gap-0.5">
          {day.ind.map((s, i) => (
            <span
              key={i}
              className={`h-[3px] flex-1 rounded-sm ${
                s === "on"
                  ? "bg-primary"
                  : s === "warn"
                    ? "bg-[#B8852A]"
                    : "bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function UtilBadge({ value }: { value: number }) {
  const tone =
    value >= 90
      ? "bg-destructive text-destructive-foreground"
      : value >= 65
        ? "bg-primary text-primary-foreground"
        : value >= 30
          ? "bg-accent/40 text-[#005840]"
          : "bg-black/[0.04] text-muted-foreground";
  return (
    <span
      className={`rounded-sm px-1.5 py-0.5 font-mono text-[9.5px] font-semibold tracking-wide ${tone}`}
    >
      {value}%
    </span>
  );
}

function Pill({ time, label, tone }: DayEvent) {
  const styles =
    tone === "own"
      ? "bg-[rgba(0,88,64,0.10)] text-primary border-l-2 border-primary"
      : tone === "others"
        ? "bg-secondary text-muted-foreground border-l-2 border-muted-foreground"
        : tone === "group"
          ? "bg-[rgba(209,248,67,0.30)] text-[#005840] border-l-2 border-accent"
          : "bg-[repeating-linear-gradient(135deg,_var(--color-card)_0_3px,_var(--color-secondary)_3px_6px)] text-muted-foreground";
  return (
    <div
      className={`flex items-center gap-1 overflow-hidden whitespace-nowrap rounded-sm py-0.5 pl-1 pr-1.5 text-[10.5px] font-medium ${styles}`}
    >
      <span className="flex-shrink-0 font-mono text-[9.5px] opacity-70">
        {time}
      </span>
      <span className="overflow-hidden text-ellipsis">{label}</span>
    </div>
  );
}

function ScheduleEv({
  t,
  name,
  who,
  tag,
}: {
  t: string;
  name: string;
  who: string;
  tag?: string;
}) {
  return (
    <div className="grid grid-cols-[44px_1fr_auto] items-baseline gap-2.5">
      <span className="font-mono text-[11px] text-background/55">{t}</span>
      <span className="text-[13px]">
        {name}
        <span className="mt-0.5 block text-[11px] text-background/55">
          {who}
        </span>
      </span>
      {tag && <span className="font-mono text-[10px] text-accent">{tag}</span>}
    </div>
  );
}

function LegendRow({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5 text-[12.5px]">
      <span className={`h-3.5 w-3.5 flex-shrink-0 rounded-sm ${swatch}`} />
      {label}
    </div>
  );
}

function MiniStat({
  k,
  v,
  tone,
}: {
  k: string;
  v: string;
  tone?: "up" | "warn";
}) {
  const toneClass =
    tone === "up"
      ? "text-[#1A7D56]"
      : tone === "warn"
        ? "text-[#B8852A]"
        : "text-foreground";
  return (
    <div className="flex items-baseline justify-between border-t border-border/60 py-2 first:border-t-0">
      <span className="text-[12.5px] text-muted-foreground">{k}</span>
      <span className={`font-mono text-[15px] font-medium ${toneClass}`}>
        {v}
      </span>
    </div>
  );
}
