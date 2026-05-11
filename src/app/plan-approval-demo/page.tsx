/**
 * PILOT — PlanApproval (PlayerHQ modal: plan venter godkjenning)
 * URL: /plan-approval-demo
 * Bygd fra wireframe/design-files-v2/modaler-A/06-plan-approval.html
 */

import Link from "next/link";
import { ChevronDown, X } from "lucide-react";

type WeekData = {
  num: number;
  title: string;
  dates: string;
  count: string;
  bar: { width: number; color: string }[];
  open?: boolean;
  sessions?: { day: string; name: string; sub: string; cat: CatKind; dur: string }[];
};

type CatKind = "fys" | "tek" | "slag" | "spill" | "turn";

const WEEKS: WeekData[] = [
  {
    num: 19,
    title: "TEK-fokus",
    dates: "9.–15. mai",
    count: "4 økter · 4 t 50m",
    bar: [
      { width: 70, color: "#005840" },
      { width: 15, color: "#16A34A" },
      { width: 15, color: "#D1F843" },
    ],
    open: true,
    sessions: [
      { day: "MAN", name: "Iron-treff 7-jern", sub: "Range · 50 baller", cat: "tek", dur: "75 min" },
      { day: "ONS", name: "Driver-konsistens", sub: "Range · TrackMan", cat: "slag", dur: "60 min" },
      { day: "FRE", name: "Wedge 30–80m", sub: "Short game · 40 baller", cat: "tek", dur: "60 min" },
      { day: "LØR", name: "Styrke — rotasjon & bein", sub: "Gym · video", cat: "fys", dur: "45 min" },
    ],
  },
  {
    num: 20,
    title: "TEK + SLAG",
    dates: "16.–22. mai",
    count: "4 økter · 4 t 45m",
    bar: [
      { width: 50, color: "#005840" },
      { width: 30, color: "#D1F843" },
      { width: 20, color: "#16A34A" },
    ],
  },
  {
    num: 21,
    title: "SLAG-overgang",
    dates: "23.–29. mai",
    count: "4 økter · 4 t 45m",
    bar: [
      { width: 30, color: "#005840" },
      { width: 45, color: "#D1F843" },
      { width: 25, color: "#F4C430" },
    ],
  },
  {
    num: 22,
    title: "Spillforberedelse",
    dates: "30. mai – 5. juni",
    count: "4 økter · 5 t",
    bar: [
      { width: 25, color: "#005840" },
      { width: 35, color: "#D1F843" },
      { width: 40, color: "#F4C430" },
    ],
  },
  {
    num: 23,
    title: "Pause / deload",
    dates: "6.–12. juni",
    count: "2 økter · 1 t 30m",
    bar: [{ width: 100, color: "rgba(157,156,149,0.5)" }],
  },
  {
    num: 24,
    title: "Spill + turnerings-sim",
    dates: "13.–19. juni",
    count: "5 økter · 6 t 20m",
    bar: [
      { width: 30, color: "#D1F843" },
      { width: 40, color: "#F4C430" },
      { width: 30, color: "#5E5C57" },
    ],
  },
  {
    num: 25,
    title: "Peak-uke",
    dates: "20.–26. juni",
    count: "5 økter · 5 t 50m",
    bar: [
      { width: 35, color: "#D1F843" },
      { width: 35, color: "#F4C430" },
      { width: 30, color: "#5E5C57" },
    ],
  },
  {
    num: 26,
    title: "Turneringsuke — Sørlandsåpent",
    dates: "27.–30. juni",
    count: "4 økter · 4 t",
    bar: [{ width: 100, color: "#F4C430" }],
  },
];

export default function PlanApprovalDemo() {
  return (
    <div className="min-h-screen bg-[var(--surface,#FAFAF7)]">
      <div className="fixed inset-0 bg-[rgba(10,31,24,0.5)]" aria-hidden="true" />

      <div className="relative mx-auto my-8 max-w-[800px] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 py-6">
          <div className="flex-1">
            <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.10em] text-muted-foreground">
              PlayerHQ · varsel · plan venter godkjenning
            </div>

            {/* Coach bar */}
            <div className="mt-3 grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg bg-[var(--surface-alt,#F1EEE5)] px-4 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-semibold text-accent">
                AK
              </span>
              <div className="text-[13px] text-foreground">
                <b className="font-semibold">Anders K.</b> har foreslått en plan til deg
              </div>
              <span className="font-mono text-[11px] text-muted-foreground">
                for 14 minutter siden
              </span>
            </div>

            <h2 className="mt-4 font-display text-[26px] font-bold leading-tight tracking-tight">
              <em className="font-medium italic">Sommer-toppform</em> 2026
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Pill outlined>9. mai – 30. juni · 8 uker</Pill>
              <Pill accent>1 milestone · Sørlandsåpent</Pill>
            </div>
          </div>
          <Link
            href="/"
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Lukk"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </Link>
        </header>

        {/* Body */}
        <div className="flex max-h-[calc(100vh-280px)] flex-col gap-5 overflow-y-auto px-8 py-6">
          {/* Stat row */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_220px] overflow-hidden rounded-2xl border border-border bg-[var(--surface,#FAFAF7)]">
            <StatCell label="Uker" value="8" sub="9. mai → 30. juni" />
            <StatCell label="Økter" value="32" sub="~4 / uke" />
            <StatCell label="Fokusområder" value="5" sub="pyramide" />
            <StatCell
              label="Milestone"
              value={<span className="text-[14px]">Sørlandsåpent</span>}
              sub="28.-30. juni"
            />
            <DonutCell />
          </div>

          {/* Quote card */}
          <section className="relative overflow-hidden rounded-2xl bg-primary px-6 py-5 text-white">
            <span
              className="pointer-events-none absolute -top-4 left-4 font-display text-[110px] italic leading-none text-accent opacity-30"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="relative max-w-[620px] font-display text-[17px] font-medium italic leading-[1.55] text-[#F4F2EB]">
              Hei Markus — denne planen bygger opp mot Sørlandsåpent. Tung TEK-fokus første 4
              uker, deretter overgang til SLAG og spillforberedelse. Si fra hvis noe ikke passer.
            </p>
            <div className="mt-3.5 flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-wider text-accent">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent font-display text-[10px] font-bold text-primary">
                AK
              </span>
              Anders Kristiansen · din coach
            </div>
          </section>

          {/* Week list */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h4 className="font-display text-[13px] font-semibold uppercase tracking-wider text-foreground">
                Uke-for-uke
              </h4>
              <span className="font-mono text-[11px] text-muted-foreground">
                8 uker · 32 økter · klikk for å åpne
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {WEEKS.map((w) => (
                <WeekRow key={w.num} {...w} />
              ))}
            </div>
          </section>

          {/* Diff list */}
          <section>
            <div className="mb-3 flex items-baseline justify-between">
              <h4 className="font-display text-[13px] font-semibold uppercase tracking-wider text-foreground">
                Hva endrer seg fra forrige plan
              </h4>
              <span className="font-mono text-[11px] text-muted-foreground">
                vs. «Vår-grunnlag 2026» (avsluttet 8. mai)
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <DiffRow
                kind="plus"
                title="4 nye TEK-økter"
                body="iron-treff + wedge 30–80m flyttet til uke 19–20"
                sub="Forberedelse for park-baner med smale fairways"
              />
              <DiffRow
                kind="minus"
                title="2 SPILL-økter"
                body="9-hull-runder flyttet fra uke 19 til uke 23"
                sub="Gjør plass til teknisk grunnlag før spill"
              />
              <DiffRow
                kind="up"
                title="Total volum +12 %"
                body="32 økter vs. 28 forrige periode"
                sub="Toppes på uke 25 med 6 t 20m"
              />
            </div>
          </section>
        </div>

        {/* Footer (3 actions) */}
        <footer className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-2 border-t border-border bg-[var(--surface-alt,#F1EEE5)] px-8 py-4">
          <Link
            href="/"
            className="rounded-md px-3 py-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
          >
            Avbryt
          </Link>
          <div />
          <button className="rounded-md border border-border bg-card px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary">
            Be om endring →
          </button>
          <button className="rounded-md border border-[var(--status-danger,#A32D2D)] bg-transparent px-3.5 py-2 text-[13px] font-medium text-[var(--status-danger,#A32D2D)] transition-colors hover:bg-[var(--status-danger-bg,#FBE9E9)]">
            Avslå
          </button>
          <button className="rounded-md bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90">
            Godta og start →
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ============================================================
   HJELPERE
   ============================================================ */

function Pill({
  children,
  outlined,
  accent,
}: {
  children: React.ReactNode;
  outlined?: boolean;
  accent?: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 font-mono text-[12px] font-semibold ${
        outlined
          ? "border border-border bg-card text-foreground"
          : accent
            ? "bg-[var(--accent-bg,rgba(209,248,67,0.20))] text-[var(--brand-accent-on,#005840)]"
            : "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground"
      }`}
    >
      {children}
    </span>
  );
}

function StatCell({
  label,
  value,
  sub,
}: {
  label: string;
  value: React.ReactNode;
  sub: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-r border-border px-4 py-4">
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <span className="font-display text-[22px] font-semibold leading-none tracking-tight text-foreground">
        {value}
      </span>
      <span className="font-mono text-[11px] text-muted-foreground">{sub}</span>
    </div>
  );
}

function DonutCell() {
  return (
    <div className="flex items-center gap-3 bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))] px-4 py-2.5">
      <div className="relative h-[76px] w-[76px] flex-shrink-0">
        <svg
          viewBox="0 0 42 42"
          className="h-full w-full"
          style={{ transform: "rotate(-90deg)" }}
        >
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="var(--color-border,#E5E3DD)" strokeWidth="6" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#005840" strokeWidth="6" strokeDasharray="40 60" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#D1F843" strokeWidth="6" strokeDasharray="25 75" strokeDashoffset="-40" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#16A34A" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-65" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#F4C430" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="-80" />
          <circle cx="21" cy="21" r="15.9" fill="none" stroke="#5E5C57" strokeWidth="6" strokeDasharray="5 95" strokeDashoffset="-95" />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-display text-[13px] font-bold text-primary">
          100%
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-2.5 gap-y-0.5 font-mono text-[10px] text-muted-foreground">
        <LegItem swatch="#005840" label="TEK" pct="40" />
        <LegItem swatch="#D1F843" label="SLAG" pct="25" />
        <LegItem swatch="#16A34A" label="FYS" pct="15" />
        <LegItem swatch="#F4C430" label="SPILL" pct="15" />
        <LegItem swatch="#5E5C57" label="TURN" pct="5" />
      </div>
    </div>
  );
}

function LegItem({ swatch, label, pct }: { swatch: string; label: string; pct: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="h-1.5 w-1.5 rounded-sm" style={{ background: swatch }} />
      {label} <b className="font-semibold text-foreground">{pct}</b>
    </span>
  );
}

function WeekRow({ num, title, dates, count, bar, open, sessions }: WeekData) {
  return (
    <div
      className={`overflow-hidden rounded-lg border bg-[var(--surface,#FAFAF7)] ${
        open ? "border-primary bg-card" : "border-border"
      }`}
    >
      <div className="grid cursor-pointer grid-cols-[64px_1fr_auto_auto_20px] items-center gap-3.5 px-3.5 py-3">
        <div className="font-display text-[18px] font-bold leading-none tracking-tight text-foreground">
          {num}
          <small className="-mt-0.5 block font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Uke
          </small>
        </div>
        <div className="text-[13px] font-semibold text-foreground">
          {title}
          <span className="ml-2 font-mono text-[11px] font-medium text-muted-foreground">
            {dates}
          </span>
        </div>
        <div className="flex h-1.5 w-20 overflow-hidden rounded-full bg-[var(--surface-alt,#F1EEE5)]">
          {bar.map((b, i) => (
            <span
              key={i}
              className="block h-full"
              style={{ width: `${b.width}%`, background: b.color }}
            />
          ))}
        </div>
        <div className="font-mono text-[11px] font-medium tabular-nums text-muted-foreground">
          {count}
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-180 text-primary" : "text-muted-foreground"
          }`}
          strokeWidth={2}
        />
      </div>
      {open && sessions && (
        <div className="flex flex-col gap-1.5 px-3.5 pb-3.5">
          {sessions.map((s, i) => (
            <SessionRow key={i} {...s} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionRow({
  day,
  name,
  sub,
  cat,
  dur,
}: {
  day: string;
  name: string;
  sub: string;
  cat: CatKind;
  dur: string;
}) {
  const catStyles: Record<CatKind, string> = {
    fys: "bg-[rgba(22,163,74,0.12)] text-[#16A34A]",
    tek: "bg-[var(--brand-primary-soft,rgba(0,88,64,0.08))] text-primary",
    slag: "bg-[rgba(209,248,67,0.20)] text-[var(--brand-accent-on,#005840)]",
    spill: "bg-[rgba(244,196,48,0.14)] text-[#B8852A]",
    turn: "bg-[var(--surface-alt,#F1EEE5)] text-muted-foreground",
  };
  return (
    <div className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2.5 rounded-md bg-[var(--surface-alt,#F1EEE5)] px-3 py-2.5">
      <span className="w-9 font-mono text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {day}
      </span>
      <span className="text-[13px] font-medium text-foreground">
        {name}
        <span className="ml-1.5 font-mono text-[10px] text-muted-foreground">{sub}</span>
      </span>
      <span
        className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${catStyles[cat]}`}
      >
        {cat.toUpperCase()}
      </span>
      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">{dur}</span>
    </div>
  );
}

function DiffRow({
  kind,
  title,
  body,
  sub,
}: {
  kind: "plus" | "minus" | "up";
  title: string;
  body: string;
  sub: string;
}) {
  const styles: Record<typeof kind, { bg: string; color: string; symbol: string }> = {
    plus: { bg: "bg-[var(--status-success-bg,#E5F1EA)]", color: "text-[var(--status-success,#1A7D56)]", symbol: "+" },
    minus: { bg: "bg-[var(--status-danger-bg,#FBE9E9)]", color: "text-[var(--status-danger,#A32D2D)]", symbol: "−" },
    up: { bg: "bg-[var(--accent-bg,rgba(209,248,67,0.20))]", color: "text-[var(--brand-accent-on,#005840)]", symbol: "↑" },
  };
  const s = styles[kind];
  return (
    <div className="grid grid-cols-[auto_1fr] items-center gap-3 rounded-lg border border-border bg-[var(--surface,#FAFAF7)] px-3.5 py-2.5">
      <div
        className={`grid h-7 w-7 place-items-center rounded-lg font-bold text-[14px] ${s.bg} ${s.color}`}
      >
        {s.symbol}
      </div>
      <div className="text-[13px] text-foreground">
        <b className="font-semibold">{title}</b> · {body}
        <span className="mt-0.5 block font-mono text-[11px] text-muted-foreground">{sub}</span>
      </div>
    </div>
  );
}
