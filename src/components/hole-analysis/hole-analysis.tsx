"use client";

import { useState } from "react";
import Image from "next/image";
import { X, TrendingUp, Target, Activity, Flag } from "lucide-react";
import { cn } from "@/lib/utils";
import { AthleticEyebrow } from "@/components/athletic/eyebrow";
import { Sparkline } from "@/components/athletic/sparkline";

/* ─────────────────────────────────────────────────────────────────────────
   Hull-analyse — TOP-DOWN-layout (ShotScope-stil) på ekte foto.
   Hele hullet sett ovenfra → konsistent målestokk, så markør-plassering blir
   riktig. Kategori-markører ligger langs shot-pathen fra tee (nederst) til
   green (øverst-høyre); trykk → SG + treningsdata per sone.

   Foto: public/images/akademy/hull-ovenfra.jpg (1073×1600, ratio 1.491).
   Marker-posisjon: x/y i % av rammen. Shot-path tegnes i SVG-overlay med
   viewBox 0 0 100 149.1 (= 100 × ratio) for uniform skalering — path-punkt
   = (x, y × 1.491).
   ───────────────────────────────────────────────────────────────────────── */

const RATIO = 1.491; // 1600 / 1073

// Shot-path langs fairway-senterlinjen (punkt = x, y×RATIO).
const PATH = "M43 119.3 Q44 108 46 98.4 Q49 88 50 77.5 Q53 66 57 56.7 Q60 49 62 41.7 Q65 34 68 26.8";

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
  { id: "tee", label: "Tee total", sub: "Driver · snitt 248 m", x: 43, y: 80, sg: 0.31, hit: { label: "Fairway", value: "64 %" }, attempts: "28 slag", okter: 8, slag: 142, trend: [3, 4, 3, 5, 6, 5, 7, 8] },
  { id: "inn200", label: "Innspill 200+", sub: "3-tre / hybrid", x: 46, y: 66, sg: -0.12, hit: { label: "GIR", value: "29 %" }, attempts: "14 slag", okter: 4, slag: 36, trend: [4, 3, 4, 3, 2, 3, 3, 2] },
  { id: "inn150", label: "Innspill 150–200", sub: "5–7 jern", x: 50, y: 52, sg: 0.08, hit: { label: "GIR", value: "48 %" }, attempts: "31 slag", okter: 6, slag: 88, trend: [3, 4, 4, 5, 4, 6, 5, 6] },
  { id: "inn100", label: "Innspill 100–150", sub: "8-jern – PW", x: 57, y: 38, sg: 0.22, hit: { label: "GIR", value: "61 %" }, attempts: "44 slag", okter: 9, slag: 156, trend: [4, 5, 5, 6, 6, 7, 7, 8] },
  { id: "near", label: "Nærspill 0–100", sub: "Chip / pitch", x: 62, y: 28, sg: 0.02, hit: { label: "≤ 2 m", value: "52 %" }, attempts: "89 slag", okter: 8, slag: 300, trend: [4, 4, 5, 5, 6, 5, 6, 7] },
  { id: "putt", label: "Putt", sub: "0–3 fot + lag", x: 68, y: 18, sg: 0.15, hit: { label: "Hullet", value: "93 %" }, attempts: "161 slag", okter: 9, slag: 310, trend: [6, 7, 7, 8, 8, 8, 9, 9] },
];

const fmtSg = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(2).replace(".", ",")}`;

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
        <Image
          src="/images/akademy/hull-ovenfra.jpg"
          alt="Hull 4 sett ovenfra"
          width={1073}
          height={1600}
          priority
          className="block h-auto w-full"
        />

        {/* Shot-path langs fairway */}
        <svg viewBox={`0 0 100 ${100 * RATIO}`} preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <path d={PATH} fill="none" stroke="rgb(255 255 255)" strokeWidth={0.7} strokeDasharray="1.6 1.8" strokeLinecap="round" opacity={0.85} />
        </svg>

        {/* Green-flagg */}
        <span className="pointer-events-none absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full bg-card px-2 py-0.5 shadow-card" style={{ left: "68%", top: "11%" }}>
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
