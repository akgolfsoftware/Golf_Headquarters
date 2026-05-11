/**
 * PILOT — PlayerHQ Comparison (modal)
 * Bygd direkte fra wireframe/design-files-v2/modaler-D/d06-comparison.html
 * URL: /comparison-demo
 *
 * Mock-data: Borre 1. mai 2026 vs GFGK 8. mai 2026. Markus Roinås Pedersen.
 */

import { X, ChevronDown, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";

const BACKDROP = "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

export default function ComparisonDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[880px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-6">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              PlayerHQ · Sammenlign to runder
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Sammenligning
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              Borre 1. mai vs GFGK 8. mai — side-by-side med diff og SG-radar.
            </p>
          </div>
          <button
            type="button"
            aria-label="Lukk"
            className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </header>

        <div className="px-8 pb-2">
          {/* Pick-row */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-3.5 pt-4">
            <PickCard label="Før" title="Borre · 1. mai 2026" meta="74 (−1) · 18 hull · 28 putts · personlig beste" />
            <div className="self-center px-1 font-display text-[18px] italic text-muted-foreground">vs</div>
            <PickCard label="Etter" title="GFGK · 8. mai 2026" meta="76 (+5) · 18 hull · 31 putts · vind 7 m/s" />
          </div>

          {/* Compare-table */}
          <div className="mt-5 overflow-hidden rounded-xl border-[1.5px] border-border font-mono tabular-nums">
            <CtHead />
            <CtSection label="Scoring" />
            <CtRow metric="Total score" sub="↓ er bedre" a="74" b="76" diff="+2 · 2,7 %" diffTone="bad" />
            <CtRow metric="Putts" sub="↓ er bedre" a="28" b="31" diff="+3" diffTone="bad" />
            <CtRow metric="FIR" sub="↑ er bedre" a="11/14" b="9/14" diff="−2 · −14 %" diffTone="bad" />
            <CtRow metric="GIR" sub="↑ er bedre" a="13/18" b="11/18" diff="−2" diffTone="bad" />
            <CtSection label="Strokes gained" />
            <CtRow metric="SG: Off-tee" sub="↑ er bedre" a="+0,8" b="+0,4" diff="−0,4" diffTone="bad" />
            <CtRow metric="SG: Approach" sub="↑ er bedre" a="−0,4" b="+0,8" diff="+1,2" diffTone="good" />
            <CtRow metric="SG: Around-green" sub="↑ er bedre" a="+0,2" b="+0,3" diff="+0,1" diffTone="good" />
            <CtRow metric="SG: Putting" sub="↑ er bedre" a="+1,1" b="−0,3" diff="−1,4" diffTone="bad" />
            <CtTotal a="+1,7" b="+1,2" diff="−0,5" />
          </div>

          {/* Radar */}
          <div className="mt-5 rounded-xl border border-border bg-secondary px-5 py-5.5">
            <div className="mb-3 flex items-baseline justify-between">
              <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
                SG-profil · radar
              </div>
              <div className="flex gap-3.5 font-mono text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#005840" }} />
                  Borre 1. mai
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#D1F843" }} />
                  GFGK 8. mai
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <Radar />
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Lukk
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Eksporter PDF
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Send til Anders
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function PickCard({ label, title, meta }: { label: string; title: string; meta: string }) {
  return (
    <div className="cursor-pointer rounded-xl border-[1.5px] border-border bg-card px-4 py-3.5">
      <div className="mb-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </div>
      <div className="flex items-center justify-between font-display text-[15px] font-semibold -tracking-[0.005em] text-foreground">
        {title}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2} />
      </div>
      <div className="mt-1 font-mono text-[11px] tabular-nums text-muted-foreground">{meta}</div>
    </div>
  );
}

function CtHead() {
  return (
    <div
      className="grid items-center border-b-[1.5px] border-border bg-secondary text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground"
      style={{ gridTemplateColumns: "1.7fr 1fr 1fr 1.3fr" }}
    >
      <div className="px-4 py-3 text-left">Metrikk</div>
      <div className="px-4 py-3 text-right">Borre · 1. mai</div>
      <div className="px-4 py-3 text-right">GFGK · 8. mai</div>
      <div className="px-4 py-3 text-right">Diff</div>
    </div>
  );
}

function CtSection({ label }: { label: string }) {
  return (
    <div
      className="grid items-center bg-background"
      style={{ gridTemplateColumns: "1.7fr 1fr 1fr 1.3fr" }}
    >
      <div className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
        {label}
      </div>
      <div />
      <div />
      <div />
    </div>
  );
}

function CtRow({
  metric,
  sub,
  a,
  b,
  diff,
  diffTone,
}: {
  metric: string;
  sub: string;
  a: string;
  b: string;
  diff: string;
  diffTone: "good" | "bad" | "flat";
}) {
  return (
    <div
      className="grid items-center border-b border-border last:border-b-0 text-[13px] text-foreground"
      style={{ gridTemplateColumns: "1.7fr 1fr 1fr 1.3fr" }}
    >
      <div className="px-4 py-3 text-left font-bold">
        {metric}
        <span className="ml-2 font-mono text-[10px] font-normal uppercase tracking-[0.05em] text-muted-foreground">
          {sub}
        </span>
      </div>
      <div className="px-4 py-3 text-right">{a}</div>
      <div className="px-4 py-3 text-right">{b}</div>
      <div className="px-4 py-3 text-right">
        <DiffPill diff={diff} tone={diffTone} />
      </div>
    </div>
  );
}

function CtTotal({ a, b, diff }: { a: string; b: string; diff: string }) {
  return (
    <div
      className="grid items-center bg-secondary text-[13px] font-bold text-foreground"
      style={{ gridTemplateColumns: "1.7fr 1fr 1fr 1.3fr" }}
    >
      <div className="px-4 py-3 text-left">SG total</div>
      <div className="px-4 py-3 text-right">{a}</div>
      <div className="px-4 py-3 text-right">{b}</div>
      <div className="px-4 py-3 text-right">
        <DiffPill diff={diff} tone="bad" />
      </div>
    </div>
  );
}

function DiffPill({ diff, tone }: { diff: string; tone: "good" | "bad" | "flat" }) {
  const isUp = diff.trim().startsWith("+");
  const cls =
    tone === "good"
      ? "bg-[rgba(22,163,74,0.12)] text-[#16A34A]"
      : tone === "bad"
        ? "bg-[rgba(197,48,48,0.1)] text-[#a83232]"
        : "bg-secondary text-muted-foreground";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-bold ${cls}`}>
      {tone !== "flat" && (isUp ? <TrendingUp className="h-2.5 w-2.5" strokeWidth={2.4} /> : <TrendingDown className="h-2.5 w-2.5" strokeWidth={2.4} />)}
      {diff}
    </span>
  );
}

function Radar() {
  return (
    <svg width="320" height="240" viewBox="-160 -120 320 240" style={{ overflow: "visible" }}>
      <polygon points="0,-90 78,-45 78,45 0,90 -78,45 -78,-45" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
      <polygon points="0,-60 52,-30 52,30 0,60 -52,30 -52,-30" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
      <polygon points="0,-30 26,-15 26,15 0,30 -26,15 -26,-15" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
      <line x1="0" y1="0" x2="0" y2="-90" stroke="hsl(var(--border))" strokeWidth="1" />
      <line x1="0" y1="0" x2="78" y2="-45" stroke="hsl(var(--border))" strokeWidth="1" />
      <line x1="0" y1="0" x2="78" y2="45" stroke="hsl(var(--border))" strokeWidth="1" />
      <line x1="0" y1="0" x2="0" y2="90" stroke="hsl(var(--border))" strokeWidth="1" />
      <line x1="0" y1="0" x2="-78" y2="45" stroke="hsl(var(--border))" strokeWidth="1" />
      <line x1="0" y1="0" x2="-78" y2="-45" stroke="hsl(var(--border))" strokeWidth="1" />
      <polygon points="0,-65 60,-35 70,40 0,80 -25,15 -45,-25" fill="rgba(0,88,64,0.25)" stroke="#005840" strokeWidth="2" />
      <polygon points="0,-45 75,-43 50,30 0,30 -55,32 -35,-20" fill="rgba(209,248,67,0.32)" stroke="#86a929" strokeWidth="2" />
      <text x="0" y="-100" textAnchor="middle" fontFamily="var(--font-geist-mono, monospace)" fontSize="10" fill="currentColor">
        OFF-TEE
      </text>
      <text x="92" y="-48" textAnchor="start" fontFamily="var(--font-geist-mono, monospace)" fontSize="10" fill="currentColor">
        APPROACH
      </text>
      <text x="92" y="52" textAnchor="start" fontFamily="var(--font-geist-mono, monospace)" fontSize="10" fill="currentColor">
        AROUND-GREEN
      </text>
      <text x="0" y="106" textAnchor="middle" fontFamily="var(--font-geist-mono, monospace)" fontSize="10" fill="currentColor">
        PUTTING
      </text>
      <text x="-92" y="52" textAnchor="end" fontFamily="var(--font-geist-mono, monospace)" fontSize="10" fill="currentColor">
        SCRAMBLING
      </text>
      <text x="-92" y="-48" textAnchor="end" fontFamily="var(--font-geist-mono, monospace)" fontSize="10" fill="currentColor">
        TEMPO
      </text>
    </svg>
  );
}
