"use client";

import { useState } from "react";
import { X, TrendingUp, Target, Activity, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { Sparkline } from "@/components/athletic/sparkline";

/* ─────────────────────────────────────────────────────────────────────────
   Hull-analyse — TOP-DOWN-layout (ShotScope-stil). Hele hullet sett rett
   ovenfra → konsistent målestokk, så markør-plassering blir riktig (ingen
   perspektiv-feil). Kategori-markører ligger langs shot-pathen fra tee til
   green; trykk → stats + treningsdata.

   Bakgrunnen er nå et rent SVG-hull (plassholder). Når top-down-fotoet fra
   Grok er klart: bytt <HolePlaceholder/> med <Image src=… /> og finjuster
   markør-posisjonene (x/y i %) så de matcher fotoets shot-path.
   viewBox 0 0 100 160 (portrett). Marker-% = punkt/(100,160)*100.
   ───────────────────────────────────────────────────────────────────────── */

const PATH = "M50 150 Q43 128 50 110 Q58 92 46 74 Q38 58 51 44 Q56 36 50 28";

type Cat = {
  id: string;
  label: string;
  sub: string;
  x: number; // % horisontalt
  y: number; // % vertikalt
  sg: number;
  hit: { label: string; value: string };
  attempts: string;
  okter: number;
  slag: number;
  trend: number[];
};

const CATS: Cat[] = [
  { id: "tee", label: "Tee total", sub: "Driver · snitt 248 m", x: 50, y: 93, sg: 0.31, hit: { label: "Fairway", value: "64 %" }, attempts: "28 slag", okter: 8, slag: 142, trend: [3, 4, 3, 5, 6, 5, 7, 8] },
  { id: "inn200", label: "Innspill 200+", sub: "3-tre / hybrid", x: 44, y: 77, sg: -0.12, hit: { label: "GIR", value: "29 %" }, attempts: "14 slag", okter: 4, slag: 36, trend: [4, 3, 4, 3, 2, 3, 3, 2] },
  { id: "inn150", label: "Innspill 150–200", sub: "5–7 jern", x: 53, y: 61, sg: 0.08, hit: { label: "GIR", value: "48 %" }, attempts: "31 slag", okter: 6, slag: 88, trend: [3, 4, 4, 5, 4, 6, 5, 6] },
  { id: "inn100", label: "Innspill 100–150", sub: "8-jern – PW", x: 45, y: 45, sg: 0.22, hit: { label: "GIR", value: "61 %" }, attempts: "44 slag", okter: 9, slag: 156, trend: [4, 5, 5, 6, 6, 7, 7, 8] },
  { id: "near", label: "Nærspill 0–100", sub: "Chip / pitch", x: 52, y: 31, sg: 0.02, hit: { label: "≤ 2 m", value: "52 %" }, attempts: "89 slag", okter: 8, slag: 300, trend: [4, 4, 5, 5, 6, 5, 6, 7] },
  { id: "putt", label: "Putt", sub: "0–3 fot + lag", x: 50, y: 19, sg: 0.15, hit: { label: "Hullet", value: "93 %" }, attempts: "161 slag", okter: 9, slag: 310, trend: [6, 7, 7, 8, 8, 8, 9, 9] },
];

const fmtSg = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2).replace(".", ",")}`;

function HolePlaceholder() {
  return (
    <svg viewBox="0 0 100 160" preserveAspectRatio="xMidYMid slice" className="block h-auto w-full" aria-label="Hull · top-down">
      <rect width="100" height="160" fill="rgb(22 48 38)" />
      {/* spredt skog-tekstur */}
      {[[15, 30], [80, 22], [22, 70], [78, 64], [12, 110], [86, 100], [20, 140], [82, 138], [50, 8]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={9} fill="rgb(28 58 44)" />
      ))}
      {/* rough-kant */}
      <path d={PATH} fill="none" stroke="rgb(74 122 76)" strokeWidth={26} strokeLinecap="round" strokeLinejoin="round" />
      {/* fairway */}
      <path d={PATH} fill="none" stroke="rgb(120 174 102)" strokeWidth={18} strokeLinecap="round" strokeLinejoin="round" />
      {/* stripe-antydning */}
      <path d={PATH} fill="none" stroke="rgb(132 186 112)" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
      {/* bunkere */}
      <ellipse cx={33} cy={102} rx={5} ry={3.4} fill="rgb(216 200 160)" />
      <ellipse cx={64} cy={84} rx={5} ry={3.4} fill="rgb(216 200 160)" />
      <ellipse cx={58} cy={40} rx={4} ry={2.8} fill="rgb(216 200 160)" />
      {/* tee */}
      <rect x={46} y={146} width={8} height={8} rx={1.5} fill="rgb(96 146 84)" />
      {/* green */}
      <circle cx={50} cy={26} r={11} fill="rgb(150 196 112)" />
      <circle cx={50} cy={26} r={11} fill="none" stroke="rgb(120 174 102)" strokeWidth={1} />
      {/* shot-path */}
      <path d={PATH} fill="none" stroke="rgb(255 255 255)" strokeWidth={0.6} strokeDasharray="1.6 1.8" opacity={0.7} />
    </svg>
  );
}

export function HoleAnalysis() {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? CATS.find((c) => c.id === openId) ?? null : null;

  return (
    <div className="space-y-3">
      {/* Hull-header */}
      <div className="mx-auto flex w-full max-w-[440px] items-center justify-between rounded-full border border-border bg-card px-4 py-2">
        <span className="font-display text-sm font-bold tracking-tight text-foreground">Hull 4</span>
        <span className="font-mono text-[10px] font-bold uppercase tracking-[0.10em] text-muted-foreground">392 m · par 4</span>
      </div>

      <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[20px] border border-border bg-coach-sidebar shadow-card">
        <HolePlaceholder />

        {/* Green-flagg */}
        <span className="pointer-events-none absolute left-1/2 top-[14%] flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-card px-2 py-0.5 shadow-card">
          <Flag className="h-2.5 w-2.5 text-primary" strokeWidth={2} />
          <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-primary">Green</span>
        </span>

        {/* Kategori-markører langs hullet */}
        {CATS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setOpenId(c.id)}
            aria-label={c.label}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-5 w-5 rounded-full bg-accent/40 motion-safe:animate-ping" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-accent ring-2 ring-coach-sidebar" />
            </span>
            <span className="absolute left-1/2 top-[calc(100%+3px)] flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-card px-2 py-0.5 shadow-card">
              <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">{c.label}</span>
              <span className={cn("font-mono text-[10px] font-bold tabular-nums", c.sg >= 0 ? "text-success" : "text-destructive")}>{fmtSg(c.sg)}</span>
            </span>
          </button>
        ))}

        {/* Drill-down */}
        {open && (
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-border bg-card p-4 shadow-deck">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <AthleticEyebrow>{open.sub}</AthleticEyebrow>
                <h3 className="mt-0.5 font-display text-base font-bold tracking-tight text-foreground">{open.label}</h3>
              </div>
              <button type="button" onClick={() => setOpenId(null)} aria-label="Lukk" className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Stat icon={TrendingUp} label="SG" value={fmtSg(open.sg)} good={open.sg >= 0} />
              <Stat icon={Target} label={open.hit.label} value={open.hit.value} />
              <Stat icon={Activity} label="Forsøk" value={open.attempts} />
            </div>
            <div className="mt-3 flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5">
              <div>
                <div className="font-mono text-[9px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">Trening · 30 d</div>
                <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">{open.okter} økter · {open.slag} slag</div>
              </div>
              <Sparkline values={open.trend} width={96} height={32} />
            </div>
          </div>
        )}
      </div>

      <p className="mx-auto max-w-[440px] text-xs leading-[1.5] text-muted-foreground">
        Top-down-oversikt over hullet. Trykk en kategori langs shot-pathen for stats + treningsdata.
      </p>
    </div>
  );
}

function Stat({ icon: Icon, label, value, good }: { icon: typeof Target; label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg border border-border bg-background px-2.5 py-2">
      <div className="flex items-center gap-1 font-mono text-[8px] font-extrabold uppercase tracking-[0.06em] text-muted-foreground">
        <Icon className="h-2.5 w-2.5" strokeWidth={1.5} />{label}
      </div>
      <div className={cn("mt-1 font-mono text-base font-bold tabular-nums leading-none", good ? "text-success" : "text-foreground")}>{value}</div>
    </div>
  );
}
