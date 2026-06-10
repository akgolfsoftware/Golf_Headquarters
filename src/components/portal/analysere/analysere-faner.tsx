"use client";

/**
 * Analysere-faner (AnalyzeScreen) — sesong-header + SG/Runder/TrackMan/Tester/Innsikt.
 * Default "SG" matcher fasitens SGView. Client pga fane-state.
 */

import { useState } from "react";
import Link from "next/link";
import { Plus, ChevronRight, ClipboardCheck } from "lucide-react";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { AthleticBadge } from "@/components/athletic/badge";
import type { AnalysereData, SgRad } from "@/lib/portal-analysere/analysere-data";

type Trend = { value: string; tone: "positive" | "negative" | "neutral" } | null;

/** KPI-rute som fasitens Kpi: pil i trend-strengen, farge etter godhet, INGEN ekstra ikon. */
function KpiRute({ label, value, trend }: { label: string; value: string; trend?: Trend }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</div>
      <div className="mt-1.5 font-mono text-2xl font-semibold leading-none tracking-[-0.02em] text-foreground">{value}</div>
      {trend && (
        <div
          className={
            "mt-1.5 font-mono text-[10px] font-medium " +
            (trend.tone === "positive" ? "text-primary" : trend.tone === "negative" ? "text-destructive" : "text-muted-foreground")
          }
        >
          {trend.value}
        </div>
      )}
    </div>
  );
}

const TABS = [
  { key: "sg", label: "SG" },
  { key: "runder", label: "Runder" },
  { key: "trackman", label: "TrackMan" },
  { key: "tester", label: "Tester" },
  { key: "innsikt", label: "Innsikt" },
] as const;
type TabKey = (typeof TABS)[number]["key"];

// ── Diverging SG-bar (senter-null) ───────────────────────────────────────────
function SGBar({ row, scale = 0.5 }: { row: SgRad; scale?: number }) {
  const w = Math.min(Math.abs(row.value) / scale, 1) * 50;
  const pos = row.value >= 0;
  return (
    <div className="grid grid-cols-[110px_1fr_56px] items-center gap-3 py-2.5">
      <span className="text-[13px] font-medium text-foreground">{row.name}</span>
      <span className="relative h-2 rounded-full bg-muted">
        <span className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
        <span
          className={"absolute top-0 bottom-0 rounded-full " + (pos ? "bg-primary" : "bg-destructive")}
          style={pos ? { left: "50%", width: `${w}%` } : { right: "50%", width: `${w}%` }}
        />
      </span>
      <span className={"text-right font-mono text-xs font-semibold " + (pos ? "text-success" : "text-destructive")}>
        {pos ? "+" : "−"}
        {Math.abs(row.value).toFixed(2)}
      </span>
    </div>
  );
}

// ── Sesong-header: trend-graf + 2×2 KPI ──────────────────────────────────────
function SeasonHeader({ data }: { data: AnalysereData }) {
  const pts = data.trend;
  const max = pts.length ? Math.max(...pts) : 1;
  const min = pts.length ? Math.min(...pts) : 0;
  const span = max - min || 1;
  const coords = pts.map((v, i) => {
    const x = pts.length > 1 ? (i / (pts.length - 1)) * 300 + 10 : 160;
    const y = 100 - ((v - min) / span) * 80;
    return { x, y };
  });
  const sisteSg = pts.length ? pts[pts.length - 1] : null;

  return (
    <div className="mb-6 space-y-4 md:grid md:grid-cols-[1.3fr_1fr] md:items-start md:gap-4 md:space-y-0">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <AthleticEyebrow>SG-total · siste runder</AthleticEyebrow>
          <span className="font-mono text-2xl font-semibold tracking-[-0.02em] text-foreground">
            {sisteSg != null ? `${sisteSg >= 0 ? "+" : "−"}${Math.abs(sisteSg).toFixed(2)}` : "—"}
          </span>
        </div>
        {coords.length > 1 ? (
          <svg viewBox="0 0 320 110" className="h-[110px] w-full" preserveAspectRatio="none">
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1="0" x2="320" y1={15 + i * 28} y2={15 + i * 28} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="2,4" />
            ))}
            <polyline fill="none" stroke="hsl(var(--primary))" strokeWidth="2" points={coords.map((c) => `${c.x},${c.y}`).join(" ")} />
            {coords.map((c, i) => (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r={i === coords.length - 1 ? 5 : 3}
                fill={i === coords.length - 1 ? "hsl(var(--accent))" : "hsl(var(--primary))"}
                stroke={i === coords.length - 1 ? "hsl(var(--primary))" : "none"}
                strokeWidth="2"
              />
            ))}
          </svg>
        ) : (
          <p className="py-8 text-center text-sm text-muted-foreground">Trend vises når du har flere runder.</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <KpiRute label="Runder '25" value={data.kpi.runder} />
        <KpiRute label="Snitt" value={data.kpi.snitt} trend={data.kpi.snittTrend} />
        <KpiRute label="Best" value={data.kpi.best} />
        <KpiRute label="SG Total" value={data.kpi.sgTotal} trend={data.kpi.sgTotalTrend} />
      </div>
    </div>
  );
}

// ── Faner ─────────────────────────────────────────────────────────────────────
function SGFane({ data }: { data: AnalysereData }) {
  const approach = data.sg.find((s) => s.name === "Approach");
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <AthleticEyebrow>Strokes Gained · siste runder</AthleticEyebrow>
        <div className="mt-2">
          {data.sg.map((r) => (
            <SGBar key={r.name} row={r} />
          ))}
        </div>
      </div>
      {approach && (
        <div className="rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-4 font-mono text-xs leading-relaxed text-muted-foreground">
          Approach er sterkest med <b className="text-primary">{approach.value >= 0 ? "+" : "−"}{Math.abs(approach.value).toFixed(2)}</b> SG i snitt. Around green er der neste blokk bør ligge.
        </div>
      )}
    </div>
  );
}

function RunderFane({ data }: { data: AnalysereData }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-muted-foreground">{data.kpi.runder} runder loggført · snitt {data.kpi.snitt}</span>
        <Link href="/portal/tren/turneringer" className="inline-flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden /> Loggfør runde
        </Link>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {data.runder.map((r) => (
          <div key={r.id} className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0">
            <span className={"flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl " + (r.state === "best" ? "bg-primary text-accent" : "bg-secondary text-foreground")}>
              <span className="font-mono text-[17px] font-bold leading-none">{r.score}</span>
              {r.score !== "—" && <span className="mt-0.5 font-mono text-[9px] opacity-70">{r.topar}</span>}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">{r.bane}</span>
              <span className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground">{r.dato} · {r.meta}</span>
            </span>
            {r.state === "best" && <AthleticBadge variant="lime">Best</AthleticBadge>}
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60" strokeWidth={2} aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackManFane({ data }: { data: AnalysereData }) {
  if (!data.trackman.length) return <p className="py-6 text-sm text-muted-foreground">Ingen TrackMan-data ennå.</p>;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card px-4">
      <div className="grid grid-cols-[1.4fr_1fr] border-b border-border py-3 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
        <span>Kølle</span>
        <span className="text-right">Total</span>
      </div>
      {data.trackman.map((c) => (
        <div key={c.club} className="grid grid-cols-[1.4fr_1fr] items-center border-b border-border py-3 last:border-b-0">
          <span className="text-sm font-semibold text-foreground">{c.club}</span>
          <span className="text-right font-mono text-[13px] font-semibold text-foreground">{c.total}</span>
        </div>
      ))}
      <p className="py-2.5 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">Meter · snitt siste uker</p>
    </div>
  );
}

function TesterFane({ data }: { data: AnalysereData }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border border-l-[3px] border-l-accent bg-card p-4 text-[13px] text-muted-foreground">
        Oversikt over tester og resultater. Å <b className="text-foreground">planlegge eller tildele</b> en test skjer i Workbench eller kommer fra coachen din.
      </div>
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {data.tester.length ? (
          data.tester.map((t, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                <ClipboardCheck className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">{t.navn}</span>
                <span className="mt-0.5 block font-mono text-[10px] text-muted-foreground">{t.dato}</span>
              </span>
              <AthleticBadge variant={t.ok ? "ok" : "neutral"}>{t.resultat}</AthleticBadge>
            </div>
          ))
        ) : (
          <p className="px-4 py-6 text-sm text-muted-foreground">Ingen tester loggført ennå.</p>
        )}
      </div>
      <p className="font-mono text-[10px] text-muted-foreground">Referanseverdier er plassholder-tall — ikke låst ennå.</p>
    </div>
  );
}

function InnsiktFane({ data }: { data: AnalysereData }) {
  const bar = (t: "pos" | "neg" | "neutral") =>
    t === "pos" ? "border-l-success" : t === "neg" ? "border-l-destructive" : "border-l-accent";
  if (!data.innsikt.length) return <p className="py-6 text-sm text-muted-foreground">Ingen innsikt ennå.</p>;
  return (
    <div className="space-y-3">
      {data.innsikt.map((x, i) => (
        <div key={i} className={"rounded-xl border border-border border-l-[3px] bg-card p-4 " + bar(x.tone)}>
          <div className="font-display text-base font-bold tracking-[-0.01em] text-foreground">{x.tittel}</div>
          <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{x.body}</p>
        </div>
      ))}
    </div>
  );
}

export function AnalysereFaner({ data }: { data: AnalysereData }) {
  const [tab, setTab] = useState<TabKey>("sg");
  return (
    <div>
      <SeasonHeader data={data} />
      <div className="flex gap-1 overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {TABS.map((t) => {
          const count =
            t.key === "runder" ? data.kpi.runder !== "—" ? data.kpi.runder : null
            : t.key === "innsikt" ? (data.innsikt.length || null)
            : null;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={
                "relative -mb-px mr-[18px] flex shrink-0 items-center py-3 text-sm font-semibold tracking-[-0.01em] transition-colors " +
                (tab === t.key
                  ? "text-primary after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-primary"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              {t.label}
              {count != null && (
                <span className="ml-1.5 font-mono text-[10px] font-normal text-muted-foreground">{count}</span>
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-5">
        {tab === "sg" && <SGFane data={data} />}
        {tab === "runder" && <RunderFane data={data} />}
        {tab === "trackman" && <TrackManFane data={data} />}
        {tab === "tester" && <TesterFane data={data} />}
        {tab === "innsikt" && <InnsiktFane data={data} />}
      </div>
    </div>
  );
}
