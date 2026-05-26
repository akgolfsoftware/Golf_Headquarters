"use client";

import { useState } from "react";
import { Flag, BarChart3, NotebookPen, Camera } from "lucide-react";

type Hole = {
  n: number;
  par: number;
  len: number;
  avg: number;
  best: number;
  sg: number;
  hard?: boolean;
  easy?: boolean;
};

type Tab = "holes" | "timeline" | "strategy" | "photos";

const TABS: Array<{ id: Tab; label: string; icon: typeof Flag }> = [
  { id: "holes", label: "Hull-for-hull", icon: Flag },
  { id: "timeline", label: "Tidslinje", icon: BarChart3 },
  { id: "strategy", label: "Strategi-notater", icon: NotebookPen },
  { id: "photos", label: "Foto", icon: Camera },
];

const STRAT_NOTES: Array<{
  tag: string;
  who: string;
  when: string;
  body: React.ReactNode;
  self?: boolean;
}> = [
  {
    tag: "Hull 17 · Anders K.",
    who: "Anders K.",
    when: "14. apr 2026",
    body: (
      <>
        <strong>3-wood fra tee, alltid.</strong> Bunkeren høyre er ute av rekkevidde
        med wood, men du straffes for driver 4 av 5 runder. Trekk litt venstre —
        venstre fairway gir bedre vinkel inn til pin.
      </>
    ),
  },
  {
    tag: "Hull 6 · Egen note",
    who: "Markus · egen note",
    when: "2. mai 2026",
    self: true,
    body: (
      <>
        Greenen på 6 er <strong>raskere</strong> enn den ser ut. Spill 30 cm kort
        på alle puttene over 4 m — ellers stikker den forbi.
      </>
    ),
  },
  {
    tag: "Hele runden · Anders K.",
    who: "Anders K.",
    when: "12. mar 2026",
    body: (
      <>
        Vind fra vest favoriserer hull 9–12, motarbeider 14–17.{" "}
        <strong>Sjekk vinden på range</strong> før første tee.
      </>
    ),
  },
];

export function BaneDetailTabs({ holes }: { holes: Hole[] }) {
  const [tab, setTab] = useState<Tab>("holes");

  return (
    <>
      <nav className="flex flex-wrap gap-1 border-b border-border" role="tablist">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                active
                  ? "border-b-2 border-primary text-primary"
                  : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon size={14} strokeWidth={1.75} />
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "holes" && <HolesPane holes={holes} />}
      {tab === "timeline" && <TimelinePane />}
      {tab === "strategy" && <StrategyPane />}
      {tab === "photos" && <PhotosPane />}
    </>
  );
}

function HolesPane({ holes }: { holes: Hole[] }) {
  const hardest = holes.find((h) => h.hard) ?? holes[0];
  const easiest = holes.find((h) => h.easy) ?? holes[0];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <HoleSummary
          tone="hard"
          label="Vanskeligst"
          holeNum={hardest.n}
          body={
            <>
              <strong>Snitt {hardest.avg.toFixed(1).replace(".", ",")}</strong> på
              par {hardest.par} · bunker høyre. Anders anbefaler 3-wood fra tee — du
              straffes for driver 4 av 5 runder her.
            </>
          }
        />
        <HoleSummary
          tone="easy"
          label="Lettest"
          holeNum={easiest.n}
          body={
            <>
              <strong>Snitt {easiest.avg.toFixed(1).replace(".", ",")}</strong> på
              par {easiest.par} · driveable for de fleste A1. Du har birdied her 11
              av 28 runder.
            </>
          }
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid grid-cols-[60px_50px_80px_1fr_70px_70px_70px] gap-3 border-b border-border bg-muted/40 px-4 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
          <span>Hull</span>
          <span className="text-center">Par</span>
          <span>Lengde</span>
          <span>Vanskelighet</span>
          <span className="text-right">Snitt</span>
          <span className="text-right">Best</span>
          <span className="text-right">SG</span>
        </div>
        {holes.map((h) => {
          const diff = h.avg - h.par;
          const diffPct = Math.min(100, Math.max(0, (Math.abs(diff) / 1) * 100));
          return (
            <div
              key={h.n}
              className="grid grid-cols-[60px_50px_80px_1fr_70px_70px_70px] gap-3 border-b border-border/60 px-4 py-3 last:border-0 items-center"
            >
              <span className="font-mono text-base font-semibold tabular-nums">
                {h.n}
                {h.hard && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-destructive align-middle" />
                )}
                {h.easy && (
                  <span className="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-primary align-middle" />
                )}
              </span>
              <span className="text-center font-mono text-sm tabular-nums">
                {h.par}
              </span>
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {h.len} m
              </span>
              <span className="relative h-2 rounded-full bg-muted/60">
                <span
                  className={`absolute top-0 h-2 rounded-full ${
                    diff > 0 ? "bg-destructive" : "bg-primary"
                  }`}
                  style={
                    diff > 0
                      ? { left: "50%", width: `${diffPct / 2}%` }
                      : { right: "50%", width: `${diffPct / 2}%` }
                  }
                />
                <span className="absolute left-1/2 top-0 h-2 w-px -translate-x-1/2 bg-border" />
              </span>
              <span className="text-right font-mono text-sm tabular-nums">
                {h.avg.toFixed(1).replace(".", ",")}
              </span>
              <span className="text-right font-mono text-sm font-semibold tabular-nums text-primary">
                {h.best}
              </span>
              <span
                className={`text-right font-mono text-xs font-semibold tabular-nums ${
                  h.sg > 0
                    ? "text-primary"
                    : h.sg < 0
                      ? "text-destructive"
                      : "text-muted-foreground"
                }`}
              >
                {h.sg > 0 ? "+" : ""}
                {h.sg.toFixed(2).replace(".", ",")}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HoleSummary({
  tone,
  label,
  holeNum,
  body,
}: {
  tone: "hard" | "easy";
  label: string;
  holeNum: number;
  body: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        tone === "hard"
          ? "border-destructive/30 bg-destructive/[0.04]"
          : "border-primary/30 bg-primary/[0.04]"
      }`}
    >
      <span
        className={`font-mono text-[10px] font-semibold uppercase tracking-[0.10em] ${
          tone === "hard" ? "text-destructive" : "text-primary"
        }`}
      >
        {label}
      </span>
      <div className="my-2 font-display text-5xl font-semibold tabular-nums">
        {holeNum}
      </div>
      <p className="text-sm leading-relaxed text-foreground">{body}</p>
    </div>
  );
}

function TimelinePane() {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="font-display text-base font-semibold">
          Siste 28 runder · GFGK Old Course
        </h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
          Mai 2024 → mai 2026
        </span>
      </div>
      <div className="mb-3 flex flex-wrap gap-4 font-mono text-[10px] text-muted-foreground">
        <LegendItem color="bg-primary">Under par</LegendItem>
        <LegendItem color="bg-muted-foreground">Par</LegendItem>
        <LegendItem color="bg-destructive">Over par</LegendItem>
        <LegendItem color="bg-accent border-2 border-primary">Beste</LegendItem>
      </div>
      <svg viewBox="0 0 600 200" className="h-48 w-full">
        <line
          x1="0"
          y1="100"
          x2="600"
          y2="100"
          stroke="hsl(var(--border))"
          strokeWidth="1"
          strokeDasharray="2 3"
        />
        <line
          x1="0"
          y1="100"
          x2="600"
          y2="60"
          stroke="#005840"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          opacity="0.5"
        />
        {Array.from({ length: 28 }).map((_, i) => {
          const cx = 10 + i * 20;
          const cy = 100 + (Math.sin(i) * 30 - i * 1.2);
          const color =
            cy < 95 ? "hsl(var(--primary))" : cy > 105 ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))";
          return <circle key={i} cx={cx} cy={cy} r="4" fill={color} />;
        })}
        <circle cx="290" cy="40" r="6" fill="#D1F843" stroke="#005840" strokeWidth="2" />
      </svg>
    </section>
  );
}

function LegendItem({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {children}
    </span>
  );
}

function StrategyPane() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {STRAT_NOTES.map((n, i) => (
        <div
          key={i}
          className={`rounded-2xl border p-5 ${
            n.self
              ? "border-accent/40 bg-accent/[0.06]"
              : "border-border bg-card"
          }`}
        >
          <span
            className={`inline-block rounded-full px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] ${
              n.self
                ? "bg-accent/30 text-accent-foreground"
                : "bg-primary/10 text-primary"
            }`}
          >
            {n.tag}
          </span>
          <div className="mt-3 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            <span className="font-semibold text-foreground">{n.who}</span>
            <span>{n.when}</span>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-foreground">
            {n.body}
          </p>
        </div>
      ))}
    </section>
  );
}

function PhotosPane() {
  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[
        { h: "Hull 17 · 14. juni 2025", t: "Tee-shot — beste runden noensinne", bg: "#B4C99D" },
        { h: "Hull 8 · 22. mai 2025", t: "Lay-up til 80m", bg: "#9FB890" },
        { h: "Hull 6 · 3. juni 2025", t: "Morgenrunde — birdie", bg: "#6B8C5A" },
        { h: "Hull 14 · 11. aug 2025", t: "Dogleg over treet", bg: "#A4B98C" },
        { h: "Hull 11 · 7. sep 2024", t: "Bunker-eskalering", bg: "#C9D9B4" },
        { h: "Hull 17 · 18. apr 2026", t: "Tee-bilde · forrige runde", bg: "#E8D9A9" },
      ].map((p, i) => (
        <figure
          key={i}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div
            className="aspect-[4/3] w-full"
            style={{ background: p.bg }}
            aria-hidden="true"
          />
          <figcaption className="p-3">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {p.h}
            </div>
            <div className="mt-1 text-sm text-foreground">{p.t}</div>
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
