/**
 * PILOT — PlayerHQ Tren-kalender uke
 * Bygd direkte fra wireframe/design-files-v2/playerhq-C/09-tren-kalender.html
 * URL: /tren-kalender-demo
 *
 * Mock-data: Markus Roinaas Pedersen, uke 19, mai 2026. Coach Anders Kristiansen.
 */

import { Download, Plus, ChevronLeft, ChevronRight, Heart, Flag, Users } from "lucide-react";

type EventTone = "coach" | "self" | "group" | "round" | "tourn" | "fysio";
type EventStatus = "done" | "plan" | "skip" | "late";

type CalEvent = {
  title: string;
  meta: string;
  tone: EventTone;
  top: number;
  height: number;
  status: EventStatus;
  tier?: "fys" | "tek" | "slag" | "spill" | "turn";
  icon?: React.ReactNode;
};

const DAYS: { name: string; date: number; today?: boolean; events: CalEvent[] }[] = [
  {
    name: "Man",
    date: 11,
    today: true,
    events: [
      {
        title: "SLAG · pitch 50–100m",
        meta: "15:45 – 16:45 · Mulligan 2",
        tone: "coach",
        top: 432,
        height: 90,
        status: "plan",
        tier: "slag",
      },
      {
        title: "FYS · 30 m",
        meta: "19:00 – 19:30",
        tone: "self",
        top: 702,
        height: 54,
        status: "plan",
        tier: "fys",
      },
    ],
  },
  {
    name: "Tir",
    date: 12,
    events: [
      {
        title: "TEK · 7-jern loop",
        meta: "10:00 – 10:30",
        tone: "coach",
        top: 216,
        height: 54,
        status: "done",
        tier: "tek",
      },
      {
        title: "Fysio · skulder",
        meta: "16:00 – 17:00",
        tone: "fysio",
        top: 540,
        height: 54,
        status: "done",
        icon: <Heart className="h-3 w-3" />,
      },
    ],
  },
  {
    name: "Ons",
    date: 13,
    events: [
      {
        title: "1:1 m/ Anders K.",
        meta: "14:00 – 15:30 · Mulligan 2",
        tone: "coach",
        top: 432,
        height: 90,
        status: "plan",
        tier: "tek",
      },
      {
        title: "SLAG · bunker",
        meta: "17:00 – 17:30",
        tone: "self",
        top: 594,
        height: 54,
        status: "plan",
        tier: "slag",
      },
    ],
  },
  {
    name: "Tor",
    date: 14,
    events: [
      {
        title: "TrackMan-test",
        meta: "11:00 – 13:00 · Mulligan 1",
        tone: "tourn",
        top: 270,
        height: 108,
        status: "plan",
      },
    ],
  },
  {
    name: "Fre",
    date: 15,
    events: [
      {
        title: "SLAG · pitch baseline",
        meta: "14:00 – 15:20",
        tone: "self",
        top: 432,
        height: 72,
        status: "late",
        tier: "slag",
      },
    ],
  },
  {
    name: "Lør",
    date: 16,
    events: [
      {
        title: "9 hull · Bossum",
        meta: "10:00 – 14:00",
        tone: "round",
        top: 216,
        height: 216,
        status: "plan",
        icon: <Flag className="h-3 w-3" />,
      },
    ],
  },
  {
    name: "Søn",
    date: 17,
    events: [
      {
        title: "WANG-trening",
        meta: "13:00 – 15:00 · GFGK",
        tone: "group",
        top: 378,
        height: 108,
        status: "plan",
        icon: <Users className="h-3 w-3" />,
      },
    ],
  },
];

export default function TrenKalenderDemo() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        {/* Header */}
        <header className="mb-6">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            /tren/kalender · uke 19 · 11. – 17. mai 2026
          </span>
          <h1 className="mt-2 font-display text-[48px] font-normal leading-[1.05] -tracking-[0.02em]">
            Uke <em className="italic text-primary">19</em>
          </h1>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            «6 økter denne uka, Markus.» — alt i én oversikt: coach-økter,
            selvtrening, runder, fysio.
          </p>
        </header>

        {/* KPI strip */}
        <div className="mb-6 grid grid-cols-4 gap-3.5">
          <KpiCard
            label="Økter denne uka"
            value="6"
            sub="4 coaching · 2 selvtrening"
          />
          <KpiCard
            label="Volum"
            value="8 t 30 m"
            sub="planlagt — 5 t 12 m gjennomført"
          />
          <KpiCard
            label="Gjennomført"
            value="4 / 6"
            sub="67 % — typisk uke for deg"
            valueClass="text-[#1A7D56]"
          />
          <KpiCard
            label="Neste opp"
            value="Ons 14:00 · 1:1 m/ Anders"
            sub="Mulligan Studio 2 · 90 min"
            small
          />
        </div>

        {/* Toolbar */}
        <div className="mb-4 flex flex-wrap items-center gap-3.5">
          <div className="inline-flex gap-0.5 rounded-md border border-border bg-card p-0.5">
            <button className="inline-flex items-center gap-1 rounded-sm px-2.5 py-1.5 text-[12.5px] font-medium text-foreground hover:bg-secondary">
              <ChevronLeft className="h-3.5 w-3.5" />
              Forrige uke
            </button>
            <button className="rounded-sm bg-foreground px-2.5 py-1.5 text-[12.5px] font-medium text-background">
              I dag
            </button>
            <button className="inline-flex items-center gap-1 rounded-sm px-2.5 py-1.5 text-[12.5px] font-medium text-foreground hover:bg-secondary">
              Neste uke
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {["Coaching", "Selvtrening", "Gruppe", "Runde", "Turnering"].map(
              (t) => (
                <button
                  key={t}
                  className="rounded-full border border-border bg-card px-3 py-1 text-[12px] font-medium text-foreground hover:bg-secondary"
                >
                  {t}
                </button>
              )
            )}
          </div>
          <span className="flex-1" />
          <div className="inline-flex gap-0.5 rounded-md border border-border p-0.5">
            <SegBtn>Måned</SegBtn>
            <SegBtn active>Uke</SegBtn>
            <SegBtn>Liste</SegBtn>
          </div>
          <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3.5 py-2 text-[12.5px] font-medium text-foreground hover:bg-secondary">
            <Download className="h-3.5 w-3.5" />
            Eksporter iCal
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-[12.5px] font-semibold text-accent-foreground hover:opacity-90">
            <Plus className="h-3.5 w-3.5" />
            Ny økt
          </button>
        </div>

        {/* Body grid */}
        <div className="grid grid-cols-[1fr_280px] gap-6">
          {/* Calendar */}
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {/* Head row */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border bg-secondary">
              <div />
              {DAYS.map((d) => (
                <div
                  key={d.name}
                  className="border-l border-border/60 px-2 py-2.5 text-center"
                >
                  <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {d.name}
                  </div>
                  <div
                    className={`mt-0.5 font-mono text-[18px] font-medium ${
                      d.today ? "text-primary font-bold" : "text-foreground"
                    }`}
                  >
                    {d.date}
                  </div>
                </div>
              ))}
            </div>
            {/* Body */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)]">
              {/* Time-column */}
              <div className="flex flex-col">
                {Array.from({ length: 16 }, (_, i) => i + 6).map((h) => (
                  <div
                    key={h}
                    className="h-[54px] border-b border-r border-border/60 px-2 py-1.5 text-right font-mono text-[10.5px] text-muted-foreground"
                  >
                    {String(h).padStart(2, "0")}
                  </div>
                ))}
              </div>
              {DAYS.map((d) => (
                <div
                  key={d.name}
                  className="relative min-h-[864px] border-l border-border/60"
                >
                  {d.today && (
                    <div
                      className="absolute left-0 right-0 z-10 h-0.5 bg-destructive"
                      style={{ top: 486 }}
                    >
                      <span className="absolute -left-1.5 -top-1 h-2.5 w-2.5 rounded-full bg-destructive" />
                    </div>
                  )}
                  {d.events.map((e, i) => (
                    <EventCard key={i} ev={e} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right rail */}
          <div className="flex flex-col gap-3.5">
            <RailCard label="Ukens pyramide">
              <DonutSm />
              <div className="mt-3 space-y-0">
                <LegendRow tier="tek" name="TEK" value="2 t 30 m" />
                <LegendRow tier="slag" name="SLAG" value="2 t 15 m" />
                <LegendRow tier="spill" name="SPILL" value="1 t 40 m" />
                <LegendRow tier="fys" name="FYS" value="1 t 15 m" />
                <LegendRow tier="turn" name="TURN" value="30 m" />
              </div>
            </RailCard>

            <RailCard label="Streak">
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="font-mono text-[32px] font-medium leading-none">
                  23
                </span>
                <span className="text-[13px] text-muted-foreground">dager</span>
              </div>
              <div className="mt-0.5 text-[12px] text-muted-foreground">
                Lengste: 41 dager · 2025
              </div>
              <div className="mt-3.5 grid grid-cols-[repeat(14,1fr)] gap-0.5">
                {[
                  "a", "a", "a", "off", "a", "a", "a",
                  "p", "p", "a", "a", "a", "a", "today",
                ].map((s, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-sm ${
                      s === "off"
                        ? "bg-secondary"
                        : s === "p"
                          ? "bg-primary"
                          : s === "today"
                            ? "border-2 border-accent bg-primary"
                            : "bg-accent"
                    }`}
                  />
                ))}
              </div>
            </RailCard>

            <RailCard label="Formtopp">
              <div className="mt-1 font-display text-[18px] italic leading-[1.3]">
                «Peak 12. juni — Sørlandsåpent. 4 uker igjen.»
              </div>
              <div className="mt-3.5 flex justify-between font-mono text-[11px] text-muted-foreground">
                <span>Nå</span>
                <span>+4 uker</span>
              </div>
              <div className="relative mt-1 h-1.5 rounded-full bg-secondary">
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-accent"
                  style={{ width: "68%" }}
                />
              </div>
            </RailCard>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  valueClass,
  small,
}: {
  label: string;
  value: string;
  sub: string;
  valueClass?: string;
  small?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-mono font-medium leading-tight -tracking-[0.01em] ${
          small ? "text-[15px] font-display font-semibold" : "text-[28px]"
        } ${valueClass ?? ""}`}
      >
        {value}
      </div>
      <div className="mt-0.5 text-[12px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function SegBtn({
  children,
  active,
}: {
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <button
      className={`rounded-sm px-2.5 py-1.5 text-[12.5px] font-medium ${
        active
          ? "bg-foreground text-background"
          : "text-foreground hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

function EventCard({ ev }: { ev: CalEvent }) {
  const toneMap: Record<EventTone, string> = {
    coach:
      "bg-[rgba(209,248,67,0.45)] text-[#0A1F18] border-l-[3px] border-l-accent",
    self:
      "bg-secondary text-foreground border border-dashed border-border border-l-[3px] border-l-primary",
    group: "bg-primary text-primary-foreground border-l-[3px] border-l-primary",
    round:
      "bg-[rgba(244,196,48,0.30)] text-[#5C4500] border-l-[3px] border-l-[#B8852A]",
    tourn: "bg-[#0A1F18] text-accent border-l-[3px] border-l-accent",
    fysio:
      "bg-[rgba(94,92,87,0.18)] text-muted-foreground border-l-[3px] border-l-[var(--color-pyr-turn)]",
  };
  const statusMap: Record<EventStatus, string> = {
    done: "bg-[#1A7D56]",
    plan: "bg-accent",
    skip: "bg-destructive",
    late: "bg-[#B8852A]",
  };
  const tierMap = {
    fys: "bg-[var(--color-pyr-fys)]",
    tek: "bg-[var(--color-pyr-tek)]",
    slag: "bg-[var(--color-pyr-slag)]",
    spill: "bg-[var(--color-pyr-spill)]",
    turn: "bg-[var(--color-pyr-turn)]",
  };
  return (
    <div
      className={`absolute left-1 right-1 rounded-md px-2 py-1.5 text-[11.5px] leading-tight ${toneMap[ev.tone]}`}
      style={{ top: ev.top, height: ev.height }}
    >
      <div className="flex items-center gap-1.5 font-semibold">
        {ev.tier && (
          <span
            className={`block w-1.5 rounded-sm ${tierMap[ev.tier]}`}
            style={{ height: ev.height > 60 ? 14 : 10 }}
          />
        )}
        {ev.icon}
        <span>{ev.title}</span>
      </div>
      <div className="mt-0.5 font-mono text-[10px] opacity-85">{ev.meta}</div>
      <span
        className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${statusMap[ev.status]}`}
      />
    </div>
  );
}

function RailCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      {children}
    </div>
  );
}

function DonutSm() {
  return (
    <svg viewBox="0 0 100 100" className="mx-auto mt-2 h-36 w-36">
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="hsl(var(--border))"
        strokeWidth="14"
      />
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="var(--color-pyr-tek)"
        strokeWidth="14"
        strokeDasharray="60 220"
        transform="rotate(-90 50 50)"
      />
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="var(--color-pyr-slag)"
        strokeWidth="14"
        strokeDasharray="55 220"
        strokeDashoffset="-60"
        transform="rotate(-90 50 50)"
      />
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="var(--color-pyr-spill)"
        strokeWidth="14"
        strokeDasharray="40 220"
        strokeDashoffset="-115"
        transform="rotate(-90 50 50)"
      />
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="var(--color-pyr-fys)"
        strokeWidth="14"
        strokeDasharray="30 220"
        strokeDashoffset="-155"
        transform="rotate(-90 50 50)"
      />
      <circle
        cx="50"
        cy="50"
        r="35"
        fill="none"
        stroke="var(--color-pyr-turn)"
        strokeWidth="14"
        strokeDasharray="15 220"
        strokeDashoffset="-185"
        transform="rotate(-90 50 50)"
      />
      <text
        x="50"
        y="48"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="13"
        fontWeight="600"
        fill="hsl(var(--foreground))"
      >
        8 t
      </text>
      <text
        x="50"
        y="60"
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="hsl(var(--muted-foreground))"
      >
        30 m
      </text>
    </svg>
  );
}

function LegendRow({
  tier,
  name,
  value,
}: {
  tier: "fys" | "tek" | "slag" | "spill" | "turn";
  name: string;
  value: string;
}) {
  const dot = {
    fys: "bg-[var(--color-pyr-fys)]",
    tek: "bg-[var(--color-pyr-tek)]",
    slag: "bg-[var(--color-pyr-slag)]",
    spill: "bg-[var(--color-pyr-spill)]",
    turn: "bg-[var(--color-pyr-turn)]",
  }[tier];
  return (
    <div className="flex items-center justify-between py-1 text-[12px] text-muted-foreground">
      <span className="inline-flex items-center gap-2">
        <span className={`inline-block h-2 w-2 rounded-full ${dot}`} />
        {name}
      </span>
      <b className="font-mono font-semibold text-foreground">{value}</b>
    </div>
  );
}
