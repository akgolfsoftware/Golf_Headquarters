/**
 * PILOT — PlayerHQ Round Detail (modal)
 * Bygd direkte fra wireframe/design-files-v2/modaler-D/d01-round-detail.html
 * URL: /round-detail-demo
 *
 * Mock-data: Borre Golfklubb · 1. mai 2026 · 74 (−1). Markus Roinås Pedersen.
 */

import { X, Download, ArrowRight } from "lucide-react";

const BACKDROP =
  "fixed inset-0 z-0 bg-[rgba(10,31,24,0.5)]" as const;

type ScoreClass = "" | "birdie" | "bogey" | "double" | "eagle";

interface HoleRow {
  hole: string;
  par: string;
  score: string;
  scoreClass?: ScoreClass;
  diff: string;
  diffClass?: "birdie" | "bogey" | "neutral";
  fir: "yes" | "no" | "dash";
  gir: "yes" | "no" | "dash";
  putts: string;
  note: string;
}

const FRONT: HoleRow[] = [
  { hole: "1", par: "4", score: "4", diff: "E", fir: "yes", gir: "yes", putts: "2", note: "—" },
  { hole: "2", par: "5", score: "4", scoreClass: "birdie", diff: "−1", diffClass: "birdie", fir: "yes", gir: "yes", putts: "1", note: "draw" },
  { hole: "3", par: "3", score: "3", diff: "E", fir: "dash", gir: "yes", putts: "2", note: "—" },
  { hole: "4", par: "4", score: "4", diff: "E", fir: "yes", gir: "no", putts: "1", note: "up&down" },
  { hole: "5", par: "4", score: "5", scoreClass: "bogey", diff: "+1", diffClass: "bogey", fir: "no", gir: "no", putts: "2", note: "venstre-rough" },
  { hole: "6", par: "5", score: "5", diff: "E", fir: "yes", gir: "yes", putts: "2", note: "—" },
  { hole: "7", par: "4", score: "5", scoreClass: "bogey", diff: "+1", diffClass: "bogey", fir: "no", gir: "yes", putts: "2", note: "drive 230 m off-line" },
  { hole: "8", par: "3", score: "2", scoreClass: "birdie", diff: "−1", diffClass: "birdie", fir: "dash", gir: "yes", putts: "1", note: "8-iron 2 m" },
  { hole: "9", par: "4", score: "4", diff: "E", fir: "yes", gir: "yes", putts: "2", note: "—" },
];

const BACK: HoleRow[] = [
  { hole: "10", par: "4", score: "4", diff: "E", fir: "yes", gir: "yes", putts: "2", note: "—" },
  { hole: "11", par: "5", score: "5", diff: "E", fir: "yes", gir: "yes", putts: "2", note: "—" },
  { hole: "12", par: "3", score: "4", scoreClass: "bogey", diff: "+1", diffClass: "bogey", fir: "dash", gir: "no", putts: "2", note: "drive 200 m off-line" },
  { hole: "13", par: "4", score: "4", diff: "E", fir: "yes", gir: "yes", putts: "2", note: "—" },
  { hole: "14", par: "4", score: "3", scoreClass: "birdie", diff: "−1", diffClass: "birdie", fir: "yes", gir: "yes", putts: "1", note: "approach 1,5 m" },
  { hole: "15", par: "4", score: "4", diff: "E", fir: "yes", gir: "yes", putts: "2", note: "—" },
  { hole: "16", par: "5", score: "5", diff: "E", fir: "no", gir: "yes", putts: "2", note: "—" },
  { hole: "17", par: "3", score: "3", diff: "E", fir: "dash", gir: "yes", putts: "1", note: "vind hjelp" },
  { hole: "18", par: "4", score: "5", scoreClass: "bogey", diff: "+1", diffClass: "bogey", fir: "yes", gir: "no", putts: "2", note: "3-putt" },
];

const TABS = ["Scorekort", "SG-breakdown", "Notater", "Bilder · 4"];

export default function RoundDetailDemo() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className={BACKDROP} aria-hidden="true" />

      <div className="relative z-10 mx-auto my-8 w-full max-w-[880px] overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
        {/* Head */}
        <header className="flex items-start justify-between gap-4 border-b border-border px-8 pb-5 pt-7">
          <div>
            <div className="font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
              PlayerHQ · runde-arkiv · Borre Golfklubb
            </div>
            <h2 className="mt-1.5 font-display text-[26px] font-semibold leading-tight tracking-tight text-foreground">
              Borre — 1. mai 2026
            </h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              74 (−1) · 18 hull · 4 t 12 m · hvit tee 5 980 m · vind 4 m/s NV
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

        {/* Hero-stats */}
        <div className="grid grid-cols-4 gap-2.5 px-8 pt-4">
          <HeroStat label="Score" value="74" delta="−1 · personlig beste" tone="gold" />
          <HeroStat label="Putts" value="28" delta="−3 vs snitt" tone="good" deltaTone="up" />
          <HeroStat label="FIR" value="11/14" delta="79 % · godt" />
          <HeroStat label="GIR" value="13/18" delta="72 % · over snitt" />
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-6 border-b border-border px-8">
          {TABS.map((tab, i) => (
            <span
              key={tab}
              className={`relative -mb-px cursor-pointer border-b-2 py-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.07em] transition-colors ${
                i === 0
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Body */}
        <div className="px-0 pb-2 pt-0">
          <div className="mx-8 mb-2 mt-4 overflow-hidden rounded-xl border border-border font-mono text-[12px] tabular-nums">
            <ScHead />
            {FRONT.map((r) => (
              <ScRow key={r.hole} row={r} />
            ))}
            <ScSubtotal label="Ut" par="36" score="36" diff="E" fir="6/8" gir="7/9" putts="15" />
            {BACK.map((r) => (
              <ScRow key={r.hole} row={r} />
            ))}
            <ScSubtotal label="Inn" par="36" score="37" diff="+1" fir="5/6" gir="6/9" putts="13" />
            <ScTotal />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 px-8 pb-4 pt-1.5 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            <LegendItem color="#D1F843" label="Birdie" />
            <LegendItem color="rgba(244,196,48,0.4)" label="Bogey" />
            <LegendItem color="rgba(197,48,48,0.2)" label="Double+" />
            <span>FIR = fairway treff · GIR = green i regulering</span>
          </div>
        </div>

        {/* Foot */}
        <footer className="flex items-center justify-between gap-3 border-t border-border bg-secondary/40 px-8 py-4">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
            Eksporter PDF
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3.5 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
            >
              Sammenlign med …
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

function HeroStat({
  label,
  value,
  delta,
  tone,
  deltaTone,
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "good" | "gold";
  deltaTone?: "up";
}) {
  const border =
    tone === "good"
      ? "border-[rgba(22,163,74,0.35)] bg-[rgba(22,163,74,0.06)]"
      : tone === "gold"
        ? "border-[rgba(244,196,48,0.45)] bg-[rgba(244,196,48,0.06)]"
        : "border-border bg-card";
  const deltaCls =
    tone === "gold"
      ? "text-[#B8860B] font-bold"
      : deltaTone === "up"
        ? "text-[#16A34A] font-bold"
        : "text-muted-foreground";
  return (
    <div className={`relative rounded-xl border-[1.5px] px-4 py-3.5 ${border}`}>
      <div className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 font-display text-[28px] font-semibold leading-none -tracking-tight text-foreground">
        {value}
      </div>
      <div className={`mt-1 font-mono text-[11px] tabular-nums ${deltaCls}`}>{delta}</div>
    </div>
  );
}

function ScHead() {
  return (
    <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b-[1.5px] border-border bg-secondary/60 text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
      {["Hull", "Par", "Score", "+/−", "FIR", "GIR", "Putts", "Notat"].map((h, i) => (
        <div
          key={h}
          className={`px-2 py-2.5 text-center ${i === 0 ? "pl-3.5 text-left" : ""}`}
        >
          {h}
        </div>
      ))}
    </div>
  );
}

function ScRow({ row }: { row: HoleRow }) {
  return (
    <div className="grid grid-cols-[56px_repeat(7,1fr)] items-center border-b border-border text-center text-foreground last:border-b-0">
      <div className="py-2 pl-3.5 text-left font-mono text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground">
        {row.hole}
      </div>
      <div className="px-2 py-2">{row.par}</div>
      <div className="px-2 py-2">
        <ScoreBubble value={row.score} kind={row.scoreClass} />
      </div>
      <div
        className={`px-2 py-2 font-bold ${
          row.diffClass === "birdie"
            ? "text-[#4d6107]"
            : row.diffClass === "bogey"
              ? "text-[#a37205]"
              : ""
        }`}
      >
        {row.diff}
      </div>
      <div className={`px-2 py-2 ${row.fir === "yes" ? "font-bold text-[#16A34A]" : "text-muted-foreground"}`}>
        {row.fir === "yes" ? "✓" : row.fir === "no" ? "·" : "—"}
      </div>
      <div className={`px-2 py-2 ${row.gir === "yes" ? "font-bold text-[#16A34A]" : "text-muted-foreground"}`}>
        {row.gir === "yes" ? "✓" : row.gir === "no" ? "·" : "—"}
      </div>
      <div className="px-2 py-2">{row.putts}</div>
      <div className="px-2 py-2 text-muted-foreground">{row.note}</div>
    </div>
  );
}

function ScoreBubble({ value, kind }: { value: string; kind?: ScoreClass }) {
  const cls =
    kind === "eagle"
      ? "bg-[rgba(244,196,48,0.25)] text-[#8a6608]"
      : kind === "birdie"
        ? "bg-[rgba(209,248,67,0.45)] text-[#4d6107] border-[1.5px] border-[#b3d83a]"
        : kind === "bogey"
          ? "bg-[rgba(244,196,48,0.12)] text-[#a37205]"
          : kind === "double"
            ? "bg-[rgba(197,48,48,0.15)] text-[#8a1d1d]"
            : "";
  return (
    <span
      className={`inline-flex h-6.5 min-w-6.5 items-center justify-center rounded-full text-[12px] font-bold ${cls}`}
      style={{ minWidth: 26, height: 26 }}
    >
      {value}
    </span>
  );
}

function ScSubtotal({
  label,
  par,
  score,
  diff,
  fir,
  gir,
  putts,
}: {
  label: string;
  par: string;
  score: string;
  diff: string;
  fir: string;
  gir: string;
  putts: string;
}) {
  return (
    <div className="grid grid-cols-[56px_repeat(7,1fr)] items-center border-b border-border bg-secondary/60 text-center font-bold text-foreground last:border-b-0">
      <div className="py-2 pl-3.5 text-left font-mono text-[10px] uppercase tracking-[0.07em]">{label}</div>
      <div className="px-2 py-2">{par}</div>
      <div className="px-2 py-2">{score}</div>
      <div className="px-2 py-2">{diff}</div>
      <div className="px-2 py-2">{fir}</div>
      <div className="px-2 py-2">{gir}</div>
      <div className="px-2 py-2">{putts}</div>
      <div className="px-2 py-2" />
    </div>
  );
}

function ScTotal() {
  return (
    <div className="grid grid-cols-[56px_repeat(7,1fr)] items-center bg-primary text-center font-bold text-accent">
      <div className="py-2.5 pl-3.5 text-left font-mono text-[10px] uppercase tracking-[0.07em]">Total</div>
      <div className="px-2 py-2.5">71</div>
      <div className="px-2 py-2.5">74</div>
      <div className="px-2 py-2.5">−1</div>
      <div className="px-2 py-2.5">11/14</div>
      <div className="px-2 py-2.5">13/18</div>
      <div className="px-2 py-2.5">28</div>
      <div />
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
