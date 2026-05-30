"use client";

import { useState } from "react";
import Image from "next/image";
import { X, ArrowLeft, TrendingUp, Target, Activity, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { Sparkline } from "@/components/athletic/sparkline";

/* ─────────────────────────────────────────────────────────────────────────
   Hull-analyse — kategori-oversikt på foto (uten spredning; perspektivet gjør
   spredning geometrisk upålitelig). Markører langs hullet fra tee til putt,
   hver med stats + treningsdata. Trykk green → fly opp / zoom inn på green-
   sonen der nærspill- og putt-kategoriene ligger.
   ───────────────────────────────────────────────────────────────────────── */

type Cat = {
  id: string;
  label: string;
  sub: string;
  sg: number;
  attempts: string;
  hit: { label: string; value: string };
  okter: number;
  slag: number;
  trend: number[];
};

type FairwayCat = Cat & { x: number; y: number };
type GreenCat = Cat & { gx: number; gy: number };

const FAIRWAY: FairwayCat[] = [
  { id: "tee", label: "Tee total", sub: "Driver · snitt 248 m", x: 50, y: 86, sg: 0.31, attempts: "28 slag", hit: { label: "Fairway", value: "64 %" }, okter: 8, slag: 142, trend: [3, 4, 3, 5, 6, 5, 7, 8] },
  { id: "inn200", label: "Innspill 200+", sub: "3-tre / hybrid", x: 50, y: 60, sg: -0.12, attempts: "14 slag", hit: { label: "GIR", value: "29 %" }, okter: 4, slag: 36, trend: [4, 3, 4, 3, 2, 3, 3, 2] },
  { id: "inn150", label: "Innspill 150–200", sub: "5–7 jern", x: 49, y: 49, sg: 0.08, attempts: "31 slag", hit: { label: "GIR", value: "48 %" }, okter: 6, slag: 88, trend: [3, 4, 4, 5, 4, 6, 5, 6] },
  { id: "inn100", label: "Innspill 100–150", sub: "8-jern – PW", x: 50, y: 39, sg: 0.22, attempts: "44 slag", hit: { label: "GIR", value: "61 %" }, okter: 9, slag: 156, trend: [4, 5, 5, 6, 6, 7, 7, 8] },
];

const GREEN: GreenCat[] = [
  { id: "near30", label: "Nærspill 30–100 m", sub: "Wedge-pitch", sg: -0.05, attempts: "37 slag", hit: { label: "≤ 3 m", value: "41 %" }, okter: 7, slag: 120, trend: [3, 3, 4, 3, 4, 4, 5, 4], gx: 26, gy: 30 },
  { id: "near0", label: "Nærspill 0–30 m", sub: "Chip / pitch", sg: 0.04, attempts: "52 slag", hit: { label: "≤ 1,5 m", value: "55 %" }, okter: 8, slag: 180, trend: [4, 4, 5, 5, 6, 5, 6, 7], gx: 72, gy: 34 },
  { id: "puttlag", label: "Putt 3 m +", sub: "Lag-putt", sg: 0.11, attempts: "63 slag", hit: { label: "2-putt", value: "88 %" }, okter: 9, slag: 240, trend: [5, 5, 6, 6, 7, 7, 8, 8], gx: 34, gy: 62 },
  { id: "putt3", label: "Putt 0–3 fot", sub: "Kort putt", sg: 0.18, attempts: "98 slag", hit: { label: "Hullet", value: "96 %" }, okter: 9, slag: 310, trend: [6, 7, 7, 8, 8, 8, 9, 9], gx: 64, gy: 66 },
];

const ALL = [...FAIRWAY, ...GREEN];
const fmtSg = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2).replace(".", ",")}`;

function CatPill({ label, sg, onClick, className, style }: { label: string; sg: number; onClick: () => void; className?: string; style?: React.CSSProperties }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={style}
      className={cn("group absolute -translate-x-1/2 -translate-y-1/2", className)}
    >
      <span className="relative flex items-center justify-center">
        <span className="absolute inline-flex h-5 w-5 rounded-full bg-accent/40 motion-safe:animate-ping" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-accent ring-2 ring-coach-sidebar" />
      </span>
      <span className="absolute left-1/2 top-[calc(100%+3px)] flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-card px-2 py-0.5 shadow-card">
        <span className="font-mono text-[8px] font-extrabold uppercase tracking-[0.10em] text-muted-foreground">{label}</span>
        <span className={cn("font-mono text-[10px] font-bold tabular-nums", sg >= 0 ? "text-success" : "text-destructive")}>{fmtSg(sg)}</span>
      </span>
    </button>
  );
}

export function HoleAnalysis() {
  const [zoomed, setZoomed] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = openId ? ALL.find((c) => c.id === openId) ?? null : null;

  return (
    <div className="space-y-3">
      <div className="relative mx-auto w-full max-w-[440px] overflow-hidden rounded-[20px] border border-border bg-coach-sidebar shadow-card">
        {/* Zoom-bart bildelag */}
        <div
          className="transition-transform duration-500 ease-out"
          style={{ transformOrigin: "50% 16%", transform: zoomed ? "scale(2.6)" : "scale(1)" }}
        >
          <Image src="/images/akademy/hull-ovenfra.jpg" alt="Hull ovenfra" width={781} height={1400} priority className="block h-auto w-full select-none" />
        </div>

        {/* Topp-eyebrow */}
        <div className="pointer-events-none absolute left-3 top-3 rounded-full bg-coach-sidebar/70 px-2.5 py-1 backdrop-blur-sm">
          <AthleticEyebrow tone="light">{zoomed ? "Green · nærspill + putt" : "Hull 4 · 392 m · par 4"}</AthleticEyebrow>
        </div>

        {/* ── Oversikt: fairway-kategorier + green-hotspot ── */}
        {!zoomed && (
          <>
            {FAIRWAY.map((c) => (
              <CatPill key={c.id} label={c.label} sg={c.sg} onClick={() => setOpenId(c.id)} style={{ left: `${c.x}%`, top: `${c.y}%` }} />
            ))}
            {/* Green-hotspot */}
            <button
              type="button"
              onClick={() => setZoomed(true)}
              aria-label="Zoom inn på green"
              className="absolute left-1/2 top-[19%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            >
              <span className="h-16 w-24 rounded-[50%] border border-accent/70 bg-accent/15 backdrop-blur-[1px]" />
              <span className="-mt-9 inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 shadow-card">
                <span className="font-mono text-[9px] font-extrabold uppercase tracking-[0.10em] text-primary">Green</span>
                <ChevronRight className="h-3 w-3 text-primary" strokeWidth={2} />
              </span>
            </button>
          </>
        )}

        {/* ── Green-zoom: nærspill + putt-kategorier ── */}
        {zoomed && (
          <>
            {GREEN.map((c) => (
              <CatPill key={c.id} label={c.label} sg={c.sg} onClick={() => setOpenId(c.id)} style={{ left: `${c.gx}%`, top: `${c.gy}%` }} />
            ))}
            <button
              type="button"
              onClick={() => { setZoomed(false); setOpenId(null); }}
              className="absolute left-3 top-12 inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 font-mono text-[10px] font-extrabold uppercase tracking-[0.10em] text-foreground shadow-card"
            >
              <ArrowLeft className="h-3 w-3" strokeWidth={2} />Hele hullet
            </button>
          </>
        )}

        {/* ── Drill-down: stats + treningsdata (ingen spredning) ── */}
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
        Trykk en kategori for stats + treningsdata. Trykk <b className="text-foreground">Green</b> for å zoome inn på nærspill- og putt-sonene.
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
