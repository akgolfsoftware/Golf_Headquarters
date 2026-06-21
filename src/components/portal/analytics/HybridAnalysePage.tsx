"use client";

/**
 * HybridAnalysePage — PlayerHQ Analyse (hybrid-design 2026-06-17)
 *
 * Presentasjonslag for /portal/analysere. All data sendes inn som props
 * fra page.tsx (server component). Ingen data-henting her.
 *
 * Faner:
 *   - Strokes Gained  — SG hero-KPI + SgBreakdown-kort + HCP-trend + AI Caddie-notat
 *   - Runder          — Runde-kort med score/SG/GIR/PUTT/FIR
 *   - TrackMan        — Driver-snitt + sprednings-kort
 *   - Tester          — Test-rader + FYS-plassholder
 *
 * Koblede knapper:
 *   - "Tilbake" → /portal
 *   - Runde-kort (klikk) → /portal/analysere/runder/[id]  (read-only view)
 *   - TrackMan-session (klikk) → /portal/analysere/trackman/[id]
 *   - FYS-tester → /portal/analysere/tester
 */

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyticsWorkbenchData } from "@/app/portal/analysere/actions";

// ── helpers ─────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return d.toLocaleDateString("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Oslo",
  });
}

function fmtNb(n: number, decimals = 1): string {
  return n.toLocaleString("nb-NO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function parLabel(score: number, par: number): string {
  const diff = score - par;
  if (diff === 0) return "E";
  return diff > 0 ? `+${diff}` : String(diff);
}

// ── Tab types ────────────────────────────────────────────────────────

type TabKey = "sg" | "runder" | "trackman" | "tester";

const TABS: { key: TabKey; label: string }[] = [
  { key: "sg", label: "Strokes Gained" },
  { key: "runder", label: "Runder" },
  { key: "trackman", label: "TrackMan" },
  { key: "tester", label: "Tester" },
];

// ── Tab bar ──────────────────────────────────────────────────────────

function TabBar({
  active,
  onChange,
  counts,
}: {
  active: TabKey;
  onChange: (k: TabKey) => void;
  counts: Record<TabKey, string>;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {TABS.map((t) => {
        const on = t.key === active;
        return (
          <button
            key={t.key}
            type="button"
            onClick={() => onChange(t.key)}
            className={cn(
              "inline-flex flex-shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold text-foreground transition-colors",
              on
                ? "border-accent bg-accent/16"
                : "border-border bg-card hover:bg-secondary",
            )}
          >
            {t.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0 font-mono text-[9px] font-bold",
                on
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              {counts[t.key]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── SG hero card ─────────────────────────────────────────────────────

// Kombinert mørk modul (fasit "SG PER KATEGORI"): stort SG-tall + 4 kategori-barer.
function SgCategoryModule({
  sgTotal,
  roundCount,
  rows,
}: {
  sgTotal: number | null;
  roundCount: number;
  rows: SgRowData[];
}) {
  const positive = (sgTotal ?? 0) >= 0;
  const valStr = sgTotal != null ? (sgTotal >= 0 ? "+" : "−") + fmtNb(Math.abs(sgTotal)) : "–";

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius)] p-5 text-white shadow-[0_14px_40px_-12px_rgba(0,88,64,0.45)]"
      style={{ background: "linear-gradient(150deg, #005840, #002B1F)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full"
        style={{ background: "radial-gradient(circle, rgba(209,248,67,.20), transparent 68%)" }}
      />
      <div className="relative z-10">
        <div className="mb-3 flex items-start justify-between">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
            SG per kategori
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/45">
            {roundCount > 0 ? `Siste ${roundCount} runder` : "Ingen data"}
          </span>
        </div>
        <div className="font-mono text-[46px] font-semibold leading-none tracking-[-0.025em] tabular-nums text-white">
          {valStr}
        </div>
        {sgTotal != null && (
          <div className="mt-1.5 flex items-center gap-1.5 font-mono text-[11px] text-accent">
            <TrendingUp size={12} strokeWidth={1.6} aria-hidden />
            {positive ? "Over baseline · A1-benchmark" : "Under baseline · A1-benchmark"}
          </div>
        )}
        <div className="mt-5 flex flex-col gap-3">
          {rows.map((r) => {
            const pos = (r.value ?? 0) >= 0;
            const pct = r.value != null ? Math.min(50, (Math.abs(r.value) / 1.0) * 50) : 0;
            const vStr = r.value != null ? (pos ? "+" : "−") + fmtNb(Math.abs(r.value)) : "–";
            return (
              <div key={r.key} className="flex items-center gap-3">
                <span className="w-28 flex-none font-mono text-[11px] text-white/85">{r.name}</span>
                <div className="relative h-2 flex-1 rounded-full bg-white/[0.08]">
                  <span aria-hidden className="absolute left-1/2 top-0 h-full w-px bg-white/20" />
                  {r.value != null && (
                    <span
                      className="absolute top-0 h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        ...(pos
                          ? { left: "50%", background: "linear-gradient(90deg,#005840,var(--lime,#D1F843))" }
                          : { right: "50%", background: "var(--t-down,#F0683E)" }),
                      }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "w-12 flex-none text-right font-mono text-[12px] font-bold tabular-nums",
                    r.value == null ? "text-white/40" : pos ? "text-[var(--t-up,#4FD08A)]" : "text-[var(--t-down,#F0683E)]",
                  )}
                >
                  {vStr}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── SG breakdown card ────────────────────────────────────────────────

type SgRowData = {
  key: string;
  name: string;
  value: number | null;
};

// ── HCP TrendBand card ───────────────────────────────────────────────

function TrendBandCard({ rounds }: { rounds: { playedAt: Date; score: number; par: number }[] }) {
  // Build a lightweight inline SVG trend for score-over-time (no recharts dep)
  const pts = rounds
    .slice()
    .reverse()
    .slice(-10)
    .map((r, i) => ({ i, score: r.score, playedAt: r.playedAt }));

  if (pts.length < 2) {
    return (
      <div className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-[0_1px_2px_rgba(10,31,23,.05)]">
        <div className="mb-1 font-display text-[17px] font-bold tracking-[-0.02em] text-foreground">
          Trend<em className="font-medium italic text-primary">Band</em>
        </div>
        <p className="text-[12.5px] text-muted-foreground">
          Trenger minst 2 runder for å vise trend.
        </p>
      </div>
    );
  }

  const W = 318;
  const H = 110;
  const pL = 6;
  const pR = 6;
  const pT = 12;
  const pB = 20;
  const scores = pts.map((p) => p.score);
  const minS = Math.min(...scores) - 2;
  const maxS = Math.max(...scores) + 2;
  const xOf = (i: number) => pL + (i * (W - pL - pR)) / (pts.length - 1);
  const yOf = (s: number) => pT + ((s - minS) / (maxS - minS)) * (H - pT - pB);

  const linePath = pts
    .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)} ${yOf(p.score).toFixed(1)}`)
    .join(" ");

  const areaPath =
    pts
      .map((p, i) => `${i === 0 ? "M" : "L"}${xOf(i).toFixed(1)} ${yOf(p.score).toFixed(1)}`)
      .join(" ") +
    ` L${xOf(pts.length - 1).toFixed(1)} ${H - pB} L${xOf(0).toFixed(1)} ${H - pB} Z`;

  const pbIdx = scores.indexOf(Math.min(...scores));

  const labels = pts.map((p, i) => {
    const m = p.playedAt.getMonth() + 1;
    const d = p.playedAt.getDate();
    return `<text x="${xOf(i).toFixed(1)}" y="${H - 5}" text-anchor="middle" font-family="var(--font-jetbrains-mono,monospace)" font-size="8" fill="var(--color-muted-foreground)">${d}/${m}</text>`;
  });

  const dots = pts.map((p, i) => {
    const isPb = i === pbIdx;
    return `<circle cx="${xOf(i).toFixed(1)}" cy="${yOf(p.score).toFixed(1)}" r="${isPb ? 5 : 3}" fill="${isPb ? "#D1F843" : "white"}" stroke="${isPb ? "#005840" : "#1A7D56"}" stroke-width="2"/>`;
  });

  // Team Norway benchmark band: top-10% scores (lower is better in golf)
  const sortedScores = [...scores].sort((a, b) => a - b);
  const tnTop = sortedScores[Math.floor(sortedScores.length * 0.25)] ?? minS;
  const tnBot = sortedScores[Math.floor(sortedScores.length * 0.65)] ?? maxS;
  const tnY1 = Math.max(pT, yOf(tnTop)).toFixed(1);
  const tnY2 = Math.min(H - pB, yOf(tnBot)).toFixed(1);

  const svgHtml = `<svg viewBox="0 0 ${W} ${H}" width="100%" height="110" style="display:block;">
    <defs>
      <linearGradient id="tgA" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#D1F843" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#D1F843" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <!-- Team Norway band -->
    <rect x="${pL}" y="${tnY1}" width="${W - pL - pR}" height="${(parseFloat(tnY2) - parseFloat(tnY1)).toFixed(1)}" fill="#005840" fill-opacity="0.10" rx="3"/>
    <path d="${areaPath}" fill="url(#tgA)"/>
    <path d="${linePath}" fill="none" stroke="#D1F843" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots.join("")}
    ${pbIdx >= 0 ? `<text x="${xOf(pbIdx).toFixed(1)}" y="${(yOf(scores[pbIdx]) - 8).toFixed(1)}" text-anchor="middle" font-family="var(--font-jetbrains-mono,monospace)" font-size="8" font-weight="700" fill="#005840">PB</text>` : ""}
    ${labels.join("")}
  </svg>`;

  return (
    <div className="rounded-[var(--radius)] border border-border bg-card p-5 shadow-[0_1px_2px_rgba(10,31,23,.05)]">
      <div className="mb-1 flex items-start justify-between">
        <div className="font-display text-[17px] font-bold tracking-[-0.02em] text-foreground">
          Trend<em className="font-medium italic text-primary">Band</em>
        </div>
        <span className="rounded-[5px] border border-border px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-[0.04em] text-muted-foreground">
          HCP
        </span>
      </div>
      <p className="mb-3.5 text-[12.5px] text-muted-foreground">
        <strong className="text-foreground">PB-punkt</strong> markert med lime. Grønt bånd = Team Norway-sone.
      </p>
      <div dangerouslySetInnerHTML={{ __html: svgHtml }} />
      <div className="mt-3 flex gap-4 font-mono text-[10.5px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3.5 rounded-sm" style={{ background: "rgba(0,88,64,.20)" }} />
          Team Norway
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3.5 rounded-sm" style={{ background: "#D1F843", opacity: 0.7 }} />
          Din linje
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full border-2 border-primary"
            style={{ background: "#D1F843" }}
          />
          PB
        </span>
      </div>
    </div>
  );
}

// ── AI Caddie insight card ────────────────────────────────────────────

function AiCaddieCard({ sgBreakdown }: { sgBreakdown: AnalyticsWorkbenchData["sgBreakdown"] }) {
  const argVal = sgBreakdown.sgArg;
  const hasMønster = argVal != null && argVal < 0;
  const subtitle = hasMønster ? "Mønster oppdaget" : "Samler data";
  const body = hasMønster
    ? `Du mister i snitt ${fmtNb(Math.abs(argVal!))} SG på nærspill (ARG). Mønsteret peker mot rutine — neste økt setter vi opp ARG-matrise.`
    : "AI Caddie har ikke nok data til å generere et mønster ennå. Registrer flere runder for å aktivere innsikter.";

  return (
    <div className="rounded-[var(--radius)] border border-border border-l-[3px] border-l-accent bg-card p-4 shadow-[0_1px_2px_rgba(10,31,23,.05)]">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-primary font-mono text-[12px] font-bold text-accent">
          AK
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-[14.5px] font-bold text-foreground">AI Caddie</div>
          <div className="font-mono text-[9.5px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {subtitle}
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[10px] text-muted-foreground">
          Nå
        </span>
      </div>
      <p className="mt-3.5 text-[13.5px] leading-[1.55] text-foreground">
        {body}
      </p>
    </div>
  );
}

// ── Round card ───────────────────────────────────────────────────────

type RoundCardProps = {
  id: string;
  courseName: string;
  playedAt: Date;
  score: number;
  par: number;
  sgTotal: number | null;
  shots: number;
};

function RoundCard({ id, courseName, playedAt, score, par, sgTotal }: RoundCardProps) {
  const diff = score - par;
  const parPositive = diff <= 0;

  return (
    <Link href={`/portal/analysere/runder/${id}`}>
      <div className="rounded-[var(--radius-md)] border border-border bg-card px-4 py-3.5 shadow-[0_1px_2px_rgba(10,31,23,.04)] hover:bg-secondary transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[14.5px] font-bold text-foreground">{courseName}</div>
            <div className="mt-0.5 font-mono text-[10.5px] text-muted-foreground">
              {fmtDate(playedAt)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-[26px] font-semibold leading-none tabular-nums text-foreground">
              {score}
            </div>
            <div
              className="mt-0.5 font-mono text-[10px]"
              style={{
                color: parPositive
                  ? "hsl(var(--success))"
                  : diff === 0
                    ? "hsl(var(--muted-foreground))"
                    : "hsl(var(--destructive))",
              }}
            >
              {parLabel(score, par)}
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2 border-t border-border/60 pt-3">
          {[
            { key: "SG", val: sgTotal != null ? (sgTotal >= 0 ? "+" : "") + fmtNb(sgTotal) : "–" },
            { key: "PUTT", val: "–" },
            { key: "GIR", val: "–" },
            { key: "FIR", val: "–" },
          ].map(({ key, val }) => (
            <div key={key}>
              <div className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-muted-foreground">
                {key}
              </div>
              <div className="mt-0.5 font-mono text-[13px] font-semibold text-foreground">
                {val}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}

// ── TrackMan tab ─────────────────────────────────────────────────────

function TrackManTab({ trackman }: { trackman: AnalyticsWorkbenchData["trackman"] }) {
  const driver = trackman.clubs.find(
    (c) => c.club.toLowerCase().includes("driver") || c.club === "D",
  );

  return (
    <div className="flex flex-col gap-2.5">
      {/* Driver snitt */}
      <div className="rounded-[var(--radius)] border border-border bg-card p-4">
        <div className="mb-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          {driver ? `${driver.club} — snitt · ${driver.shots} slag` : "Driver — snitt · siste økt"}
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            {
              label: "Carry",
              val: driver?.avgTotal != null ? String(Math.round(driver.avgTotal)) : "–",
              unit: "m",
            },
            {
              label: "Ball speed",
              val: driver?.avgBallSpeed != null ? String(Math.round(driver.avgBallSpeed)) : "–",
              unit: "km/t",
            },
            {
              label: "Smash",
              val: driver?.avgSmash != null ? driver.avgSmash.toFixed(2) : "–",
              unit: "",
            },
          ].map(({ label, val, unit }) => (
            <div key={label}>
              <div className="font-mono text-[8px] uppercase tracking-[0.08em] text-muted-foreground">
                {label}
              </div>
              <div className="mt-1.5 font-mono text-[22px] font-semibold tabular-nums text-foreground leading-none">
                {val}
                {unit && (
                  <small className="ml-0.5 text-[11px] font-normal text-muted-foreground">
                    {" "}{unit}
                  </small>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Økt-liste */}
      <div className="rounded-[var(--radius)] border border-border bg-card p-4">
        <div className="mb-3 font-mono text-[9.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          Siste TrackMan-økter
        </div>
        {trackman.sessions.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">Ingen TrackMan-data registrert.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {trackman.sessions.slice(0, 5).map((s) => (
              <Link key={s.id} href={`/portal/analysere/trackman/${s.id}`}>
                <div className="flex items-center justify-between rounded-[10px] border border-border/60 bg-secondary px-3 py-2.5 hover:bg-muted transition-colors">
                  <div>
                    <div className="text-[13px] font-semibold text-foreground">
                      {s.source}
                    </div>
                    <div className="font-mono text-[10.5px] text-muted-foreground">
                      {fmtDate(s.recordedAt)}
                    </div>
                  </div>
                  <div className="font-mono text-[13px] font-semibold text-muted-foreground">
                    {s.shotCount} slag
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tester tab ───────────────────────────────────────────────────────

function TesterTab({ tests }: { tests: AnalyticsWorkbenchData["tests"] }) {
  return (
    <div className="flex flex-col gap-2.5">
      {tests.length === 0 ? (
        <div className="rounded-[var(--radius-md)] border border-border bg-card p-5 text-center">
          <p className="text-[13px] text-muted-foreground">Ingen tester registrert ennå.</p>
          <Link
            href="/portal/analysere/tester"
            className="mt-3 inline-block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary"
          >
            Se alle tester →
          </Link>
        </div>
      ) : (
        tests.slice(0, 6).map((t) => {
          const isFys = t.pyramidArea === "FYS";
          return (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-card px-4 py-3.5"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[13.5px] font-bold text-foreground">{t.name}</div>
                <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                  {t.pyramidArea} · {fmtDate(t.takenAt)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[20px] font-semibold tabular-nums leading-none text-foreground">
                  {isFys ? "–" : fmtNb(t.score, 0)}
                </div>
                {isFys && (
                  <div className="font-mono text-[9.5px] text-muted-foreground mt-0.5">
                    plassholder
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      <p className="text-center font-mono text-[9.5px] text-muted-foreground">
        FYS-resultater = plassholdertall
      </p>
    </div>
  );
}

// ── Root component ────────────────────────────────────────────────────

export type HybridAnalysePageProps = {
  data: AnalyticsWorkbenchData;
};

export function HybridAnalysePage({ data }: HybridAnalysePageProps) {
  const [tab, setTab] = useState<TabKey>("sg");

  const sgRows = [
    { key: "OTT", name: "Off the tee", value: data.sgBreakdown.sgOtt },
    { key: "APP", name: "Approach", value: data.sgBreakdown.sgApp },
    { key: "ARG", name: "Around green", value: data.sgBreakdown.sgArg },
    { key: "PUTT", name: "Putting", value: data.sgBreakdown.sgPutt },
  ];

  const counts: Record<TabKey, string> = {
    sg: "SG",
    runder: String(data.rounds.totalRounds),
    trackman: String(data.trackman.sessions.length),
    tester: String(data.tests.length),
  };

  return (
    <div className="max-w-[460px] mx-auto space-y-4 px-0">
      {/* ── Hero ── */}
      <div className="pt-1">
        <Link
          href="/portal"
          className="mb-3 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} strokeWidth={2.2} aria-hidden />
          Tilbake
        </Link>
        <span className="block font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground mb-2.5">
          Analyse · Øyvind Rohjan
        </span>
        <h1 className="font-display text-[32px] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
          Strokes Gained{" "}
          <em className="font-medium italic text-primary">i dybden</em>
        </h1>
      </div>

      {/* ── Tab bar ── */}
      <TabBar active={tab} onChange={setTab} counts={counts} />

      {/* ── SG tab ── */}
      {tab === "sg" && (
        <div className="flex flex-col gap-3">
          <SgCategoryModule
            sgTotal={data.sgBreakdown.sgTotal}
            roundCount={data.sgBreakdown.roundCount}
            rows={sgRows}
          />
          <TrendBandCard rounds={data.rounds.rounds} />
          <AiCaddieCard sgBreakdown={data.sgBreakdown} />
        </div>
      )}

      {/* ── Runder tab ── */}
      {tab === "runder" && (
        <div className="flex flex-col gap-2.5">
          {data.rounds.rounds.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-border bg-card p-5 text-center">
              <p className="text-[13px] text-muted-foreground">Ingen runder registrert ennå.</p>
              <Link
                href="/portal/mal/runder/ny"
                className="mt-3 inline-block font-mono text-[11px] font-bold uppercase tracking-[0.1em] text-primary"
              >
                Logg runde →
              </Link>
            </div>
          ) : (
            data.rounds.rounds.map((r) => (
              <RoundCard
                key={r.id}
                id={r.id}
                courseName={r.courseName}
                playedAt={r.playedAt}
                score={r.score}
                par={r.par}
                sgTotal={r.sgTotal}
                shots={r.shots}
              />
            ))
          )}
        </div>
      )}

      {/* ── TrackMan tab ── */}
      {tab === "trackman" && <TrackManTab trackman={data.trackman} />}

      {/* ── Tester tab ── */}
      {tab === "tester" && <TesterTab tests={data.tests} />}
    </div>
  );
}
